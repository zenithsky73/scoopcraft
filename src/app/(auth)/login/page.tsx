import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/server/auth';
import { LoginForm } from '@/components/auth/login-form';

export const metadata: Metadata = { title: 'Masuk' };

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) redirect('/dashboard');

  return (
    <div>
      <h1 className="text-xl font-semibold tracking-tight">Masuk</h1>
      <p className="mt-1 text-sm text-muted">Lanjutkan mengubah berita jadi konten.</p>

      <div className="mt-6">
        <LoginForm />
      </div>

      <p className="mt-6 text-center text-sm text-muted">
        Belum punya akun?{' '}
        <Link href="/register" className="font-medium text-accent hover:underline">
          Daftar gratis
        </Link>
      </p>
    </div>
  );
}
