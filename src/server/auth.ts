import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { db } from '@/server/db';
import { authConfig } from '@/server/auth.config';
import { credentialsSchema } from '@/server/validation/auth';

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
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
});

/** Session milik route/server component; melempar kalau belum login. */
export async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) throw new Error('UNAUTHENTICATED');
  return session.user;
}
