import { db } from '@/server/db';
import { analyzeArticle } from '@/server/ai';
import { toArticleInput } from '@/worker/processors/types';
import type { StepContext } from '@/worker/processors/types';

export async function processAnalyze({ runId }: StepContext) {
  const run = await db.generationRun.findUniqueOrThrow({
    where: { id: runId },
    include: { article: true },
  });

  if (!run.article) throw new Error('Artikel belum tersedia untuk dianalisis.');

  const { analysis, usage } = await analyzeArticle(toArticleInput(run.article));

  // Hasil analisis disimpan di Job.result, bukan tabel terpisah — step
  // berikutnya membacanya dari sini.
  return { analysis, usage };
}
