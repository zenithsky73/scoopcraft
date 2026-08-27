import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { FORMAT_SPECS } from '@/config/formats';

/**
 * Pembacaan berkas hasil render dan penamaannya. Tinggal di sini, bukan di
 * dalam route.ts — Next melarang berkas route mengekspor apa pun selain
 * handler HTTP, dan dua route memerlukan fungsi yang sama.
 */

/** Membaca berkas dari storage lokal; adaptor lain nanti mengganti bagian ini. */
export async function readAsset(imageUrl: string): Promise<Buffer | null> {
  if (!imageUrl.startsWith('/generated/')) return null;

  const relative = imageUrl.replace('/generated/', '');
  // Cegah path traversal lewat nilai yang tersimpan di database.
  if (relative.includes('..')) return null;

  try {
    return await readFile(path.join(process.cwd(), 'public', 'generated', relative));
  } catch {
    return null;
  }
}

export function slugify(text: string, max = 48) {
  return (
    text
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, max) || 'scoopcraft'
  );
}

/** mis. "bi-tahan-suku-bunga-breaking_news-9x16-3.png" */
export function buildFileName(headline: string, style: string, format: string, slideIndex: number) {
  const spec = FORMAT_SPECS[format as keyof typeof FORMAT_SPECS];
  const parts = [slugify(headline), style.toLowerCase(), spec?.short.replace(':', 'x') ?? format.toLowerCase()];
  if (slideIndex > 0) parts.push(String(slideIndex + 1));
  return `${parts.join('-')}.png`;
}
