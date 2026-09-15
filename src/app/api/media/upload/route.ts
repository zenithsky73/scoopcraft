import { NextResponse } from 'next/server';
import { db } from '@/server/db';
import sharp from 'sharp';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { dataBase64, mimeType = 'image/jpeg' } = body;

    if (!dataBase64 || typeof dataBase64 !== 'string') {
      return NextResponse.json({ error: 'dataBase64 is required' }, { status: 400 });
    }

    const cleanBase64 = dataBase64.replace(/^data:image\/\w+;base64,/, '');
    const rawBuffer = Buffer.from(cleanBase64, 'base64');

    // Convert and optimize directly to high-quality JPEG at upload time
    let processedBuffer = rawBuffer;
    let finalMime = 'image/jpeg';

    try {
      processedBuffer = await sharp(rawBuffer)
        .jpeg({ quality: 92, mozjpeg: true })
        .toBuffer();
      finalMime = 'image/jpeg';
    } catch {
      processedBuffer = rawBuffer;
      finalMime = mimeType || 'image/png';
    }

    const media = await db.publicMedia.create({
      data: {
        dataBase64: processedBuffer.toString('base64'),
        mimeType: finalMime,
      },
    });

    let baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.AUTH_URL;
    if (!baseUrl || baseUrl.includes('localhost') || baseUrl.includes('-zenithsky73s-projects.vercel.app') || baseUrl.includes('scoopcraft.vercel.app')) {
      baseUrl = 'https://pro.instadeck.id';
    }
    const cleanBase = baseUrl.replace(/\/$/, '');
    const url = `${cleanBase}/api/media/${media.id}.jpg`;

    return NextResponse.json({
      success: true,
      id: media.id,
      url,
    });
  } catch (error: any) {
    console.error('[PublicMedia Upload API] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Gagal mengunggah slide media.' },
      { status: 500 }
    );
  }
}
