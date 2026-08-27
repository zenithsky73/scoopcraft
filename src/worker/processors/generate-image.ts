import { db } from '@/server/db';
import { resolveCoverVisual, resolveSlideVisual } from '@/server/images';
import { slidesFromJson } from '@/server/design/slides-json';
import { FORMAT_SPECS } from '@/config/formats';
import type { StepContext } from '@/worker/processors/types';

/**
 * Membuat gambar untuk SATU slide. Satu job per slide, berjalan paralel —
 * carousel 5 slide berarti 4 gambar berbeda (penutup tidak pakai gambar).
 *
 * Slide 0 memakai foto artikel kalau lolos penilaian; sisanya selalu dibuat
 * AI dari prompt milik slide itu sendiri, sehingga tiap slide benar-benar
 * memvisualisasikan poinnya, bukan mengulang gambar yang sama.
 */
export async function processGenerateImage({ runId, jobId }: StepContext) {
  const job = await db.job.findUniqueOrThrow({ where: { id: jobId } });
  const slideIndex = (job.payload as { slideIndex?: number } | null)?.slideIndex ?? 0;

  const run = await db.generationRun.findUniqueOrThrow({
    where: { id: runId },
    include: { article: true, generatedContent: true },
  });

  const content = run.generatedContent;
  if (!content) throw new Error('Konten belum tersedia.');

  const tallest =
    run.requestedFormats.map((format) => FORMAT_SPECS[format]).sort((a, b) => b.height - a.height)[0] ??
    FORMAT_SPECS.FEED_SQUARE;

  const visual =
    slideIndex === 0
      ? await resolveCoverVisual({
          contentId: content.id,
          articleImageUrl: run.article?.imageUrl ?? null,
          visualPrompt: content.visualPrompt,
          width: tallest.width,
          height: tallest.height,
        })
      : await resolveSlideVisual({
          contentId: content.id,
          slideIndex,
          // slides[0] adalah poin pertama, yang tampil di slide ke-1.
          prompt: slidesFromJson(content.slides)[slideIndex - 1]?.visualPrompt ?? null,
          width: tallest.width,
          height: tallest.height,
        });

  await db.contentVisual.upsert({
    where: { generatedContentId_slideIndex: { generatedContentId: content.id, slideIndex } },
    update: {
      source: visual.source,
      imageUrl: visual.url,
      prompt: visual.prompt,
      provider: visual.provider,
      relevanceScore: visual.relevanceScore,
      error: null,
    },
    create: {
      generatedContentId: content.id,
      slideIndex,
      source: visual.source,
      imageUrl: visual.url,
      prompt: visual.prompt,
      provider: visual.provider,
      relevanceScore: visual.relevanceScore,
    },
  });

  // Slide pembuka dicerminkan ke GeneratedContent untuk thumbnail riwayat.
  if (slideIndex === 0) {
    await db.generatedContent.update({
      where: { id: content.id },
      data: {
        imageSource: visual.source,
        visualUrl: visual.url,
        relevanceScore: visual.relevanceScore,
      },
    });
  }

  return {
    slideIndex,
    source: visual.source,
    url: visual.url,
    provider: visual.provider,
    notes: visual.notes,
  };
}
