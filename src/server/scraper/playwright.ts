import { SCRAPER } from '@/server/scraper/config';
import { ScrapeError } from '@/server/scraper/errors';
import { assertPublicUrl } from '@/server/scraper/url-guard';
import { getBrowser, BrowserUnavailableError } from '@/server/browser';

const BLOCKED_RESOURCES = new Set(['image', 'media', 'font', 'stylesheet']);

/** Bungkus error browser jadi ScrapeError agar penanganan di scraper seragam. */
async function launch() {
  try {
    return await getBrowser();
  } catch (err) {
    if (err instanceof BrowserUnavailableError) throw new ScrapeError('BROWSER_UNAVAILABLE', String(err.cause));
    throw new ScrapeError('FETCH_FAILED', err instanceof Error ? err.message : String(err));
  }
}

export type RenderedPage = { html: string; finalUrl: URL };

/** Render halaman dengan JS aktif, kembalikan HTML setelah konten muncul. */
export async function renderHtml(url: URL): Promise<RenderedPage> {
  await assertPublicUrl(url);

  const browser = await launch();
  const context = await browser.newContext({
    userAgent: SCRAPER.userAgent,
    locale: 'id-ID',
    viewport: { width: 1280, height: 1600 },
    javaScriptEnabled: true,
  });
  context.setDefaultTimeout(SCRAPER.browserTimeoutMs);

  try {
    // Gambar/font/CSS tidak dibutuhkan untuk ekstraksi teks — memblokirnya
    // memangkas waktu render drastis di situs berita yang berat iklan.
    await context.route('**/*', (route) => {
      const type = route.request().resourceType();
      if (BLOCKED_RESOURCES.has(type)) return route.abort();
      return route.continue();
    });

    const page = await context.newPage();

    const response = await page.goto(url.href, {
      waitUntil: 'domcontentloaded',
      timeout: SCRAPER.browserTimeoutMs,
    });

    const status = response?.status() ?? 0;
    if (status === 401 || status === 402 || status === 403) {
      throw new ScrapeError('PAYWALL', `status ${status}`);
    }

    // Beri kesempatan konten async muncul, tapi jangan menunggu
    // networkidle — iklan & analytics sering tidak pernah diam.
    await page.waitForLoadState('networkidle', { timeout: 4_000 }).catch(() => {});
    await page.waitForSelector('article, main, [itemprop="articleBody"]', { timeout: 3_000 }).catch(() => {});

    const html = await page.content();
    const finalUrl = new URL(page.url());

    // URL akhir bisa berbeda setelah redirect JS — validasi ulang.
    await assertPublicUrl(finalUrl);

    return { html, finalUrl };
  } catch (err) {
    if (err instanceof ScrapeError) throw err;
    const message = err instanceof Error ? err.message : String(err);
    if (/Timeout|timeout/.test(message)) throw new ScrapeError('TIMEOUT', message.split('\n')[0]);
    throw new ScrapeError('FETCH_FAILED', message.split('\n')[0]);
  } finally {
    await context.close().catch(() => {});
  }
}
