import type { DesignStyle, OutputFormat, SlideType } from '@prisma/client';
import { FORMAT_SPECS } from '@/config/formats';

/**
 * Aturan layout ditulis eksplisit per kombinasi gaya × format — bukan hasil
 * penskalaan otomatis dari satu ukuran. Story bukan Feed yang dipanjangkan:
 * porsi gambar, ukuran huruf, dan titik jangkar teksnya berbeda.
 *
 * Semua angka dalam piksel pada kanvas asli (1080 lebar).
 */
export type TextSpec = { size: number; lineHeight: number; maxLines: number; minSize?: number };

export type LayoutSpec = {
  /** Kotak isi teks, diukur dari tepi kanvas. */
  content: { top: number; right: number; bottom: number; left: number };
  /** Zona yang berpotensi tertutup UI platform. */
  safe: { top: number; bottom: number };
  image:
    | { mode: 'band'; top: number; height: number }
    | { mode: 'full' }
    | { mode: 'none' };
  /** Teks menempel ke atas kotak isi atau ke bawahnya. */
  anchor: 'top' | 'bottom';
  badge: { top: number; left: number; size: number } | null;
  headline: TextSpec;
  feedCopy: TextSpec | null;
  meta: { size: number };
  cta: { size: number } | null;
  gap: number;
  /** Perataan teks; slide penutup dibuat tengah. */
  align?: 'left' | 'center';
  /** Nomor urut besar pada slide isi. */
  number?: { size: number };
};

const S = FORMAT_SPECS.STORY.safe;

export const LAYOUTS: Record<'MINIMAL' | 'BREAKING_NEWS', Record<OutputFormat, LayoutSpec>> = {
  MINIMAL: {
    // Foto memenuhi bagian atas, teks bernapas di bawahnya.
    FEED_SQUARE: {
      content: { top: 620, right: 80, bottom: 72, left: 80 },
      safe: { top: 0, bottom: 0 },
      image: { mode: 'band', top: 0, height: 560 },
      anchor: 'top',
      badge: null,
      headline: { size: 62, lineHeight: 1.12, maxLines: 4, minSize: 44 },
      feedCopy: { size: 26, lineHeight: 1.5, maxLines: 3 },
      meta: { size: 20 },
      cta: { size: 22 },
      gap: 22,
    },
    // Story: pita gambar dimulai tepat di bawah safe zone atas, teks
    // berhenti jauh di atas safe zone bawah.
    FEED_PORTRAIT: {
      content: { top: 760, right: 84, bottom: 80, left: 84 },
      safe: { top: 0, bottom: 0 },
      image: { mode: 'band', top: 0, height: 700 },
      anchor: 'top',
      badge: null,
      headline: { size: 66, lineHeight: 1.12, maxLines: 4, minSize: 48 },
      feedCopy: { size: 28, lineHeight: 1.5, maxLines: 3 },
      meta: { size: 21 },
      cta: { size: 23 },
      gap: 24,
    },
    STORY: {
      // Pita gambar dibuat tinggi supaya sisa ruang teks tidak menganga;
      // 760px menyisakan ~230px kosong di bawah paragraf.
      content: { top: 1190, right: 88, bottom: S.bottom + 40, left: 88 },
      safe: { top: S.top, bottom: S.bottom },
      image: { mode: 'band', top: S.top, height: 880 },
      anchor: 'top',
      badge: null,
      headline: { size: 76, lineHeight: 1.1, maxLines: 5, minSize: 54 },
      feedCopy: { size: 30, lineHeight: 1.55, maxLines: 4 },
      meta: { size: 24 },
      cta: { size: 26 },
      gap: 28,
    },
  },

  BREAKING_NEWS: {
    // Foto penuh bingkai dengan scrim; teks menempel ke bawah.
    FEED_SQUARE: {
      content: { top: 220, right: 72, bottom: 72, left: 72 },
      safe: { top: 0, bottom: 0 },
      image: { mode: 'full' },
      anchor: 'bottom',
      badge: { top: 72, left: 72, size: 26 },
      headline: { size: 70, lineHeight: 1.08, maxLines: 4, minSize: 48 },
      feedCopy: { size: 25, lineHeight: 1.45, maxLines: 2 },
      meta: { size: 20 },
      cta: null,
      gap: 20,
    },
    FEED_PORTRAIT: {
      content: { top: 260, right: 76, bottom: 80, left: 76 },
      safe: { top: 0, bottom: 0 },
      image: { mode: 'full' },
      anchor: 'bottom',
      badge: { top: 80, left: 76, size: 28 },
      headline: { size: 74, lineHeight: 1.08, maxLines: 5, minSize: 52 },
      feedCopy: { size: 27, lineHeight: 1.45, maxLines: 3 },
      meta: { size: 21 },
      cta: null,
      gap: 22,
    },
    STORY: {
      content: { top: 700, right: 80, bottom: S.bottom + 56, left: 80 },
      safe: { top: S.top, bottom: S.bottom },
      image: { mode: 'full' },
      anchor: 'bottom',
      // Badge turun ke bawah batas safe zone atas supaya tidak tertutup
      // foto profil dan bar progres Story.
      badge: { top: S.top + 16, left: 80, size: 30 },
      headline: { size: 82, lineHeight: 1.06, maxLines: 5, minSize: 58 },
      feedCopy: { size: 30, lineHeight: 1.5, maxLines: 3 },
      meta: { size: 24 },
      cta: { size: 26 },
      gap: 26,
    },
  },
};

