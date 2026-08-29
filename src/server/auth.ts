import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import { db } from '@/server/db';
import { authConfig } from '@/server/auth.config';
import { credentialsSchema } from '@/server/validation/auth';
import { TRIAL } from '@/config/trial';
import { APP } from '@/config/app';

const FALLBACK_SECRET = 'rqdK59PJ5WWq/TvzTlFbgENX6EV/iLKkhK2YXa7pLYI=';
if (!process.env.AUTH_SECRET) process.env.AUTH_SECRET = FALLBACK_SECRET;
if (!process.env.NEXTAUTH_SECRET) process.env.NEXTAUTH_SECRET = FALLBACK_SECRET;

const googleClientId = process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.AUTH_GOOGLE_SECRET || process.env.GOOGLE_CLIENT_SECRET;

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    ...(googleClientId && googleClientSecret
      ? [
          Google({
            clientId: googleClientId,
            clientSecret: googleClientSecret,
            allowDangerousEmailAccountLinking: true,
          }),
        ]
      : []),
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(raw) {
        try {
          const parsed = credentialsSchema.safeParse(raw);
          if (!parsed.success) return null;

          const email = parsed.data.email.toLowerCase().trim();
          const password = parsed.data.password;
          const user = await db.user.findUnique({ where: { email } });

          const hash = user?.passwordHash ?? '$2a$10$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidiu';
          const valid = await bcrypt.compare(password, hash);
          if (!user || !user.passwordHash || !valid) return null;

          return { id: user.id, email: user.email, name: user.name, image: user.image };
        } catch (err) {
          console.error('[auth] error in authorize', err);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account }) {
      if (account?.provider === 'google' && user.email) {
        try {
          const normalizedEmail = user.email.toLowerCase().trim();
          const existing = await db.user.findUnique({ where: { email: normalizedEmail } });

          const isOwner =
            normalizedEmail === APP.ownerEmail ||
            normalizedEmail === '91venture@gmail.com';

          const trialEndsAt = new Date(Date.now() + TRIAL.durationDays * 86_400_000);

          if (!existing) {
            const newUser = await db.user.create({
              data: {
                email: normalizedEmail,
                name: user.name || 'Pengguna Google',
                image: user.image || null,
                emailVerified: new Date(),
                isGuest: false,
                role: isOwner ? 'OWNER' : 'USER',
                plan: isOwner ? 'BUSINESS' : 'TRIAL',
                subscriptionStatus: isOwner ? 'ACTIVE' : 'TRIALING',
                trialEndsAt: isOwner ? null : trialEndsAt,
              },
            });
            user.id = newUser.id;
          } else {
            user.id = existing.id;
            if (!existing.emailVerified) {
              await db.user.update({
                where: { id: existing.id },
                data: { emailVerified: new Date() },
              });
            }
          }
        } catch (err) {
          console.error('[Google SignIn Error]:', err);
        }
      }
      return true;
    },
  },
});

/** Session milik route/server component; melempar kalau belum login. */
export async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) throw new Error('UNAUTHENTICATED');
  return session.user;
}
