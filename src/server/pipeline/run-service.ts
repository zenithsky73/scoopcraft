import type { DesignStyle, JobType, OutputFormat, Prisma } from '@prisma/client';
import { db } from '@/server/db';
import { planSteps, nextStep, totalSteps, type PlannedStep } from '@/server/pipeline/steps';
import { enqueueStep } from '@/server/queue';
import { FORMAT_SPECS } from '@/config/formats';
import { buildDeck, slidesNeedingVisual, SLIDES } from '@/server/design/deck';
import { slidesFromJson } from '@/server/design/slides-json';
import { consumeQuota } from '@/server/billing/quota';

/**
 * Semua transisi status GenerationRun dan Job melewati modul ini, supaya
 * aturan "kapan run dianggap selesai" hanya ada di satu tempat.
 */

export async function createRun(input: {
  userId: string;
  url: string;
  styles: DesignStyle[];
  formats: OutputFormat[];
  slides?: number;
}) {
  const slides = input.slides ?? SLIDES.default;
  const plan = planSteps({ styles: input.styles, formats: input.formats, slides });

  const run = await db.$transaction(async (tx) => {
    const created = await tx.generationRun.create({
      data: {
        userId: input.userId,
        sourceUrl: input.url,
        status: 'PENDING',
        requestedStyles: input.styles,
        requestedFormats: input.formats,
        requestedSlides: slides,
        stepsTotal: totalSteps(plan),
        jobs: { create: { type: plan[0].type, status: 'QUEUED', payload: { url: input.url } } },
      },
      include: { jobs: true },
    });

    // Kuota diperiksa dan dipotong di dalam transaksi yang sama dengan
    // pembuatan run: kalau ditolak, tidak ada run yatim yang tertinggal.
    await consumeQuota(tx, input.userId);

    return created;
  });

  await enqueueStep({ runId: run.id, jobId: run.jobs[0].id, type: run.jobs[0].type });
  return run;
}

export async function startJob(jobId: string) {
  const job = await db.job.update({
    where: { id: jobId },
    data: { status: 'PROCESSING', startedAt: new Date(), attempts: { increment: 1 } },
    include: { run: true },
  });

  if (job.run?.status === 'PENDING') {
    await db.generationRun.update({
      where: { id: job.run.id },
      data: { status: 'PROCESSING', startedAt: new Date() },
    });
  }

  return job;
}

export async function completeJob(jobId: string, result: Prisma.InputJsonValue) {
  const job = await db.job.update({
    where: { id: jobId },
    data: { status: 'DONE', result, finishedAt: new Date() },
  });

  if (!job.runId) return;
  await db.generationRun.update({ where: { id: job.runId }, data: { stepsDone: { increment: 1 } } });
  await advanceRun(job.runId, job.type);
}

/**
 * @param final true kalau tidak ada percobaan ulang lagi.
 *
 * Kegagalan pada tahap bercabang tidak menjatuhkan seluruh run:
 *  - RENDER_DESIGN : format lain bisa saja berhasil, teksnya sudah jadi
 *  - GENERATE_IMAGE: template punya latar cadangan, slide tetap bisa dirender
 *
 * Run seperti itu berakhir PARTIAL — user tetap bisa memakai yang berhasil.
 */
export async function failJob(jobId: string, error: string, final: boolean) {
  const message = error.slice(0, 500);

  const job = await db.job.update({
    where: { id: jobId },
    data: {
      status: final ? 'FAILED' : 'QUEUED',
      error: message,
      finishedAt: final ? new Date() : null,
    },
  });

  if (!final || !job.runId) return;

  if (job.type === 'RENDER_DESIGN') {
    const assetId = (job.payload as { assetId?: string } | null)?.assetId;
    if (assetId) {
      await db.designAsset.update({ where: { id: assetId }, data: { status: 'FAILED', error: message } });
    }
    await advanceRun(job.runId, job.type);
    return;
  }

  if (job.type === 'GENERATE_IMAGE') {
    // Gambar gagal bukan alasan membatalkan konten — lanjut ke render dengan
    // latar cadangan, dan biarkan run berakhir PARTIAL.
    await advanceRun(job.runId, job.type);
    return;
  }

  await db.generationRun.update({
    where: { id: job.runId },
    data: { status: 'FAILED', error: message, completedAt: new Date() },
  });
}

/**
 * Dipanggil setiap kali satu job tahap `afterType` berakhir. Tahap berikutnya
 * baru dimulai kalau seluruh job di tahap ini sudah tidak berjalan lagi.
 */
