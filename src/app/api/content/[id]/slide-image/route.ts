import { NextResponse } from 'next/server';
import path from 'node:path';
import { mkdir, writeFile } from 'node:fs/promises';
import { getViewer } from '@/server/viewer';
import { db } from '@/server/db';

export const runtime = 'nodejs';

/**
 * Mengunggah atau mengganti foto untuk slide tertentu dalam carousel.
 * Mendukung multipart/form-data (upload file) dan JSON { slideIndex, imageUrl }.
 */
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const viewer = await getViewer();
  if (!viewer) {
    return NextResponse.json({ error: 'Silakan masuk terlebih dahulu.' }, { status: 401 });
  }

  const content = await db.generatedContent.findFirst({
    where: { id: params.id, article: { userId: viewer.user.id } },
  });
  if (!content) {
    return NextResponse.json({ error: 'Konten tidak ditemukan.' }, { status: 404 });
  }

  const contentType = req.headers.get('content-type') || '';
  let slideIndex = 0;
  let imageUrl = '';

  if (contentType.includes('multipart/form-data')) {
    const formData = await req.formData();
    const slideIndexRaw = formData.get('slideIndex');
    slideIndex = Number(slideIndexRaw ?? 0);

    const file = formData.get('file');
    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: 'Berkas gambar tidak ditemukan.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Batasi ukuran upload (maks 10MB)
    if (buffer.length > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'Ukuran gambar maksimal 10 MB.' }, { status: 400 });
    }

    const ext = file.type.includes('png') ? 'png' : file.type.includes('webp') ? 'webp' : 'jpg';
    const filename = `${params.id}-s${slideIndex}-${Date.now()}.${ext}`;
    const uploadDir = path.join(process.cwd(), 'public', 'generated', 'uploads');
    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, filename), buffer);

    imageUrl = `/generated/uploads/${filename}`;
  } else {
    const body = (await req.json().catch(() => ({}))) as { slideIndex?: number; imageUrl?: string };
    slideIndex = Number(body.slideIndex ?? 0);
    imageUrl = String(body.imageUrl ?? '').trim();

    if (!imageUrl) {
      return NextResponse.json({ error: 'URL gambar wajib diisi.' }, { status: 400 });
    }
  }

  // Update visual di database
  await db.$transaction(async (tx) => {
    // 1. Upsert ContentVisual
    await tx.contentVisual.upsert({
      where: {
        generatedContentId_slideIndex: {
          generatedContentId: params.id,
          slideIndex,
        },
      },
      create: {
        generatedContentId: params.id,
        slideIndex,
        source: 'ARTICLE',
        imageUrl,
      },
      update: {
        imageUrl,
        source: 'ARTICLE',
        error: null,
      },
    });

    // 2. Jika slide 0 (cover), update juga visualUrl di GeneratedContent
    if (slideIndex === 0) {
      await tx.generatedContent.update({
        where: { id: params.id },
        data: {
          visualUrl: imageUrl,
          edited: true,
        },
      });
    } else {
      await tx.generatedContent.update({
        where: { id: params.id },
        data: { edited: true },
      });
    }
  });

  return NextResponse.json({
    success: true,
    slideIndex,
    imageUrl,
    needsRerender: true,
  });
}
