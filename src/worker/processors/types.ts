import type { Article } from '@prisma/client';
import type { ArticleInput } from '@/server/ai';

export type StepContext = { runId: string; jobId: string };

/** Baris Article (Date) → bentuk yang dipakai lapisan AI (ISO string). */
export function toArticleInput(article: Article): ArticleInput {
  return {
    title: article.title,
    content: article.content,
    url: article.url,
    source: article.source,
    author: article.author,
    publishedAt: article.publishedAt ? article.publishedAt.toISOString() : null,
    wordCount: article.wordCount ?? 0,
  };
}
