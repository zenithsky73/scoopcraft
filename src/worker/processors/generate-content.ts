import { db } from '@/server/db';
import { generateContent, analysisSchema } from '@/server/ai';
import { toArticleInput } from '@/worker/processors/types';
import type { StepContext } from '@/worker/processors/types';

export async function processGenerateContent({ runId }: StepContext) {
  const run = await db.generationRun.findUniqueOrThrow({
    where: { id: runId },
    include: { article: true, jobs: { where: { type: 'ANALYZE', status: 'DONE' }, orderBy: { createdAt: 'desc' }, take: 1 } },
  });

  if (!run.article) throw new Error('Artikel belum tersedia.');

  const analyzeResult = run.jobs[0]?.result as { analysis?: unknown } | null;
  const parsed = analysisSchema.safeParse(analyzeResult?.analysis);
  if (!parsed.success) throw new Error('Hasil analisis tidak ditemukan atau rusak.');

  const analysis = parsed.data;
  const { copy, warnings, usage } = await generateContent(toArticleInput(run.article), analysis);

  const content = await db.generatedContent.create({
    data: {
      articleId: run.article.id,
      headline: copy.headline,
      feedCopy: copy.feedCopy,
      caption: copy.caption,
      hashtags: copy.hashtags,
      cta: copy.cta,
      angle: copy.angle,
      slides: copy.slides,
      analysis,
      // Dipakai visual engine di modul 4 kalau gambar artikel tidak layak.
      visualPrompt: analysis.visualPrompt,
    },
  });

  await db.generationRun.update({
    where: { id: runId },
    data: { generatedContentId: content.id },
  });

  return { generatedContentId: content.id, altText: copy.altText, warnings, usage };
}
