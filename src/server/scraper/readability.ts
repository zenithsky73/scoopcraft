import { JSDOM, VirtualConsole } from 'jsdom';
import { Readability, isProbablyReaderable } from '@mozilla/readability';
import { extractMetadata } from '@/server/scraper/metadata';
import { ScrapeError } from '@/server/scraper/errors';

export type ParsedArticle = {
  title: string;
  content: string;
  contentHtml: string;
  excerpt: string | null;
  author: string | null;
  publishedAt: string | null;
  imageUrl: string | null;
  source: string | null;
  lang: string | null;
  wordCount: number;
  readerable: boolean;
};

export function countWords(text: string) {
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

/** Situs yang butuh JS biasanya menyisakan jejak ini di HTML statisnya. */
const JS_REQUIRED = [
  'enable javascript',
  'aktifkan javascript',
  'javascript is required',
  'please enable js',
  'you need to enable javascript',
];

const PAYWALL_HINTS = [
  'berlangganan untuk melanjutkan',
  'artikel ini khusus pelanggan',
  'subscribe to continue',
  'this content is for subscribers',
  'log in to continue reading',
];

export function looksJsRendered(html: string): boolean {
  const lower = html.toLowerCase();
  return JS_REQUIRED.some((hint) => lower.includes(hint));
}

export function looksPaywalled(text: string): boolean {
  const lower = text.toLowerCase();
  return PAYWALL_HINTS.some((hint) => lower.includes(hint));
}

/** HTML Readability → teks dengan jeda paragraf yang dipertahankan. */
function htmlToText(contentHtml: string, doc: Document): string {
  const container = doc.createElement('div');
  container.innerHTML = contentHtml;

  container.querySelectorAll('script, style, figure figcaption, .ad, [class*="banner"]').forEach((el) => el.remove());

  const blocks = Array.from(container.querySelectorAll('p, h1, h2, h3, h4, li, blockquote'))
    .map((el) => el.textContent?.replace(/\s+/g, ' ').trim() ?? '')
    .filter((text) => text.length > 0);

  // Fallback kalau isinya tidak terstruktur dalam blok sama sekali.
  if (blocks.length === 0) {
    return (container.textContent ?? '').replace(/\s+/g, ' ').trim();
  }

  return blocks.join('\n\n');
}

/**
 * Parse HTML jadi artikel. Dipakai untuk HTML statis maupun HTML hasil
 * render Playwright — jadi aturan ekstraksinya identik di kedua jalur.
 */
export function parseArticle(html: string, url: URL): ParsedArticle {
  // jsdom berisik soal CSS yang tidak bisa di-parse; buang ke void.
  const virtualConsole = new VirtualConsole();
  virtualConsole.on('error', () => {});
  virtualConsole.on('jsdomError', () => {});

  const dom = new JSDOM(html, { url: url.href, virtualConsole, contentType: 'text/html' });
  const doc = dom.window.document;

  const meta = extractMetadata(doc, url);
  const readerable = isProbablyReaderable(doc, { minContentLength: 140 });

  // Readability memodifikasi dokumen — kloning supaya metadata di atas
  // (yang sudah diambil) tidak terpengaruh dan doc masih bisa dipakai.
  const article = new Readability(doc.cloneNode(true) as Document, {
    charThreshold: 250,
    keepClasses: false,
  }).parse();

  const contentHtml = article?.content ?? '';
  const content = contentHtml ? htmlToText(contentHtml, doc) : '';
  const title = meta.title ?? article?.title ?? '';

  if (!title && !content) {
    dom.window.close();
    throw new ScrapeError('NOT_ARTICLE', 'readability mengembalikan kosong');
  }

  const result: ParsedArticle = {
    title: title.trim(),
    content,
    contentHtml,
    excerpt: article?.excerpt?.trim() || null,
    author: meta.author ?? article?.byline?.trim() ?? null,
    publishedAt: meta.publishedAt,
    imageUrl: meta.imageUrl,
    source: meta.source ?? article?.siteName ?? null,
    lang: meta.lang ?? article?.lang ?? null,
    wordCount: countWords(content),
    readerable,
  };

  dom.window.close();
  return result;
}
