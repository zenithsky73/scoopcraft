import NextAuth from 'next-auth';
import { NextResponse } from 'next/server';
import { authConfig } from '@/server/auth.config';

// Middleware jalan di Edge runtime: pakai authConfig (tanpa Prisma/bcrypt),
// bukan instance auth() lengkap dari server/auth.ts.
const { auth } = NextAuth(authConfig);

const PROTECTED = ['/dashboard', '/content', '/upgrade', '/settings'];

// /dev/* dan /render/* punya penjagaannya sendiri (NODE_ENV dan token HMAC).

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const needsAuth = PROTECTED.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  // Tamu boleh masuk area aplikasi. Keberadaan cookie di sini bukan
  // otorisasi — tanda tangannya diverifikasi ulang di server component dan
  // route. Middleware hanya menghindari redirect yang salah.
  const hasGuestCookie = req.cookies.has('sc_guest');

  if (needsAuth && !req.auth?.user && !hasGuestCookie) {
    const url = new URL('/login', req.nextUrl);
    url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\.(?:png|jpg|jpeg|svg|webp|ico)$).*)'],
};
