import { db } from '@/server/db';

export const runtime = 'nodejs';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const media = await db.publicMedia.findUnique({
      where: { id: params.id },
    });

    if (!media || !media.dataBase64) {
      return new Response('Media not found', { status: 404 });
    }

    const buffer = Buffer.from(media.dataBase64, 'base64');

    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type': media.mimeType || 'image/png',
        'Content-Length': String(buffer.length),
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error: any) {
    console.error('[PublicMedia API] Error serving image:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
