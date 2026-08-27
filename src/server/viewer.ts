import { cookies } from 'next/headers';
import { createHmac, timingSafeEqual, randomUUID } from 'node:crypto';
import type { User } from '@prisma/client';
import { db } from '@/server/db';
import { auth } from '@/server/auth';

/**
 * "Viewer" = siapa pun yang sedang memakai aplikasi: user terdaftar ATAU
 * pengunjung yang mencoba tanpa mendaftar.
 *
 * Tamu tetap disimpan sebagai baris User (isGuest = true) supaya seluruh
 * relasi yang sudah ada bekerja apa adanya. Konsekuensi bagusnya: saat tamu
 * akhirnya mendaftar, baris yang sama tinggal diberi email dan password —
 * konten hasil percobaannya ikut terbawa, tidak hilang.
 */

const COOKIE = 'sc_guest';
const MAX_AGE = 60 * 60 * 24 * 30;
const FALLBACK_SECRET = 'rqdK59PJ5WWq/TvzTlFbgENX6EV/iLKkhK2YXa7pLYI=';

function secret() {
  return process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || FALLBACK_SECRET;
}

function sign(userId: string) {
  return createHmac('sha256', secret()).update(userId).digest('hex');
}

/** Cookie ditandatangani agar id tamu tidak bisa ditebak atau ditukar. */
function parseCookie(raw: string | undefined): string | null {
  if (!raw) return null;

  const [userId, signature] = raw.split('.');
  if (!userId || !signature) return null;

  const expected = Buffer.from(sign(userId), 'hex');
  const given = Buffer.from(signature, 'hex');
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null;

  return userId;
}

export type Viewer = { user: User; isGuest: boolean };

/** Viewer saat ini, tanpa membuat tamu baru. */
export async function getViewer(): Promise<Viewer | null> {
  const session = await auth();

  if (session?.user?.id) {
    const user = await db.user.findUnique({ where: { id: session.user.id } });
    if (user) return { user, isGuest: false };
  }

  const guestId = parseCookie(cookies().get(COOKIE)?.value);
  if (!guestId) return null;

  const guest = await db.user.findFirst({ where: { id: guestId, isGuest: true } });
  return guest ? { user: guest, isGuest: true } : null;
}

/**
 * Viewer saat ini, membuat akun tamu kalau belum ada.
 *
 * Hanya dipanggil dari jalur yang memang memulai percobaan (mis. tombol
 * Generate di halaman depan) — bukan dari setiap kunjungan, supaya tidak
 * ada baris User sampah untuk orang yang cuma lewat.
 */
export async function getOrCreateGuest(): Promise<Viewer> {
  const existing = await getViewer();
  if (existing) return existing;

  const user = await db.user.create({
    data: {
      // Email wajib dan unik; alamat sintetis ini diganti saat tamu mendaftar.
      email: `guest+${randomUUID()}@guest.scoopcraft.local`,
      isGuest: true,
      plan: 'TRIAL',
      subscriptionStatus: 'TRIALING',
      trialEndsAt: null,
    },
  });

  try {
    cookies().set(COOKIE, `${user.id}.${sign(user.id)}`, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: MAX_AGE,
    });
  } catch (err) {
    console.warn('[viewer] cookies().set failed (ignoring)', err);
  }

  return { user, isGuest: true };
}

/** Dipakai setelah tamu berhasil mendaftar. */
export function clearGuestCookie() {
  cookies().delete(COOKIE);
}

/** Id tamu dari cookie mentah — dipakai route pendaftaran untuk konversi. */
export function readGuestId(raw: string | undefined) {
  return parseCookie(raw);
}

export const GUEST_COOKIE = COOKIE;
