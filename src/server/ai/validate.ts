import type { GeneratedCopy } from '@/server/ai/schemas';

export const LIMITS = {
  headline: 70,
  feedCopy: 180,
  caption: 600,
  captionMin: 200,
  cta: 60,
  altText: 125,
  hashtagsMin: 6,
  hashtagsMax: 10,
  slideTitle: 48,
  slideBody: 150,
  slidesMin: 3,
  slidesMax: 5,
} as const;

/** Potong di batas kata terdekat, bukan di tengah kata. */
function clamp(text: string, max: number) {
  const clean = text.trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}

function normalizeHashtags(tags: string[]) {
  const seen = new Set<string>();
  const out: string[] = [];

  for (const raw of tags) {
    const tag = raw
      .toLowerCase()
      .replace(/^#+/, '')
      .replace(/[^a-z0-9]/g, '');
    if (!tag || tag.length < 3 || seen.has(tag)) continue;
    seen.add(tag);
    out.push(tag);
    if (out.length >= LIMITS.hashtagsMax) break;
  }

  return out;
}

/**
 * Batas panjang ditulis di prompt, tapi model bisa meleset beberapa karakter
 * — dan headline yang kepanjangan merusak layout render. Jadi dipagari lagi
 * di sini, dengan catatan supaya masalah prompt tetap kelihatan.
 */
export function normalizeCopy(copy: GeneratedCopy): { copy: GeneratedCopy; warnings: string[] } {
  const warnings: string[] = [];
  const check = (field: keyof GeneratedCopy, value: string, max: number) => {
    if (value.trim().length > max) warnings.push(`${field} melebihi ${max} karakter (${value.trim().length}), dipotong.`);
    return clamp(value, max);
  };

  const hashtags = normalizeHashtags(copy.hashtags);
  if (hashtags.length < LIMITS.hashtagsMin) {
    warnings.push(`Hanya ${hashtags.length} hashtag valid (minimal ${LIMITS.hashtagsMin}).`);
  }

  const slides = copy.slides
    .slice(0, LIMITS.slidesMax)
    .map((slide) => ({
      title: clamp(slide.title, LIMITS.slideTitle),
      body: clamp(slide.body, LIMITS.slideBody),
      visualPrompt: slide.visualPrompt.trim(),
    }))
    .filter((slide) => slide.title.length > 0 && slide.body.length > 0);

  if (slides.length < LIMITS.slidesMin) {
    warnings.push(`Hanya ${slides.length} slide valid (minimal ${LIMITS.slidesMin}).`);
  }

  const caption = check('caption', copy.caption, LIMITS.caption);
  if (caption.length < LIMITS.captionMin) warnings.push(`Caption pendek (${caption.length} karakter).`);

  return {
    copy: {
      headline: check('headline', copy.headline, LIMITS.headline),
      feedCopy: check('feedCopy', copy.feedCopy, LIMITS.feedCopy),
      caption,
      cta: check('cta', copy.cta, LIMITS.cta),
      altText: check('altText', copy.altText, LIMITS.altText),
      hashtags,
      slides,
      angle: copy.angle.trim(),
    },
    warnings,
  };
}
