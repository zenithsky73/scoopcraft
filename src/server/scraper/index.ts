import { SCRAPER } from '@/server/scraper/config';
import { ScrapeError, isScrapeError } from '@/server/scraper/errors';
import { fetchHtml } from '@/server/scraper/fetch-html';
import { parseArticle, looksJsRendered, looksPaywalled, type ParsedArticle } from '@/server/scraper/readability';
import { normalizeUrl } from '@/server/scraper/url-guard';
import type { ExtractedArticle, ExtractRequest, ScrapeMethod } from '@/server/scraper/types';

import { isYouTubeUrl, extractYouTubeVideo } from '@/server/scraper/youtube';

export * from '@/server/scraper/types';
export { ScrapeError, isScrapeError } from '@/server/scraper/errors';

/**
 * Jalur statis dianggap gagal kalau salah satu benar:
 *  - Readability menilai halaman tidak "readerable"
 *  - isi terlalu pendek (situs SPA sering hanya mengirim kerangka)
 *  - HTML memuat pesan "aktifkan JavaScript"
 */
function needsBrowser(parsed: ParsedArticle, html: string): string | null {
  if (looksJsRendered(html)) return 'halaman meminta JavaScript';
  if (!parsed.readerable) return 'readability menilai halaman bukan artikel';
  if (parsed.wordCount < SCRAPER.minWordsStatic) return `isi statis terlalu pendek (${parsed.wordCount} kata)`;
  return null;
}

function toResult(
  parsed: ParsedArticle,
  finalUrl: URL,
  requestedUrl: string,
  via: ScrapeMethod,
  startedAt: number,
  warnings: string[],
): ExtractedArticle {
  return {
    url: finalUrl.href,
    requestedUrl,
    title: parsed.title,
    content: parsed.content,
    contentHtml: parsed.contentHtml,
    excerpt: parsed.excerpt,
    author: parsed.author,
    publishedAt: parsed.publishedAt,
    source: parsed.source,
    imageUrl: parsed.imageUrl,
    lang: parsed.lang,
    wordCount: parsed.wordCount,
    scrapedVia: via,
    durationMs: Date.now() - startedAt,
    warnings,
  };
}

export async function extractArticle({ url, forceBrowser = false }: ExtractRequest): Promise<ExtractedArticle> {
  const startedAt = Date.now();
  const requested = normalizeUrl(url);
  const warnings: string[] = [];

  // ── Jalur YouTube ───────────────────────────────────────────────────────
  if (isYouTubeUrl(requested)) {
    return extractYouTubeVideo(url);
  }

  // ── Jalur browser langsung (debug / dipaksa) ────────────────────────────
  if (forceBrowser) {
    if (!SCRAPER.browserFallbackEnabled) throw new ScrapeError('BROWSER_UNAVAILABLE', 'fallback dimatikan');
    const { renderHtml } = await import('@/server/scraper/playwright');
    const rendered = await renderHtml(requested);
    const parsed = parseArticle(rendered.html, rendered.finalUrl);
    return finalize(parsed, rendered.finalUrl, url, 'playwright', startedAt, warnings);
  }

  // ── Jalur statis ────────────────────────────────────────────────────────
  const page = await fetchHtml(requested);
  const staticParsed = parseArticle(page.html, page.finalUrl);

  const reason = needsBrowser(staticParsed, page.html);
  if (!reason) {
    return finalize(staticParsed, page.finalUrl, url, 'readability', startedAt, warnings);
  }

  if (!SCRAPER.browserFallbackEnabled || process.env.VERCEL) {
    warnings.push(`Fallback browser dimatikan (${reason}).`);
    return finalize(staticParsed, page.finalUrl, url, 'readability', startedAt, warnings);
  }

  // ── Fallback Playwright ─────────────────────────────────────────────────
  try {
    const { renderHtml } = await import('@/server/scraper/playwright');
    const rendered = await renderHtml(page.finalUrl);
    const browserParsed = parseArticle(rendered.html, rendered.finalUrl);

    // Render tidak selalu lebih baik — pakai yang isinya lebih banyak.
    if (browserParsed.wordCount > staticParsed.wordCount) {
      warnings.push(`Fallback browser dipakai: ${reason}.`);
      return finalize(browserParsed, rendered.finalUrl, url, 'playwright', startedAt, warnings);
    }

    warnings.push('Render browser tidak menambah isi; hasil statis dipakai.');
    return finalize(staticParsed, page.finalUrl, url, 'readability', startedAt, warnings);
  } catch (err) {
    // Kegagalan browser tidak boleh membatalkan hasil statis yang sudah cukup.
    if (isScrapeError(err)) {
      warnings.push(`Fallback browser gagal (${err.code}); hasil statis dipakai.`);
    } else {
      warnings.push('Fallback browser gagal; hasil statis dipakai.');
    }
    return finalize(staticParsed, page.finalUrl, url, 'readability', startedAt, warnings);
  }
}

/** Validasi mutu terakhir — satu tempat, berlaku untuk kedua jalur. */
function finalize(
  parsed: ParsedArticle,
  finalUrl: URL,
  requestedUrl: string,
  via: ScrapeMethod,
  startedAt: number,
  warnings: string[],
): ExtractedArticle {
  if (parsed.wordCount < SCRAPER.minWordsAccept) {
    throw looksPaywalled(parsed.content) ? new ScrapeError('PAYWALL') : new ScrapeError('TOO_SHORT', `${parsed.wordCount} kata`);
  }
  if (!parsed.title) throw new ScrapeError('NOT_ARTICLE', 'judul tidak ditemukan');

  if (!parsed.publishedAt) warnings.push('Tanggal terbit tidak ditemukan.');
  if (!parsed.author) warnings.push('Penulis tidak ditemukan.');
  if (!parsed.imageUrl) warnings.push('Gambar utama tidak ditemukan — visual engine akan generate gambar AI.');

  return toResult(parsed, finalUrl, requestedUrl, via, startedAt, warnings);
}
