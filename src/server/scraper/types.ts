import { z } from 'zod';

export type ScrapeMethod = 'readability' | 'playwright';

export type ExtractedArticle = {
  /** URL final setelah redirect. */
  url: string;
  /** URL asli yang dikirim user. */
  requestedUrl: string;
  title: string;
  /** Teks bersih, paragraf dipisah baris kosong. */
  content: string;
  /** HTML hasil Readability — dipakai kalau nanti butuh struktur. */
  contentHtml: string;
  excerpt: string | null;
  author: string | null;
  /** ISO 8601, atau null kalau tidak ketemu. */
  publishedAt: string | null;
  /** Nama publisher, mis. "Kompas.com". */
  source: string | null;
  imageUrl: string | null;
  lang: string | null;
  wordCount: number;
  scrapedVia: ScrapeMethod;
  durationMs: number;
  /** Catatan non-fatal, mis. "publishedAt tidak ditemukan". */
  warnings: string[];
};

export const extractRequestSchema = z.object({
  url: z.string().trim().min(1, 'URL wajib diisi').max(2048, 'URL terlalu panjang'),
  /** Paksa Playwright walau ekstraksi statis berhasil (untuk debugging). */
  forceBrowser: z.boolean().optional(),
});

export type ExtractRequest = z.infer<typeof extractRequestSchema>;
