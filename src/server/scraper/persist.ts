import { db } from '@/server/db';
import type { ExtractedArticle } from '@/server/scraper/types';

/**
 * Simpan hasil ekstraksi. Unik per (userId, url) — meng-scrape ulang URL yang
 * sama memperbarui record lama, bukan menumpuk duplikat.
 */
export async function upsertArticle(userId: string, article: ExtractedArticle) {
  const data = {
    title: article.title,
    content: article.content,
    excerpt: article.excerpt,
    author: article.author,
    publishedAt: article.publishedAt ? new Date(article.publishedAt) : null,
    source: article.source,
    imageUrl: article.imageUrl,
    lang: article.lang,
    wordCount: article.wordCount,
    scrapedVia: article.scrapedVia,
  };

  return db.article.upsert({
    where: { userId_url: { userId, url: article.url } },
    update: data,
    create: { ...data, url: article.url, userId },
  });
}