/**
 * Perlakuan gambar per gaya. Ini yang membedakan slide isi antar-gaya:
 * geometrinya sama, tapi gambar bisa jadi pita di atas, memenuhi bingkai,
 * atau membelah kanvas jadi dua.
 */
export type ImageMode = 'band' | 'full' | 'split' | 'none';

const IMAGE_MODES: Record<
  'MINIMAL' | 'BREAKING_NEWS' | 'MODERN' | 'BOLD' | 'EDITORIAL' | 'TECH' | 'FINANCE' | 'CORPORATE' | 'LIFESTYLE',
  Record<SlideType, ImageMode>
> = {
  MINIMAL: { COVER: 'band', POINT: 'band', OUTRO: 'none' },
  BREAKING_NEWS: { COVER: 'full', POINT: 'full', OUTRO: 'none' },
  MODERN: { COVER: 'band', POINT: 'split', OUTRO: 'none' },
  BOLD: { COVER: 'full', POINT: 'split', OUTRO: 'none' },
  EDITORIAL: { COVER: 'band', POINT: 'band', OUTRO: 'none' },
  TECH: { COVER: 'full', POINT: 'split', OUTRO: 'none' },
  FINANCE: { COVER: 'band', POINT: 'split', OUTRO: 'none' },
  CORPORATE: { COVER: 'full', POINT: 'band', OUTRO: 'none' },
  LIFESTYLE: { COVER: 'band', POINT: 'band', OUTRO: 'none' },
};

/** Ukuran dasar slide isi per format. Angka dalam piksel kanvas asli. */
const POINT_METRICS: Record<OutputFormat, {
  bandHeight: number;
  splitHeight: number;
  pad: number;
  title: number;
  titleMin: number;
  body: number;
  bodyLines: number;
  number: number;
  meta: number;
  gap: number;
}> = {
  FEED_SQUARE: { bandHeight: 460, splitHeight: 540, pad: 84, title: 54, titleMin: 40, body: 30, bodyLines: 5, number: 84, meta: 20, gap: 22 },
  FEED_PORTRAIT: { bandHeight: 560, splitHeight: 660, pad: 88, title: 58, titleMin: 42, body: 32, bodyLines: 6, number: 92, meta: 21, gap: 24 },
  STORY: { bandHeight: 760, splitHeight: 900, pad: 92, title: 64, titleMin: 48, body: 34, bodyLines: 7, number: 108, meta: 24, gap: 28 },
};

function pointLayout(format: OutputFormat, mode: ImageMode): LayoutSpec {
  const m = POINT_METRICS[format];
  const safe = format === 'STORY' ? { top: S.top, bottom: S.bottom } : { top: 0, bottom: 0 };

  const image: LayoutSpec['image'] =
    mode === 'full'
      ? { mode: 'full' }
      : mode === 'band'
        ? { mode: 'band', top: safe.top, height: m.bandHeight }
        : mode === 'split'
          ? { mode: 'band', top: safe.top, height: m.splitHeight }
          : { mode: 'none' };

  // Teks menempel ke bawah hanya saat gambar memenuhi bingkai; pada mode
  // lain teks mulai tepat di bawah gambar.
  const contentTop =
    mode === 'full'
      ? safe.top + Math.round(m.pad * 2)
      : mode === 'none'
        ? safe.top + Math.round(m.pad * 1.6)
        : safe.top + (mode === 'band' ? m.bandHeight : m.splitHeight) + Math.round(m.pad * 0.7);

  return {
    content: { top: contentTop, right: m.pad, bottom: safe.bottom + m.pad, left: m.pad },
    safe,
    image,
    anchor: mode === 'full' ? 'bottom' : 'top',
    badge: null,
    number: { size: m.number },
    headline: { size: m.title, lineHeight: 1.14, maxLines: 3, minSize: m.titleMin },
    feedCopy: { size: m.body, lineHeight: 1.5, maxLines: m.bodyLines },
    meta: { size: m.meta },
    cta: null,
    gap: m.gap,
  };
}

