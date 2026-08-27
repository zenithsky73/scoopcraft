/**
 * Bentuk artikel minimal yang dibutuhkan lapisan AI. Dipenuhi oleh hasil
 * scraper (ExtractedArticle) maupun baris Article dari database, sehingga
 * pipeline tidak perlu menyimpan ulang HTML hanya untuk memanggil AI.
 */
export type ArticleInput = {
  title: string;
  content: string;
  url: string;
  source: string | null;
  author: string | null;
  /** ISO 8601 atau null. */
  publishedAt: string | null;
  wordCount: number;
};
