import { NextResponse } from 'next/server';
import { z } from 'zod';
import { Plan } from '@prisma/client';
import { auth } from '@/server/auth';
import { db } from '@/server/db';
import { createMidtransSnapTransaction, getMidtransServerKey } from '@/server/billing/midtrans';
import { activateSubscription } from '@/server/billing/activate-subscription';

export const runtime = 'nodejs';

const checkoutSchema = z.object({
  plan: z.enum([Plan.BASIC, Plan.PRO, Plan.BUSINESS]),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Silakan login terlebih dahulu untuk berlangganan.' }, { status: 401 });
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: 'Payload tidak valid.' }, { status: 400 });
  }

  const parsed = checkoutSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Paket langganan tidak valid.' }, { status: 400 });
  }

  const user = await db.user.findUniqueOrThrow({
    where: { id: session.user.id },
    select: { id: true, email: true, name: true, role: true },
  });

  if (user.role === 'OWNER') {
    return NextResponse.json(
      { error: 'Akun Anda adalah OWNER (Unlimited) — tidak perlu berlangganan.' },
      { status: 400 },
    );
  }

  // Pembelian paket dikunci sementara untuk publik sampai payment gateway siap
  return NextResponse.json(
    {
      error: 'Akses pembelian paket berbayar saat ini dikunci sementara karena sistem pembayaran otomatis sedang dalam proses finalisasi & aktivasi sistem. Pembelian paket akan segera dibuka untuk publik.',
      locked: true,
    },
    { status: 403 },
  );
}
