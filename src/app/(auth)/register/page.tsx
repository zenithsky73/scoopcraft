import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/server/auth';
import { RegisterForm } from '@/components/auth/register-form';
import { TRIAL } from '@/config/trial';

export const metadata: Metadata = { title: 'Daftar' };

export default async function RegisterPage() {
  const session = await auth();
  if (session?.user) redirect('/dashboard');

  return (
    <div>
      <h1 className="text-xl font-semibold tracking-tight">Buat akun</h1>
      <p className="mt-1 text-sm text-muted">
        Gratis {TRIAL.durationDays} hari atau {TRIAL.quota} generate — mana yang habis lebih dulu. Tanpa kartu kredit.
      </p>

      <div className="mt-6">
        <RegisterForm />
      </div>

      <p className="mt-6 text-center text-sm text-muted">
        Sudah punya akun?{' '}
        <Link href="/login" className="font-medium text-accent hover:underline">
          Masuk
        </Link>
      </p>
    </div>
  );
}
