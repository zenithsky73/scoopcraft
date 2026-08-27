import type { Browser } from 'playwright';

/**
 * Satu instance Chromium dipakai bersama oleh scraper, generator gambar,
 * dan design renderer. Launch memakan ~1 detik dan ~150MB — terlalu mahal
 * untuk dibuat ulang per job. Setiap pemakai tetap membuat BrowserContext
 * sendiri agar state tidak bocor antar-request.
 */
const globalForBrowser = globalThis as unknown as { sharedBrowser?: Browser };

export class BrowserUnavailableError extends Error {
  constructor(detail: string) {
    super('Chromium belum terpasang. Jalankan: npx playwright install chromium');
    this.name = 'BrowserUnavailableError';
    this.cause = detail;
  }
}

export async function getBrowser(): Promise<Browser> {
  const existing = globalForBrowser.sharedBrowser;
  if (existing?.isConnected()) return existing;

  const { chromium } = await import('playwright');

  try {
    const browser = await chromium.launch({
      args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-blink-features=AutomationControlled'],
    });
    globalForBrowser.sharedBrowser = browser;
    return browser;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (/Executable doesn't exist|please run/i.test(message)) {
      throw new BrowserUnavailableError(message.split('\n')[0]);
    }
    throw err;
  }
}

/**
 * Chromium sesekali menolak permintaan screenshot dengan "Unable to capture
 * screenshot" tanpa sebab yang jelas, lalu berhasil saat diulang. Sekali coba
 * lagi jauh lebih murah daripada menggagalkan seluruh job render.
 */
export async function withScreenshotRetry<T>(take: () => Promise<T>, attempts = 3): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await take();
    } catch (err) {
      lastError = err;
      const message = err instanceof Error ? err.message : String(err);
      if (!/captureScreenshot|Unable to capture/i.test(message)) throw err;
      await new Promise((resolve) => setTimeout(resolve, 250 * attempt));
    }
  }

  throw lastError;
}

export async function closeBrowser() {
  await globalForBrowser.sharedBrowser?.close().catch(() => {});
  globalForBrowser.sharedBrowser = undefined;
}
