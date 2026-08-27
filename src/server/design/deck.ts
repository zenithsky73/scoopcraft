import type { SlideType } from '@prisma/client';
import type { SlideCopy } from '@/server/ai/schemas';

/** Deck hanya butuh teksnya; prompt gambar tidak ikut menentukan urutan. */
type SlideText = Pick<SlideCopy, 'title' | 'body'>;

export type DeckSlide = {
  index: number;
  type: SlideType;
  /** Judul besar di slide. Untuk COVER ini headline. */
  title: string;
  /** Teks pendukung. Untuk COVER ini feedCopy, untuk OUTRO ini CTA. */
  body: string;
};

export const SLIDES = {
  min: 1,
  /** 1 cover + maksimal 5 poin dari AI + 1 outro. */
  max: 7,
  default: clampCount(Number(process.env.SLIDES_DEFAULT ?? 5)),
};

function clampCount(value: number) {
  if (!Number.isFinite(value)) return 5;
  return Math.min(7, Math.max(1, Math.round(value)));
}

/**
 * Menyusun urutan slide dari naskah yang dibuat AI.
 *
 * Bentuknya: COVER → POINT × n → OUTRO.
 * - 1 slide  : hanya COVER (perilaku lama, gambar tunggal)
 * - 2 slide  : COVER + 1 POINT — outro belum sepadan biayanya
 * - 3+ slide : COVER + POINT sebanyak sisanya + OUTRO
 *
 * Deck bisa lebih pendek dari yang diminta kalau AI menghasilkan poin lebih
 * sedikit; pemanggil wajib memakai panjang hasil, bukan angka permintaan.
 */
export function buildDeck(
  content: { headline: string; feedCopy: string; cta: string; slides: SlideText[] },
  requested: number,
): DeckSlide[] {
  const count = clampCount(requested);
  const cover: DeckSlide = { index: 0, type: 'COVER', title: content.headline, body: content.feedCopy };

  if (count <= 1 || content.slides.length === 0) return [cover];

  const withOutro = count >= 3;
  const pointBudget = withOutro ? count - 2 : count - 1;
  const points = content.slides.slice(0, Math.max(1, pointBudget));

  const deck: DeckSlide[] = [
    cover,
    ...points.map((slide, i) => ({
      index: i + 1,
      type: 'POINT' as SlideType,
      title: slide.title,
      body: slide.body,
    })),
  ];

  if (withOutro) {
    deck.push({
      index: deck.length,
      type: 'OUTRO',
      title: content.cta,
      body: 'Simpan dan bagikan kalau menurutmu berguna.',
    });
  }

  return deck;
}

/**
 * Slide yang butuh gambar sendiri. Slide penutup tidak diberi gambar:
 * isinya CTA dan identitas akun, dan latar polos membuatnya lebih tegas.
 */
export function slidesNeedingVisual(deck: DeckSlide[]) {
  return deck.filter((slide) => slide.type !== 'OUTRO');
}

/**
 * Perkiraan jumlah gambar sebelum naskah slide ada — dipakai untuk mengisi
 * stepsTotal awal. Jumlah sebenarnya dihitung ulang saat job dibuat.
 */
export function estimateVisualCount(requested: number) {
  const count = clampCount(requested);
  return Math.max(1, count >= 3 ? count - 1 : count);
}

/** Jumlah slide sebenarnya untuk sebuah konten — dipakai saat render ulang. */
export function deckLength(slidesAvailable: number, requested: number) {
  const count = clampCount(requested);
  if (count <= 1 || slidesAvailable === 0) return 1;
  const withOutro = count >= 3;
  const points = Math.min(slidesAvailable, Math.max(1, withOutro ? count - 2 : count - 1));
  return 1 + points + (withOutro ? 1 : 0);
}
