import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/server/auth';
import { db } from '@/server/db';

export const runtime = 'nodejs';

/**
 * Identitas akun, logo & watermark Newsly AI yang dicetak di setiap slide.
 */
const bodySchema = z.object({
  handle: z
    .string()
    .trim()
    .max(32, 'Nama akun maksimal 32 karakter')
    .regex(/^@?[A-Za-z0-9._]*$/, 'Hanya huruf, angka, titik, dan garis bawah')
    .optional(),
  displayName: z.string().trim().max(48, 'Nama tampilan maksimal 48 karakter').optional(),
  logoUrl: z.string().optional().nullable(),
  hideNewslyWatermark: z.boolean().optional(),
  tagline: z.string().trim().max(80, 'Tagline maksimal 80 karakter').optional().nullable(),
});

export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Silakan masuk terlebih dahulu.' }, { status: 401 });
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: 'Body harus JSON.' }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Data tidak valid.' }, { status: 400 });
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, plan: true },
  });

  const isPro = user?.role === 'OWNER' || user?.plan === 'PRO' || user?.plan === 'BUSINESS';

  // Selalu simpan dengan "@" di depan supaya template tidak perlu menebak.
  const rawHandle = parsed.data.handle?.replace(/^@+/, '') ?? '';
  const handle = rawHandle ? `@${rawHandle}` : null;
  const displayName = parsed.data.displayName || null;
  let logoUrl = parsed.data.logoUrl || null;
  const tagline = parsed.data.tagline || null;

  // Jika logo dikirim sebagai base64 data URL, simpan ke PublicMedia agar ringan dan permanen
  if (logoUrl && logoUrl.startsWith('data:image/')) {
    try {
      const mimeMatch = logoUrl.match(/^data:(image\/\w+);base64,/);
      const mimeType = mimeMatch ? mimeMatch[1] : 'image/png';
      const cleanBase64 = logoUrl.replace(/^data:image\/\w+;base64,/, '');

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
      logoUrl = `${cleanBase}/api/media/${media.id}`;
    } catch (mediaErr) {
      console.error('[BrandKit API] Error converting base64 logo to media URL:', mediaErr);
    }
  }

  // Hanya user PRO/Owner yang bisa mengaktifkan sembunyikan watermark InstaDeck PRO
  let hideNewslyWatermark = false;
  if (parsed.data.hideNewslyWatermark !== undefined) {
    hideNewslyWatermark = isPro ? parsed.data.hideNewslyWatermark : false;
  }

  const brand = await db.brandKit.upsert({
    where: { userId: session.user.id },
    update: {
      handle,
      displayName,
      logoUrl,
      hideNewslyWatermark,
      tagline,
    },
    create: {
      userId: session.user.id,
      handle,
      displayName,
      logoUrl,
      hideNewslyWatermark,
      tagline,
    },
    select: {
      handle: true,
      displayName: true,
      logoUrl: true,
      hideNewslyWatermark: true,
      tagline: true,
    },
  });

  return NextResponse.json({ brand, isPro });
}
