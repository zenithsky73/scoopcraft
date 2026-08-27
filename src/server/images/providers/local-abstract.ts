import { createHash } from 'node:crypto';
import { getBrowser, withScreenshotRetry } from '@/server/browser';
import type { GenerateImageInput, GeneratedImage, ImageProvider } from '@/server/images/provider';

/**
 * Penyedia default: menggambar latar abstrak deterministik memakai Chromium
 * yang sudah ada — tanpa API eksternal, tanpa biaya, tanpa kunci.
 *
 * Ini bukan pengganti gambar AI sungguhan; tujuannya agar pipeline punya
 * jalur yang selalu bisa dijalankan (dev, CI, dan saat kredensial vendor
 * belum diisi) sambil tetap menghasilkan visual yang layak posting.
 */
/**
 * Palet terkurasi. Hue acak penuh menghasilkan pasangan warna yang keruh
 * (merah bertemu olive), jadi pilihannya dibatasi ke kombinasi editorial.
 */
const PALETTES = [
  { from: '#312E81', to: '#0F172A', blob: '#818CF8' }, // indigo malam
  { from: '#0F766E', to: '#082F49', blob: '#5EEAD4' }, // teal laut
  { from: '#7C2D12', to: '#1C1917', blob: '#FDBA74' }, // rust hangat
  { from: '#1E293B', to: '#020617', blob: '#94A3B8' }, // slate netral
  { from: '#065F46', to: '#022C22', blob: '#6EE7B7' }, // emerald
  { from: '#9F1239', to: '#1E1B4B', blob: '#FDA4AF' }, // rose senja
  { from: '#1E3A8A', to: '#0C0A09', blob: '#93C5FD' }, // biru dalam
] as const;

export class LocalAbstractProvider implements ImageProvider {
  readonly name = 'local-abstract';

  isAvailable() {
    return true;
  }

  async generate({ prompt, width, height, seed }: GenerateImageInput): Promise<GeneratedImage> {
    const hash = createHash('sha256').update(`${seed}|${prompt}`).digest();
    const palette = PALETTES[hash[0] % PALETTES.length];
    const angle = 100 + (hash[1] % 80);

    // Blob kecil-kecil dan lembut; blob raksasa membuat gambar terlihat keruh.
    const blobs = Array.from({ length: 7 }, (_, i) => ({
      cx: (hash[2 + i] / 255) * width,
      cy: (hash[9 + i] / 255) * height,
      r: (0.06 + (hash[16 + i] / 255) * 0.13) * Math.min(width, height),
      o: 0.05 + (hash[23 + i] / 255) * 0.07,
    }));

    const html = `<!doctype html><meta charset="utf-8"><style>
      html,body{margin:0;padding:0;width:${width}px;height:${height}px;overflow:hidden}
      .bg{position:relative;width:${width}px;height:${height}px;
        background:linear-gradient(${angle}deg, ${palette.from}, ${palette.to});}
      .blobs{position:absolute;inset:0;filter:blur(${Math.round(Math.min(width, height) * 0.035)}px)}
      .lines{position:absolute;inset:0;opacity:.14;
        background-image:repeating-linear-gradient(${angle + 90}deg,
          rgba(255,255,255,.5) 0 1px, transparent 1px ${Math.round(width / 14)}px);}
      .grain{position:absolute;inset:0;opacity:.35;
        background-image:radial-gradient(rgba(255,255,255,.10) 1px, transparent 1px);
        background-size:3px 3px;}
      .vignette{position:absolute;inset:0;
        background:radial-gradient(120% 90% at 50% 35%, transparent 40%, rgba(0,0,0,.45) 100%);}
    </style>
    <div class="bg">
      <svg class="blobs" width="${width}" height="${height}">
        ${blobs
          .map(
            (b) =>
              `<circle cx="${b.cx.toFixed(0)}" cy="${b.cy.toFixed(0)}" r="${b.r.toFixed(0)}" fill="${palette.blob}" fill-opacity="${b.o.toFixed(3)}"/>`,
          )
          .join('')}
      </svg>
      <div class="lines"></div>
      <div class="grain"></div>
      <div class="vignette"></div>
    </div>`;

    const browser = await getBrowser();
    const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1 });

    try {
      const page = await context.newPage();
      await page.setContent(html, { waitUntil: 'load' });
      const buffer = await withScreenshotRetry(() => page.screenshot({ type: 'png' }));
      return { buffer, contentType: 'image/png', provider: this.name };
    } finally {
      await context.close().catch(() => {});
    }
  }
}
