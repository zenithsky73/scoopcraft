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
      { error: 'Akun pemilik sudah punya akses tanpa batas — tidak perlu berlangganan.' },
      { status: 409 },
    );
  }

  // Belum ada pembayaran: aktivasi langsung menulis ke database.
  // Lihat catatan di activate-subscription.ts soal apa yang harus menyusul.
  const result = await activateSubscription(session.user.id, parsed.data.plan);

  return NextResponse.json({
    ...result,
    stub: true,
    message: 'Langganan diaktifkan tanpa pembayaran (mode stub).',
  });
}
