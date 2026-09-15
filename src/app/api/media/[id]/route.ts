import { db } from '@/server/db';
import sharp from 'sharp';

export const runtime = 'nodejs';

async function getMediaResponse(rawParam: string, isHead = false) {
  try {
    const match = rawParam.match(/^(.*?)(?:\.(png|jpe?g|webp|gif|svg|mp4))?$/i);
    const id = match ? match[1] : rawParam;
    const requestedExt = (match && match[2] ? match[2].toLowerCase() : '').replace('jpeg', 'jpg');

    const media = await db.publicMedia.findUnique({
      where: { id },
    });

    if (!media || !media.dataBase64) {
      return new Response('Media not found', { status: 404 });
    }

    let buffer = Buffer.from(media.dataBase64, 'base64');
    let mimeType = media.mimeType || 'image/jpeg';

    // Only transcode if requested format strictly differs from stored format
    if (requestedExt === 'jpg' && mimeType !== 'image/jpeg') {
      buffer = await sharp(buffer).jpeg({ quality: 90 }).toBuffer();
      mimeType = 'image/jpeg';
    } else if (requestedExt === 'webp' && mimeType !== 'image/webp') {
      buffer = await sharp(buffer).webp({ quality: 90 }).toBuffer();
      mimeType = 'image/webp';
    } else if (requestedExt === 'png' && mimeType !== 'image/png') {
      buffer = await sharp(buffer).png().toBuffer();
      mimeType = 'image/png';
    }

    const headers: Record<string, string> = {
      'Content-Type': mimeType,
      'Content-Length': String(buffer.length),
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Access-Control-Allow-Origin': '*',
      'Accept-Ranges': 'bytes',
    };

    if (isHead) {
      return new Response(null, { status: 200, headers });
    }

    return new Response(buffer, {
      status: 200,
      headers,
    });
  } catch (error: any) {
    console.error('[PublicMedia API] Error serving image:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  return getMediaResponse(params.id || '', false);
}

export async function HEAD(
  req: Request,
  { params }: { params: { id: string } }
) {
  return getMediaResponse(params.id || '', true);
}
