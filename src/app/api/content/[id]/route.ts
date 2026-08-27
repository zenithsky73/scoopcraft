import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getViewer } from '@/server/viewer';
import { db } from '@/server/db';
import { LIMITS } from '@/server/ai/validate';
import { slidesFromJson } from '@/server/design/slides-json';

export const runtime = 'nodejs';

/**
 * Menyimpan hasil edit teks. Batas panjangnya sama persis dengan yang
 * dipakai saat memagari keluaran AI — kalau tidak, user bisa mengetik
 * headline 200 karakter dan merusak layout render.
 */
const bodySchema = z.object({
  headline: z.string().trim().min(1).max(LIMITS.headline).optional(),
  feedCopy: z.string().trim().max(LIMITS.feedCopy).optional(),
  caption: z.string().trim().max(LIMITS.caption).optional(),
  cta: z.string().trim().max(LIMITS.cta).optional(),
  hashtags: z.array(z.string()).max(LIMITS.hashtagsMax).optional(),
  slides: z
    .array(
      z.object({
        title: z.string().trim().max(LIMITS.slideTitle),
        body: z.string().trim().max(LIMITS.slideBody),
      }),
    )
    .max(LIMITS.slidesMax)
    .optional(),
});

async function ownedContent(contentId: string, userId: string) {
  return db.generatedContent.findFirst({
    where: { id: contentId, article: { userId } },
    include: { assets: { select: { id: true, status: true } } },
  });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const viewer = await getViewer();
  if (!viewer) {
    return NextResponse.json({ error: 'Silakan masuk terlebih dahulu.' }, { status: 401 });
  }

  const existing = await ownedContent(params.id, viewer.user.id);
  if (!existing) return NextResponse.json({ error: 'Konten tidak ditemukan.' }, { status: 404 });

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: 'Body harus JSON.' }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return NextResponse.json(
      { error: `${issue?.path.join('.') ?? 'Data'}: ${issue?.message ?? 'tidak valid'}` },
      { status: 400 },
    );
  }

  const data = parsed.data;
  const hashtags = data.hashtags?.map((tag) => tag.toLowerCase().replace(/^#+/, '').replace(/[^a-z0-9]/g, '')).filter(Boolean);

  // Client hanya mengirim teks slide. Prompt gambarnya dipertahankan dari
  // data lama — kalau ikut ditimpa, gambar slide kehilangan konteksnya saat
  // dirender ulang.
  const existingSlides = slidesFromJson(existing.slides);
  const mergedSlides = data.slides?.map((slide, index) => ({
    ...slide,
    visualPrompt: existingSlides[index]?.visualPrompt ?? '',
  }));

  const content = await db.generatedContent.update({
    where: { id: params.id },
    data: {
      ...(data.headline !== undefined ? { headline: data.headline } : {}),
      ...(data.feedCopy !== undefined ? { feedCopy: data.feedCopy } : {}),
      ...(data.caption !== undefined ? { caption: data.caption } : {}),
      ...(data.cta !== undefined ? { cta: data.cta } : {}),
      ...(hashtags ? { hashtags } : {}),
      ...(mergedSlides ? { slides: mergedSlides } : {}),
      edited: true,
    },
  });

  // Teks berubah tapi PNG belum. Frontend memakai tanda ini untuk menampilkan
  // ajakan "render ulang" alih-alih diam-diam menampilkan gambar yang basi.
  const touchesVisual =
    data.headline !== undefined ||
    data.feedCopy !== undefined ||
    data.cta !== undefined ||
    data.slides !== undefined;

  return NextResponse.json({
    content: {
      id: content.id,
      headline: content.headline,
      feedCopy: content.feedCopy,
      caption: content.caption,
      cta: content.cta,
      hashtags: content.hashtags,
      slides: slidesFromJson(content.slides),
      edited: content.edited,
    },
    needsRerender: touchesVisual,
  });
}
