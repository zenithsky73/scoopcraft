import { NextResponse } from 'next/server';
import { getViewer } from '@/server/viewer';
import { getRun } from '@/server/pipeline/run-service';
import { planSteps, STEP_LABELS } from '@/server/pipeline/steps';
import { slidesFromJson } from '@/server/design/slides-json';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Dipoll frontend saat pipeline berjalan. Bentuk responsnya sengaja siap
 * pakai untuk progress tracker: satu baris per tahap, status sudah final,
 * dan tahap yang bercabang (render per format) sudah diringkas jadi
 * "berapa dari berapa" — frontend tidak perlu menggabungkan apa pun.
 */
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const viewer = await getViewer();
  if (!viewer) {
    return NextResponse.json({ error: 'Silakan masuk terlebih dahulu.' }, { status: 401 });
  }

  const run = await getRun(params.id, viewer.user.id);
  if (!run) return NextResponse.json({ error: 'Proses tidak ditemukan.' }, { status: 404 });

  const plan = planSteps({
    styles: run.requestedStyles,
    formats: run.requestedFormats,
    slides: run.requestedSlides,
  });

  const steps = plan.map((step) => {
    const jobs = run.jobs.filter((job) => job.type === step.type);
    const done = jobs.filter((job) => job.status === 'DONE').length;
    const failed = jobs.filter((job) => job.status === 'FAILED').length;

    let status: 'QUEUED' | 'PROCESSING' | 'DONE' | 'PARTIAL' | 'FAILED' = 'QUEUED';
    if (jobs.some((job) => job.status === 'PROCESSING')) status = 'PROCESSING';
    else if (done === step.count) status = 'DONE';
    else if (done + failed === step.count) status = done > 0 ? 'PARTIAL' : 'FAILED';

    const started = jobs.map((job) => job.startedAt?.getTime()).filter(Boolean) as number[];
    const finished = jobs.map((job) => job.finishedAt?.getTime()).filter(Boolean) as number[];

    return {
      type: step.type,
      label: STEP_LABELS[step.type],
      status,
      done,
      total: step.count,
      error: jobs.find((job) => job.error)?.error ?? null,
      // Tahap bercabang: rentang dari job paling awal mulai sampai paling akhir selesai.
      durationMs:
        started.length && finished.length === jobs.length ? Math.max(...finished) - Math.min(...started) : null,
    };
  });

  return NextResponse.json({
    id: run.id,
    status: run.status,
    stepsDone: run.stepsDone,
    stepsTotal: run.stepsTotal,
    error: run.error,
    sourceUrl: run.sourceUrl,
    requestedStyles: run.requestedStyles,
    requestedFormats: run.requestedFormats,
    requestedSlides: run.requestedSlides,
    steps,
    article: run.article,
    content: run.generatedContent
      ? {
          id: run.generatedContent.id,
          headline: run.generatedContent.headline,
          feedCopy: run.generatedContent.feedCopy,
          caption: run.generatedContent.caption,
          hashtags: run.generatedContent.hashtags,
          cta: run.generatedContent.cta,
          angle: run.generatedContent.angle,
          slides: slidesFromJson(run.generatedContent.slides),
          imageSource: run.generatedContent.imageSource,
          visualUrl: run.generatedContent.visualUrl,
          assets: run.generatedContent.assets,
        }
      : null,
  });
}
