import type { NextAuthConfig } from 'next-auth';

const FALLBACK_SECRET = 'rqdK59PJ5WWq/TvzTlFbgENX6EV/iLKkhK2YXa7pLYI=';
if (!process.env.AUTH_SECRET) process.env.AUTH_SECRET = FALLBACK_SECRET;
if (!process.env.NEXTAUTH_SECRET) process.env.NEXTAUTH_SECRET = FALLBACK_SECRET;

/**
 * Konfigurasi yang aman dijalankan di Edge runtime (middleware):
 * tanpa Prisma adapter dan tanpa bcrypt. Provider ditambahkan di auth.ts.
 */
export const authConfig = {
  trustHost: true,
  basePath: '/api/auth',
  secret: process.env.AUTH_SECRET,
  pages: {
    signIn: '/login',
    newUser: '/dashboard',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    authorized({ auth }) {
      return !!auth?.user;
    },
    jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    session({ session, token }) {
      if (token?.id) session.user.id = token.id as string;
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
