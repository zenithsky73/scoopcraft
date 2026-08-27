import JSZip from 'jszip';
import { NextResponse } from 'next/server';
import { DesignStyle, OutputFormat } from '@prisma/client';
import { getViewer } from '@/server/viewer';
import { db } from '@/server/db';
import { readAsset, buildFileName, slugify } from '@/server/storage/asset-file';

export const runtime = 'nodejs';

/**
 * Mengunduh beberapa aset sekaligus sebagai ZIP. Carousel 5 slide × 2 format
 * berarti 10 berkas — mengunduhnya satu per satu tidak praktis, dan browser
 * memblokir unduhan beruntun.
 *
 * Filter opsional: ?style=MINIMAL&format=STORY
 */
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const viewer = await getViewer();
  if (!viewer) {
    return NextResponse.json({ error: 'Silakan masuk terlebih dahulu.' }, { status: 401 });
  }

  const url = new URL(req.url);
  const style = url.searchParams.get('style');
  const format = url.searchParams.get('format');

  const content = await db.generatedContent.findFirst({
    where: { id: params.id, article: { userId: viewer.user.id } },
    include: {
      assets: {
        where: {
          status: 'READY',
          ...(style && style in DesignStyle ? { style: style as DesignStyle } : {}),
          ...(format && format in OutputFormat ? { format: format as OutputFormat } : {}),
        },
        orderBy: [{ style: 'asc' }, { format: 'asc' }, { slideIndex: 'asc' }],
      },
    },
  });

  if (!content) return NextResponse.json({ error: 'Konten tidak ditemukan.' }, { status: 404 });
  if (content.assets.length === 0) {
    return NextResponse.json({ error: 'Belum ada gambar yang siap diunduh.' }, { status: 404 });
  }

  const zip = new JSZip();
  let added = 0;

  for (const asset of content.assets) {
    if (!asset.imageUrl) continue;
    const file = await readAsset(asset.imageUrl);
    if (!file) continue;

    // Dikelompokkan per gaya/format supaya carousel tetap berurutan
    // saat ZIP-nya dibuka.
    const folder = `${asset.style.toLowerCase()}-${asset.format.toLowerCase()}`;
    zip.file(`${folder}/${buildFileName(content.headline, asset.style, asset.format, asset.slideIndex)}`, file);
    added += 1;
  }

  if (added === 0) {
    return NextResponse.json({ error: 'Berkas gambar tidak ditemukan di penyimpanan.' }, { status: 404 });
  }

  // Tambahkan file caption naskah siap posting ke root ZIP
  const hashtagsFormatted = Array.isArray(content.hashtags)
    ? content.hashtags.map((h: string) => (h.startsWith('#') ? h : `#${h}`)).join(' ')
    : '';

  const captionText = `${content.headline}\n\n${content.caption}\n\n${hashtagsFormatted}\n\nGenerated with Scoopcraft (https://scoopcraft.app)`;
  zip.file('caption.txt', captionText);

  const buffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE', compressionOptions: { level: 6 } });

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      'content-type': 'application/zip',
      'content-length': String(buffer.length),
      'content-disposition': `attachment; filename="${slugify(content.headline)}.zip"`,
    },
  });
}
