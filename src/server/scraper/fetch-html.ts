import { ScrapeError } from '@/server/scraper/errors';
import { SCRAPER } from '@/server/scraper/config';
import { assertPublicUrl, normalizeUrl } from '@/server/scraper/url-guard';

export type FetchedPage = {
  html: string;
  finalUrl: URL;
  status: number;
};

const HTML_TYPES = ['text/html', 'application/xhtml+xml', 'application/xml', 'text/plain'];

function headers() {
  return {
    'user-agent': SCRAPER.userAgent,
    accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'accept-language': 'id-ID,id;q=0.9,en;q=0.8',
    'cache-control': 'no-cache',
  };
}

/** Baca body dengan batas ukuran supaya satu URL tidak bisa menghabiskan memori. */
async function readCapped(res: Response): Promise<Uint8Array> {
  const declared = Number(res.headers.get('content-length') ?? 0);
  if (declared > SCRAPER.maxHtmlBytes) throw new ScrapeError('TOO_LARGE', `${declared} bytes`);

  const reader = res.body?.getReader();
  if (!reader) throw new ScrapeError('FETCH_FAILED', 'body kosong');

  const chunks: Uint8Array[] = [];
  let total = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.length;
    if (total > SCRAPER.maxHtmlBytes) {
      await reader.cancel().catch(() => {});
      throw new ScrapeError('TOO_LARGE', `${total} bytes`);
    }
    chunks.push(value);
  }

  const out = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.length;
  }
  return out;
}

/**
 * Sebagian portal berita Indonesia masih menyajikan ISO-8859-1 / windows-1252.
 * Ambil charset dari header, kalau tidak ada sniff <meta charset> di 2KB awal.
 */
function decode(bytes: Uint8Array, contentType: string): string {
  const fromHeader = /charset=["']?([\w-]+)/i.exec(contentType)?.[1];
  const head = new TextDecoder('latin1').decode(bytes.subarray(0, 2048));
  const fromMeta =
    /<meta[^>]+charset=["']?([\w-]+)/i.exec(head)?.[1] ??
    /<meta[^>]+content=["'][^"']*charset=([\w-]+)/i.exec(head)?.[1];

  const charset = (fromHeader ?? fromMeta ?? 'utf-8').toLowerCase();

  try {
    return new TextDecoder(charset, { fatal: false }).decode(bytes);
  } catch {
    return new TextDecoder('utf-8', { fatal: false }).decode(bytes);
  }
}

/**
 * Fetch HTML dengan redirect manual: tiap hop divalidasi ulang lewat
 * assertPublicUrl, supaya redirect ke 127.0.0.1 / metadata cloud tidak lolos.
 */
export async function fetchHtml(rawUrl: string | URL): Promise<FetchedPage> {
  let current = typeof rawUrl === 'string' ? normalizeUrl(rawUrl) : rawUrl;

  for (let hop = 0; hop <= SCRAPER.maxRedirects; hop++) {
    await assertPublicUrl(current);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), SCRAPER.fetchTimeoutMs);

    let res: Response;
    try {
      res = await fetch(current, {
        headers: headers(),
        redirect: 'manual',
        signal: controller.signal,
      });
    } catch (err) {
      clearTimeout(timer);
      if (err instanceof Error && err.name === 'AbortError') throw new ScrapeError('TIMEOUT', current.href);
      throw new ScrapeError('FETCH_FAILED', err instanceof Error ? err.message : String(err));
    } finally {
      clearTimeout(timer);
    }

    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get('location');
      if (!location) throw new ScrapeError('FETCH_FAILED', `redirect ${res.status} tanpa location`);
      await res.body?.cancel().catch(() => {});
      current = normalizeUrl(new URL(location, current).href);
      continue;
    }

    if (res.status === 401 || res.status === 402 || res.status === 403) {
      await res.body?.cancel().catch(() => {});
      throw new ScrapeError('PAYWALL', `status ${res.status}`);
    }

    if (!res.ok) {
      await res.body?.cancel().catch(() => {});
      throw new ScrapeError('FETCH_FAILED', `status ${res.status}`);
    }

    const contentType = res.headers.get('content-type') ?? '';
    if (contentType && !HTML_TYPES.some((type) => contentType.includes(type))) {
      await res.body?.cancel().catch(() => {});
      throw new ScrapeError('NOT_HTML', contentType);
    }

    const bytes = await readCapped(res);
    return { html: decode(bytes, contentType), finalUrl: current, status: res.status };
  }

  throw new ScrapeError('FETCH_FAILED', 'terlalu banyak redirect');
}
