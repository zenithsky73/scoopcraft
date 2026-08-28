import { NextResponse } from 'next/server';
import { PDFDocument } from 'pdf-lib';
import { DesignStyle, OutputFormat } from '@prisma/client';
import { getViewer } from '@/server/viewer';
import { db } from '@/server/db';
import { readAsset, slugify } from '@/server/storage/asset-file';

export const runtime = 'nodejs';

/**
 * Endpoint untuk mengekspor carousel sebagai LinkedIn Document Post (PDF multi-halaman).
 * LinkedIn menyukai format dokumen multi-halaman untuk carousel interaktif (rasio 1:1 atau 4:5).
 *
 * Query params: ?style=BOLD&format=FEED_SQUARE
 */
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const viewer = await getViewer();
  if (!viewer) {
    return NextResponse.json({ error: 'Silakan masuk terlebih dahulu.' }, { status: 401 });
  }

  const url = new URL(req.url);
  const styleParam = url.searchParams.get('style');
  const formatParam = url.searchParams.get('format');

  const content = await db.generatedContent.findFirst({
    where: { id: params.id, article: { userId: viewer.user.id } },
    include: {
      assets: {
        where: {
          status: 'READY',
          ...(styleParam && styleParam in DesignStyle ? { style: styleParam as DesignStyle } : {}),
          ...(formatParam && formatParam in OutputFormat ? { format: formatParam as OutputFormat } : {}),
        },
        orderBy: [{ slideIndex: 'asc' }],
      },
    },
  });

  if (!content) return NextResponse.json({ error: 'Konten tidak ditemukan.' }, { status: 404 });
  if (content.assets.length === 0) {
    return NextResponse.json({ error: 'Belum ada gambar siap untuk dibuatkan PDF.' }, { status: 404 });
  }

  // Pilih style & format pertama jika tidak dispesifikasikan
  const targetStyle = (styleParam as DesignStyle) || content.assets[0].style;
  const targetFormat = (formatParam as OutputFormat) || content.assets[0].format;

  const deckAssets = content.assets.filter(
    (asset) => asset.style === targetStyle && asset.format === targetFormat,
  );

  if (deckAssets.length === 0) {
    return NextResponse.json({ error: 'Tidak ada slide untuk kombinasi gaya & format ini.' }, { status: 404 });
  }

  try {
    const pdfDoc = await PDFDocument.create();
    pdfDoc.setTitle(content.headline);
    pdfDoc.setAuthor('Newsly AI');
    pdfDoc.setSubject(content.caption.slice(0, 150));

    let addedPages = 0;

    for (const asset of deckAssets) {
      if (!asset.imageUrl) continue;
      const fileBuffer = await readAsset(asset.imageUrl);
      if (!fileBuffer) continue;

      const embeddedImage = await pdfDoc.embedPng(fileBuffer);
      const { width, height } = embeddedImage;

      const page = pdfDoc.addPage([width, height]);
      page.drawImage(embeddedImage, {
        x: 0,
        y: 0,
        width,
        height,
      });

      addedPages += 1;
    }

    if (addedPages === 0) {
      return NextResponse.json({ error: 'Gagal memproses gambar slide ke dokumen PDF.' }, { status: 404 });
    }

    const pdfBytes = await pdfDoc.save();

    return new NextResponse(new Uint8Array(pdfBytes), {
      headers: {
        'content-type': 'application/pdf',
        'content-length': String(pdfBytes.length),
        'content-disposition': `attachment; filename="${slugify(content.headline)}-linkedin-carousel.pdf"`,
      },
    });
  } catch (err) {
    console.error('PDF export error:', err);
    return NextResponse.json({ error: 'Gagal membuat file PDF carousel.' }, { status: 500 });
  }
}
