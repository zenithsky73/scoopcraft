import type { ImageSource } from '@prisma/client';
import { assessArticleImage, type ImageAssessment } from '@/server/images/relevance';
import { getImageProvider, ImageProviderError } from '@/server/images/provider';
import { getStorage } from '@/server/storage';

export type ResolvedVisual = {
  slideIndex: number;
  source: ImageSource;
  /** URL gambar yang dipakai template; null berarti template menggambar latar sendiri. */
  url: string | null;
  prompt: string | null;
  provider: string | null;
  relevanceScore: number | null;
  notes: string[];
};

type GenerateInput = {
  contentId: string;
  slideIndex: number;
  prompt: string | null;
  width: number;
  height: number;
};

/**
 * Membuat gambar untuk satu slide.
 *
 * Ukurannya mengikuti format paling tinggi yang diminta, lalu dipotong
 * (object-fit: cover) saat dipakai format lain — satu gambar untuk semua
 * format menjaga carousel tetap konsisten dan biayanya tidak berlipat.
 */
async function generate({ contentId, slideIndex, prompt, width, height }: GenerateInput): Promise<ResolvedVisual> {
  const notes: string[] = [];
  const base = { slideIndex, relevanceScore: null, prompt };

  if (!prompt?.trim()) {
    notes.push('Tidak ada prompt visual — memakai latar polos.');
    return { ...base, source: 'SOLID_FALLBACK', url: null, provider: null, notes };
  }

  try {
    const provider = await getImageProvider();
    if (!provider.isAvailable()) {
      throw new ImageProviderError(provider.name, 'Provider tidak siap (kredensial belum diatur).', false);
    }

    const image = await provider.generate({
      prompt,
      width,
      height,
      // Seed menyertakan nomor slide supaya tiap slide dapat gambar berbeda,
      // tapi tetap sama kalau konten yang sama dirender ulang.
      seed: `${contentId}#${slideIndex}`,
    });

    const storage = await getStorage();
    const ext = image.contentType.includes('jpeg') ? 'jpg' : 'png';
    const stored = await storage.put(`visuals/${contentId}-s${slideIndex}.${ext}`, image.buffer, image.contentType);

    notes.push(`Gambar dibuat oleh "${image.provider}".`);
    return { ...base, source: 'AI_GENERATED', url: stored.url, provider: image.provider, notes };
  } catch (err) {
    // Kegagalan generator tidak boleh menjatuhkan seluruh run — template
    // punya latar cadangan yang tetap layak posting.
    const message = err instanceof Error ? err.message : String(err);
    notes.push(`Generator gambar gagal (${message}); memakai latar polos.`);
    return { ...base, source: 'SOLID_FALLBACK', url: null, provider: null, notes };
  }
}

/**
 * Visual slide pembuka. Gambar dari artikel dipakai kalau lolos penilaian —
 * foto asli peristiwa hampir selalu lebih dipercaya pembaca daripada
 * ilustrasi buatan.
 */
export async function resolveCoverVisual(input: {
  contentId: string;
  articleImageUrl: string | null;
  visualPrompt: string | null;
  width: number;
  height: number;
}): Promise<ResolvedVisual & { assessment: ImageAssessment }> {
  const assessment = await assessArticleImage(input.articleImageUrl);

  if (assessment.usable && input.articleImageUrl) {
    return {
      slideIndex: 0,
      source: 'ARTICLE',
      url: input.articleImageUrl,
      prompt: null,
      provider: null,
      relevanceScore: assessment.score,
      notes: [`Gambar artikel dipakai (skor ${assessment.score.toFixed(2)}).`],
      assessment,
    };
  }

  const generated = await generate({
    contentId: input.contentId,
    slideIndex: 0,
    prompt: input.visualPrompt,
    width: input.width,
    height: input.height,
  });

  return {
    ...generated,
    relevanceScore: assessment.score,
    notes: [...assessment.reasons, ...generated.notes],
    assessment,
  };
}

/** Visual untuk slide isi — selalu dibuat AI dari prompt slide itu sendiri. */
export async function resolveSlideVisual(input: GenerateInput) {
  return generate(input);
}

export { assessArticleImage } from '@/server/images/relevance';
export type { ImageAssessment } from '@/server/images/relevance';
