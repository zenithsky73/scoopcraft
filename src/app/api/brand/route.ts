import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/server/auth';
import { db } from '@/server/db';

export const runtime = 'nodejs';

/**
 * Identitas akun & logo yang dicetak di setiap gambar.
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

  // Selalu simpan dengan "@" di depan supaya template tidak perlu menebak.
  const rawHandle = parsed.data.handle?.replace(/^@+/, '') ?? '';
  const handle = rawHandle ? `@${rawHandle}` : null;
  const displayName = parsed.data.displayName || null;
  const logoUrl = parsed.data.logoUrl || null;

  const brand = await db.brandKit.upsert({
    where: { userId: session.user.id },
    update: { handle, displayName, logoUrl },
    create: { userId: session.user.id, handle, displayName, logoUrl },
    select: { handle: true, displayName: true, logoUrl: true },
  });

  return NextResponse.json({ brand });
}
