import type { DesignStyle, OutputFormat, SlideType } from '@prisma/client';

/** Semua yang dibutuhkan satu kanvas untuk digambar. */
export type RenderData = {
  style: DesignStyle;
  format: OutputFormat;
  width: number;
  height: number;

  slide: {
    type: SlideType;
    /** 0-based; 0 = cover. */
    index: number;
    /** Total slide dalam carousel — dipakai indikator "2/5". */
    total: number;
    title: string;
    body: string;
  };

  cta: string;
  source: string | null;
  publishedAt: string | null;
  /** null → template menggambar latar cadangan sendiri. */
  imageUrl: string | null;
  /** Akun yang dicetak di gambar, mis. "@redaksikita". */
  handle: string;
  /** Nama tampilan opsional di samping handle. */
  displayName?: string | null;
  /** Tampilkan garis bantu safe zone (hanya untuk pratinjau, tidak di-render). */
  guides?: boolean;
};
