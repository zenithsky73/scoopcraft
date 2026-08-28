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

  const plan = parsed.data.plan;
  const serverKey = getMidtransServerKey();

  // 1. Jika Midtrans Server Key belum diatur di .env (Mode Testing / Sandbox Cepat)
  if (!serverKey) {
    const activated = await activateSubscription(user.id, plan);
    return NextResponse.json({
      success: true,
      mode: 'TEST_INSTANT',
      message: `Paket ${plan} berhasil diaktifkan secara instan (Mode Uji Coba tanpa gateway).`,
      activated,
    });
  }

  // 2. Jika Midtrans Server Key AKTIF -> Buat Transaksi Snap Asli
  try {
    const orderId = `NEWSLY-${plan}-${Date.now().toString(36).toUpperCase()}-${user.id.slice(-4).toUpperCase()}`;

    const snap = await createMidtransSnapTransaction({
      orderId,
      plan,
      userId: user.id,
      userEmail: user.email,
      userName: user.name,
    });

    return NextResponse.json({
      success: true,
      mode: 'MIDTRANS_SNAP',
      orderId,
      token: snap.token,
      redirectUrl: snap.redirect_url,
    });
  } catch (err: any) {
    console.error('[Midtrans Checkout Error]:', err);
    return NextResponse.json(
      { error: err.message || 'Gagal membuat tagihan pembayaran Midtrans.' },
      { status: 500 },
    );
  }
}