/** Slide penutup: tanpa gambar, teks di tengah, identitas akun menonjol. */
const OUTRO_LAYOUTS: Record<OutputFormat, LayoutSpec> = {
  FEED_SQUARE: {
    content: { top: 160, right: 96, bottom: 160, left: 96 },
    safe: { top: 0, bottom: 0 },
    image: { mode: 'none' },
    anchor: 'top',
    badge: null,
    headline: { size: 62, lineHeight: 1.15, maxLines: 3, minSize: 46 },
    feedCopy: { size: 28, lineHeight: 1.5, maxLines: 3 },
    meta: { size: 30 },
    cta: null,
    gap: 28,
    align: 'center',
  },
  FEED_PORTRAIT: {
    content: { top: 200, right: 100, bottom: 200, left: 100 },
    safe: { top: 0, bottom: 0 },
    image: { mode: 'none' },
    anchor: 'top',
    badge: null,
    headline: { size: 66, lineHeight: 1.15, maxLines: 3, minSize: 48 },
    feedCopy: { size: 30, lineHeight: 1.5, maxLines: 3 },
    meta: { size: 32 },
    cta: null,
    gap: 30,
    align: 'center',
  },
  STORY: {
    content: { top: S.top + 140, right: 100, bottom: S.bottom + 140, left: 100 },
    safe: { top: S.top, bottom: S.bottom },
    image: { mode: 'none' },
    anchor: 'top',
    badge: null,
    headline: { size: 72, lineHeight: 1.14, maxLines: 3, minSize: 54 },
    feedCopy: { size: 32, lineHeight: 1.5, maxLines: 3 },
    meta: { size: 34 },
    cta: null,
    gap: 32,
    align: 'center',
  },
};

type StyleKey = 'MINIMAL' | 'BREAKING_NEWS' | 'MODERN' | 'BOLD' | 'EDITORIAL' | 'TECH' | 'FINANCE' | 'CORPORATE' | 'LIFESTYLE';

function styleKey(style: DesignStyle): StyleKey {
  const valid: StyleKey[] = [
    'MINIMAL',
    'BREAKING_NEWS',
    'MODERN',
    'BOLD',
    'EDITORIAL',
    'TECH',
    'FINANCE',
    'CORPORATE',
    'LIFESTYLE',
  ];
  return valid.includes(style as StyleKey) ? (style as StyleKey) : 'MINIMAL';
}

export function imageModeFor(style: DesignStyle, slideType: SlideType = 'COVER'): ImageMode {
  return IMAGE_MODES[styleKey(style)][slideType];
}

export function layoutFor(style: DesignStyle, format: OutputFormat, slideType: SlideType = 'COVER'): LayoutSpec {
  if (slideType === 'OUTRO') return OUTRO_LAYOUTS[format];
  if (slideType === 'POINT') return pointLayout(format, imageModeFor(style, 'POINT'));

  const key = styleKey(style);
  const fullCoverStyles: StyleKey[] = ['BREAKING_NEWS', 'BOLD', 'TECH', 'CORPORATE'];
  const useFullCover = fullCoverStyles.includes(key);

  return LAYOUTS[useFullCover ? 'BREAKING_NEWS' : 'MINIMAL'][format];
}

/**
 * Headline panjang diperkecil bertahap, bukan dibiarkan meluber atau
 * terpotong ellipsis. Berdasarkan jumlah karakter — deterministik dan
 * tidak perlu mengukur teks di browser.
 */
export function fitHeadline(text: string, spec: TextSpec) {
  const min = spec.minSize ?? spec.size;
  const length = text.trim().length;

  let factor = 1;
  if (length > 64) factor = 0.8;
  else if (length > 52) factor = 0.87;
  else if (length > 40) factor = 0.94;

  return Math.max(min, Math.round(spec.size * factor));
}
