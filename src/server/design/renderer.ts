import { getBrowser, withScreenshotRetry } from '@/server/browser';
import { signRenderToken } from '@/server/design/token';

export type RenderResult = { buffer: Buffer; durationMs: number };

function appUrl() {
  return process.env.APP_URL ?? process.env.AUTH_URL ?? 'http://localhost:3000';
}

/**
 * Screenshot halaman kanvas jadi PNG.
 *
 * Kenapa server-side HTML/CSS dan bukan Konva.js: aturan layout kita berbeda
 * per format (bukan penskalaan), dan CSS sudah punya mesin layout matang —
 * pembungkusan baris, clamp jumlah baris, dan tipografi tinggal dipakai.
 * Chromium juga sudah jadi dependensi untuk fallback scraper.
 */
export async function renderCanvas(input: {
  assetId: string;
  width: number;
  height: number;
  timeoutMs?: number;
}): Promise<RenderResult> {
  const token = signRenderToken(input.assetId);
  const url = `${appUrl()}/render/${input.assetId}?token=${encodeURIComponent(token)}`;
  return renderCanvasAtUrl({ url, width: input.width, height: input.height, timeoutMs: input.timeoutMs });
}

/**
 * Dipakai renderCanvas dan skrip pratinjau desain. Dipisah supaya penyetelan
 * desain bisa dijalankan tanpa database — halaman /render/preview memakai
 * komponen kanvas yang sama persis.
 */
export async function renderCanvasAtUrl(input: {
  url: string;
  width: number;
  height: number;
  timeoutMs?: number;
}): Promise<RenderResult> {
  const startedAt = Date.now();
  const { url } = input;

  const browser = await getBrowser();
  const context = await browser.newContext({
    viewport: { width: input.width, height: input.height },
    // 1 = 1 piksel CSS jadi 1 piksel PNG; kanvas sudah berukuran final.
    deviceScaleFactor: 1,
    locale: 'id-ID',
    timezoneId: 'Asia/Jakarta',
  });

  try {
    const page = await context.newPage();
    await page.goto(url, { waitUntil: 'networkidle', timeout: input.timeoutMs ?? 30_000 });

    const canvas = page.locator('#canvas');
    if ((await canvas.count()) === 0) {
      throw new Error('Kanvas tidak ditemukan — token render kemungkinan ditolak.');
    }

    // Tanpa menunggu font, screenshot bisa terambil saat fallback masih dipakai
    // dan tata letaknya bergeser beberapa piksel.
    await page.evaluate(() => document.fonts.ready);

    // Gambar remote harus selesai dimuat, kalau tidak kanvas kosong.
    await page.evaluate(async () => {
      const images = Array.from(document.images);
      await Promise.all(
        images.map((img) => (img.complete ? Promise.resolve() : new Promise((done) => {
          img.addEventListener('load', done, { once: true });
          img.addEventListener('error', done, { once: true });
        }))),
      );
    });

    const buffer = await withScreenshotRetry(() => canvas.screenshot({ type: 'png' }));
    return { buffer, durationMs: Date.now() - startedAt };
  } finally {
    await context.close().catch(() => {});
  }
}
