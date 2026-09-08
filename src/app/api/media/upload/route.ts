import { NextResponse } from 'next/server';
import { db } from '@/server/db';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { dataBase64, mimeType = 'image/png' } = body;

    if (!dataBase64 || typeof dataBase64 !== 'string') {
      return NextResponse.json({ error: 'dataBase64 is required' }, { status: 400 });
    }

    const cleanBase64 = dataBase64.replace(/^data:image\/\w+;base64,/, '');

    const media = await db.publicMedia.create({
      data: {
        dataBase64: cleanBase64,
        mimeType,
      },
    });

    let baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.AUTH_URL;
    if (!baseUrl || baseUrl.includes('localhost') || baseUrl.includes('-zenithsky73s-projects.vercel.app')) {
      baseUrl = 'https://scoopcraft.vercel.app';
    }
    const cleanBase = baseUrl.replace(/\/$/, '');
    const url = `${cleanBase}/api/media/${media.id}`;

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
