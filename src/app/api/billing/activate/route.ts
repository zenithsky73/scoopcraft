import { NextResponse } from 'next/server';
import { z } from 'zod';
import { Plan } from '@prisma/client';
import { auth } from '@/server/auth';
import { db } from '@/server/db';
import { activateSubscription } from '@/server/billing/activate-subscription';

export const runtime = 'nodejs';

const bodySchema = z.object({
  plan: z.enum([Plan.BASIC, Plan.PRO, Plan.BUSINESS]),
});

export async function POST(req: Request) {
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
    return NextResponse.json({ error: 'Paket tidak dikenal.' }, { status: 400 });
  }

  const user = await db.user.findUniqueOrThrow({ where: { id: session.user.id }, select: { role: true } });
  if (user.role === 'OWNER') {
    return NextResponse.json(
      { error: 'Akun pemilik sudah punya akses tanpa batas (OWNER GOD-MODE) — tidak perlu berlangganan.' },
      { status: 409 },
    );
  }

  // Gateway Pembayaran Sedang Dalam Proses Verifikasi Resmi
  // Seluruh aktivasi berbayar publik dikunci sementara.
  return NextResponse.json(
    {
      error: 'Akses aktivasi paket saat ini dikunci sementara karena sistem pembayaran otomatis sedang dalam tahap finalisasi & aktivasi sistem. Pembelian paket akan segera dibuka untuk publik.',
      locked: true,
    },
    { status: 403 },
  );
}
