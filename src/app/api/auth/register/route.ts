import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { Prisma } from '@prisma/client';
import { db } from '@/server/db';
import { registerSchema } from '@/server/validation/auth';
import { readGuestId, GUEST_COOKIE } from '@/server/viewer';
import { TRIAL } from '@/config/trial';

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Body harus JSON.' }, { status: 400 });
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Data tidak valid.' }, { status: 400 });
  }

  const { email, password, name } = parsed.data;
  const passwordHash = await bcrypt.hash(password, 10);
  const trialEndsAt = new Date(Date.now() + TRIAL.durationDays * 86_400_000);

  // Kalau yang mendaftar adalah tamu, baris User-nya dipakai ulang — bukan
  // dibuat baru. Ini yang membuat konten hasil percobaannya ikut terbawa
  // alih-alih hilang bersama cookie.
  const normalizedEmail = email.toLowerCase().trim();
  const ownerEmail = process.env.OWNER_EMAIL?.toLowerCase().trim();
  const registeredCount = await db.user.count({ where: { isGuest: false } });
  const isOwner = (ownerEmail && normalizedEmail === ownerEmail) || registeredCount === 0;

  const role = isOwner ? 'OWNER' : 'USER';
  const plan = isOwner ? 'BUSINESS' : 'TRIAL';
  const subscriptionStatus = isOwner ? 'ACTIVE' : 'TRIALING';
  const trialEnd = isOwner ? null : trialEndsAt;

  const guestId = readGuestId(cookies().get(GUEST_COOKIE)?.value);

  try {
    if (guestId) {
      const guest = await db.user.findFirst({ where: { id: guestId, isGuest: true } });

      if (guest) {
        const user = await db.user.update({
          where: { id: guest.id },
          data: {
            email: normalizedEmail,
            name,
            passwordHash,
            role,
            isGuest: false,
            plan,
            subscriptionStatus,
            trialEndsAt: trialEnd,
            // Pemakaian saat mencoba tidak dibawa: trial-nya dimulai bersih.
            generateCount: 0,
          },
          select: { id: true, email: true },
        });

        cookies().delete(GUEST_COOKIE);
        return NextResponse.json({ user, converted: true, isOwner }, { status: 201 });
      }
    }

    const user = await db.user.create({
      data: {
        email: normalizedEmail,
        name,
        passwordHash,
        role,
        plan,
        subscriptionStatus,
        trialEndsAt: trialEnd,
      },
      select: { id: true, email: true },
    });

    cookies().delete(GUEST_COOKIE);
    return NextResponse.json({ user, converted: false, isOwner }, { status: 201 });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      return NextResponse.json({ error: 'Email sudah terdaftar.' }, { status: 409 });
    }
    console.error('[register]', err);
    return NextResponse.json({ error: 'Gagal membuat akun.' }, { status: 500 });
  }
}
