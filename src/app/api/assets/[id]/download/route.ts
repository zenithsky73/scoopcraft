import { NextResponse } from 'next/server';
import { getViewer } from '@/server/viewer';
import { db } from '@/server/db';
import { readAsset, buildFileName } from '@/server/storage/asset-file';

export const runtime = 'nodejs';

/**
 * Mengunduh satu PNG dengan nama berkas yang bisa dibaca manusia, mis.
 * "bi-tahan-suku-bunga-minimal-story-2.png". Berkasnya sendiri sudah bisa
 * diakses lewat /generated, tapi tautan langsung akan membuka gambar di tab
 * baru dengan nama acak alih-alih mengunduhnya.
 */
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const viewer = await getViewer();
  if (!viewer) {
    return NextResponse.json({ error: 'Silakan masuk terlebih dahulu.' }, { status: 401 });
  }

  const asset = await db.designAsset.findFirst({
    where: { id: params.id, generatedContent: { article: { userId: viewer.user.id } } },
    include: { generatedContent: { select: { headline: true } } },
  });

  if (!asset || !asset.imageUrl) {
    return NextResponse.json({ error: 'Gambar belum tersedia.' }, { status: 404 });
  }

  const file = await readAsset(asset.imageUrl);
  if (!file) return NextResponse.json({ error: 'Berkas tidak ditemukan.' }, { status: 404 });

  const name = buildFileName(asset.generatedContent.headline, asset.style, asset.format, asset.slideIndex);

  return new NextResponse(new Uint8Array(file), {
    headers: {
      'content-type': 'image/png',
      'content-length': String(file.length),
      'content-disposition': `attachment; filename="${name}"`,
      'cache-control': 'private, max-age=3600',
    },
  });
}
