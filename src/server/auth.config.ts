import type { NextAuthConfig } from 'next-auth';

/**
 * Konfigurasi yang aman dijalankan di Edge runtime (middleware):
 * tanpa Prisma adapter dan tanpa bcrypt. Provider ditambahkan di auth.ts.
 */
export const authConfig = {
  pages: {
    signIn: '/login',
    newUser: '/dashboard',
  },
  session: {
    // Credentials provider hanya mendukung strategi JWT di Auth.js v5.
    // Adapter Prisma tetap dipakai untuk menyimpan User/Account.
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
      if (token.id) session.user.id = token.id as string;
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
