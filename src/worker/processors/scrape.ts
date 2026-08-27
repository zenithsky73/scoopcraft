import { db } from '@/server/db';
import { extractArticle } from '@/server/scraper';
import { upsertArticle } from '@/server/scraper/persist';
import type { StepContext } from '@/worker/processors/types';

export async function processScrape({ runId }: StepContext) {
  const run = await db.generationRun.findUniqueOrThrow({ where: { id: runId } });

  const article = await extractArticle({ url: run.sourceUrl });
  const saved = await upsertArticle(run.userId, article);

  await db.generationRun.update({ where: { id: runId }, data: { articleId: saved.id } });

  return {
    articleId: saved.id,
    title: article.title,
    source: article.source,
    wordCount: article.wordCount,
    scrapedVia: article.scrapedVia,
    durationMs: article.durationMs,
    warnings: article.warnings,
  };
}
