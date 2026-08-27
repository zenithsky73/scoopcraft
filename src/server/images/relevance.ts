import { imageSize } from 'image-size';
import { SCRAPER } from '@/server/scraper/config';

export type ImageAssessment = {
  usable: boolean;
  score: number;
  width: number | null;
  height: number | null;
  bytes: number | null;
  reasons: string[];
};

const THRESHOLD = Number(process.env.IMAGE_RELEVANCE_THRESHOLD ?? 0.6);
const MAX_PROBE_BYTES = 512_000;

/** Nama berkas yang hampir selalu bukan foto berita. */
const BAD_PATTERNS = /logo|avatar|placeholder|default|icon|sprite|blank|no-?image|thumb(nail)?_?s|watermark/i;

async function probe(url: string) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8_000);

  try {
    const res = await fetch(url, {
      headers: { 'user-agent': SCRAPER.userAgent, accept: 'image/*' },
      signal: controller.signal,
    });
    if (!res.ok) return null;

    const type = res.headers.get('content-type') ?? '';
    if (!type.startsWith('image/')) return null;

    // Dimensi ada di header berkas — tidak perlu mengunduh gambar utuh.
    const reader = res.body?.getReader();
    if (!reader) return null;

    const chunks: Uint8Array[] = [];
    let total = 0;
    while (total < MAX_PROBE_BYTES) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      total += value.length;
    }
    await reader.cancel().catch(() => {});

    const buffer = Buffer.concat(chunks.map((c) => Buffer.from(c)));
    const declared = Number(res.headers.get('content-length') ?? 0);
    return { buffer, bytes: declared || buffer.length, type };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Menilai apakah gambar utama artikel layak dipakai sebagai visual.
 * Tidak layak → visual engine beralih ke gambar hasil AI.
 */
export async function assessArticleImage(url: string | null | undefined): Promise<ImageAssessment> {
  const empty: ImageAssessment = { usable: false, score: 0, width: null, height: null, bytes: null, reasons: [] };
  if (!url) return { ...empty, reasons: ['Artikel tidak menyertakan gambar.'] };

  if (BAD_PATTERNS.test(url)) {
    return { ...empty, reasons: ['Nama berkas menandakan logo/placeholder, bukan foto berita.'] };
  }

  const probed = await probe(url);
  if (!probed) return { ...empty, reasons: ['Gambar tidak bisa diunduh atau bukan berkas gambar.'] };

  let dimensions: { width?: number; height?: number };
  try {
    dimensions = imageSize(probed.buffer);
  } catch {
    return { ...empty, bytes: probed.bytes, reasons: ['Format gambar tidak dikenali.'] };
  }

  const width = dimensions.width ?? 0;
  const height = dimensions.height ?? 0;
  const reasons: string[] = [];
  let score = 1;

  if (width < 600 || height < 400) {
    reasons.push(`Resolusi terlalu kecil (${width}×${height}).`);
    score -= 0.6;
  } else if (width < 1000) {
    reasons.push(`Resolusi pas-pasan (${width}×${height}) — akan terlihat lunak pada 1080px.`);
    score -= 0.25;
  }

  const ratio = height > 0 ? width / height : 0;
  if (ratio > 3 || (ratio > 0 && ratio < 0.45)) {
    reasons.push(`Rasio ekstrem (${ratio.toFixed(2)}) — kemungkinan banner atau strip.`);
    score -= 0.4;
  }

  if (probed.bytes < 15_000) {
    reasons.push('Ukuran berkas sangat kecil — kemungkinan ikon.');
    score -= 0.3;
  }

  score = Math.max(0, Math.min(1, score));
  return { usable: score >= THRESHOLD, score, width, height, bytes: probed.bytes, reasons };
}