async function advanceRun(runId: string, afterType: JobType) {
  const created = await db.$transaction(async (tx) => {
    // Kunci tingkat run. Tanpa ini, beberapa job yang selesai hampir
    // bersamaan sama-sama lolos pemeriksaan "tahap ini sudah beres" dan
    // masing-masing membuat tahap berikutnya — 4 job gambar menghasilkan
    // 4 salinan tahap render.
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${runId}))`;

    const run = await tx.generationRun.findUniqueOrThrow({
      where: { id: runId },
      include: { jobs: true },
    });

    const stillRunning = run.jobs.some(
      (job) => job.type === afterType && (job.status === 'QUEUED' || job.status === 'PROCESSING'),
    );
    if (stillRunning) return [];

    const plan = planSteps({
      styles: run.requestedStyles,
      formats: run.requestedFormats,
      slides: run.requestedSlides,
    });
    const next = nextStep(plan, afterType);

    if (!next) {
      // Sudah ditutup oleh job lain yang menang balapan.
      if (run.completedAt) return [];

      const anyFailed = run.jobs.some((job) => job.status === 'FAILED');
      const anyRendered = run.jobs.some((job) => job.type === 'RENDER_DESIGN' && job.status === 'DONE');

      await tx.generationRun.update({
        where: { id: runId },
        data: {
          status: anyFailed ? (anyRendered ? 'PARTIAL' : 'FAILED') : 'DONE',
          completedAt: new Date(),
          error: anyFailed && !anyRendered ? 'Semua render gagal.' : null,
        },
      });
      return [];
    }

    // Pagar kedua: kalau tahap berikutnya sudah punya job, jangan dibuat lagi.
    if (run.jobs.some((job) => job.type === next.type)) return [];

    return createStepJobs(tx, run.id, next, {
      styles: run.requestedStyles,
      formats: run.requestedFormats,
      slides: run.requestedSlides,
      generatedContentId: run.generatedContentId,
    });
  });

  // Antrean diisi di luar transaksi: kalau transaksinya batal, job yang
  // sudah terlanjur masuk antrean akan menunjuk baris yang tidak ada.
  await Promise.all(created.map((job) => enqueueStep({ runId, jobId: job.id, type: job.type })));
}

/**
 * Membuat baris Job untuk satu tahap. Khusus RENDER_DESIGN, baris DesignAsset
 * dibuat lebih dulu (status PENDING) supaya dashboard bisa menampilkan
 * kerangka pratinjau sebelum gambarnya jadi.
 */
async function createStepJobs(
  tx: Prisma.TransactionClient,
  runId: string,
  step: PlannedStep,
  context: {
    styles: DesignStyle[];
    formats: OutputFormat[];
    slides: number;
    generatedContentId: string | null;
  },
) {
  const fanOut = step.type === 'RENDER_DESIGN' || step.type === 'GENERATE_IMAGE';

  if (!fanOut) {
    const job = await tx.job.create({ data: { runId, type: step.type, status: 'QUEUED', payload: {} } });
    return [job];
  }

  if (!context.generatedContentId) throw new Error('Konten belum tersedia.');

  const content = await tx.generatedContent.findUniqueOrThrow({ where: { id: context.generatedContentId } });

  // Deck bisa lebih pendek dari yang diminta kalau AI menghasilkan poin lebih
  // sedikit; yang dipakai adalah panjang sebenarnya.
  const deck = buildDeck(
    {
      headline: content.headline,
      feedCopy: content.feedCopy,
      cta: content.cta,
      slides: slidesFromJson(content.slides),
    },
    context.slides,
  );

  const jobs = [];

  // Satu job gambar per slide yang butuh visual sendiri.
  if (step.type === 'GENERATE_IMAGE') {
    for (const slide of slidesNeedingVisual(deck)) {
      jobs.push(
        await tx.job.create({
          data: {
            runId,
            type: 'GENERATE_IMAGE',
            status: 'QUEUED',
            payload: { slideIndex: slide.index },
          },
        }),
      );
    }

    await syncStepsTotal(tx, runId, context, jobs.length, 'GENERATE_IMAGE');
    return jobs;
  }

  for (const style of context.styles) {
    for (const format of context.formats) {
      const spec = FORMAT_SPECS[format];

      for (const slide of deck) {
        const asset = await tx.designAsset.upsert({
          where: {
            generatedContentId_style_format_slideIndex: {
              generatedContentId: content.id,
              style,
              format,
              slideIndex: slide.index,
            },
          },
          update: { status: 'PENDING', error: null, slideType: slide.type, version: { increment: 1 } },
          create: {
            generatedContentId: content.id,
            style,
            format,
            width: spec.width,
            height: spec.height,
            slideIndex: slide.index,
            slideType: slide.type,
            status: 'PENDING',
          },
        });

        jobs.push(
          await tx.job.create({
            data: {
              runId,
              type: 'RENDER_DESIGN',
              status: 'QUEUED',
              payload: { assetId: asset.id, style, format, slideIndex: slide.index },
            },
          }),
        );
      }
    }
  }

  // Aset yang sudah tidak dipakai lagi (deck mengecil saat render ulang) dibuang.
  await tx.designAsset.deleteMany({
    where: { generatedContentId: content.id, slideIndex: { gte: deck.length } },
  });

  await syncStepsTotal(tx, runId, context, jobs.length, 'RENDER_DESIGN');
  return jobs;
}

/**
 * Jumlah job sebenarnya pada tahap bercabang baru diketahui setelah naskah
 * slide ada. `stepsTotal` disesuaikan supaya progress "x dari y" tidak
 * berhenti di angka yang mustahil tercapai.
 */
async function syncStepsTotal(
  tx: Prisma.TransactionClient,
  runId: string,
  context: { styles: DesignStyle[]; formats: OutputFormat[]; slides: number },
  actual: number,
  stepType: JobType,
) {
  const planned = planSteps(context);
  const estimated = planned.find((step) => step.type === stepType)?.count ?? actual;
  const delta = actual - estimated;
  if (delta === 0) return;

  await tx.generationRun.update({
    where: { id: runId },
    data: { stepsTotal: { increment: delta } },
  });
}

/**
 * Render ulang setelah teks diedit. Tidak memotong kuota: user sudah membayar
 * saat generate, dan memperbaiki typo tidak boleh menghabiskan jatah.
 *
 * Job render lama dihapus, bukan disimpan — riwayat percobaan render tidak
 * berguna, dan menyisakannya membuat hitungan "x dari y" salah.
 */
export async function rerenderContent(contentId: string, userId: string) {
  const run = await db.generationRun.findFirst({
    where: { generatedContentId: contentId, userId },
    orderBy: { createdAt: 'desc' },
  });

  if (!run) throw new Error('Proses untuk konten ini tidak ditemukan.');

  await db.job.deleteMany({ where: { runId: run.id, type: 'RENDER_DESIGN' } });
  const doneBefore = await db.job.count({ where: { runId: run.id, status: 'DONE' } });

  await db.generationRun.update({
    where: { id: run.id },
    data: { status: 'PROCESSING', error: null, completedAt: null, stepsDone: doneBefore },
  });

  const jobs = await db.$transaction((tx) =>
    createStepJobs(tx, run.id, { type: 'RENDER_DESIGN', count: 0 },
    {
      styles: run.requestedStyles,
      formats: run.requestedFormats,
      slides: run.requestedSlides,
      generatedContentId: contentId,
    }),
  );

  await Promise.all(jobs.map((job) => enqueueStep({ runId: run.id, jobId: job.id, type: job.type })));
  return { runId: run.id, jobs: jobs.length };
}

export function getRun(runId: string, userId: string) {
  return db.generationRun.findFirst({
    where: { id: runId, userId },
    include: {
      jobs: { orderBy: { createdAt: 'asc' } },
      article: {
        select: { id: true, title: true, source: true, imageUrl: true, publishedAt: true, wordCount: true },
      },
      generatedContent: {
        include: {
          assets: {
            orderBy: [{ style: 'asc' }, { format: 'asc' }, { slideIndex: 'asc' }],
            select: {
              id: true,
              style: true,
              format: true,
              slideIndex: true,
              slideType: true,
              status: true,
              imageUrl: true,
              width: true,
              height: true,
              error: true,
            },
          },
        },
      },
    },
  });
}

export type RunStatusPayload = Awaited<ReturnType<typeof getRun>>;

/** Job yang tersangkut karena proses worker mati di tengah jalan. */
export async function reapStaleJobs(olderThanMs = 10 * 60_000) {
  const cutoff = new Date(Date.now() - olderThanMs);
  const stale = await db.job.findMany({
    where: { status: 'PROCESSING', startedAt: { lt: cutoff } },
    select: { id: true },
  });

  for (const job of stale) {
    await failJob(job.id, 'Job melewati batas waktu dan dianggap gagal.', true);
  }

  return stale.length;
}
