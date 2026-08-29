import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/server/auth';
import { RegisterForm } from '@/components/auth/register-form';
import { LogIn, UserPlus } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Daftar Akun Baru — Newsly AI',
  description: 'Daftar akun Newsly AI gratis dan dapatkan kuota pembuatan konten langsung.',
};

export default async function RegisterPage() {
  const session = await auth();
  if (session?.user) redirect('/dashboard');

  return (
    <div className="space-y-6">
      {/* Switch Tab Headers */}
      <div className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
        <Link
          href="/login"
          className="py-2 px-3 rounded-xl text-center text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center gap-1.5 transition-colors"
        >
          <LogIn className="size-3.5" />
          <span>Masuk</span>
        </Link>
        <div className="py-2 px-3 rounded-xl bg-white dark:bg-slate-900 shadow-sm text-center text-xs font-black text-slate-900 dark:text-white flex items-center justify-center gap-1.5">
          <UserPlus className="size-3.5 text-primary" />
          <span>Daftar Baru</span>
        </div>
      </div>

      <div className="space-y-1">
        <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
          Buat Akun Gratis ✨
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Mulai riset dan produksi konten media sosial viral secara otomatis.
        </p>
      </div>

      {/* Form Component */}
      <RegisterForm />

      {/* Footer Switch */}
      <div className="pt-2 text-center text-xs text-slate-500 dark:text-slate-400">
        Sudah memiliki akun?{' '}
        <Link href="/login" className="font-bold text-primary hover:underline">
          Masuk di sini
        </Link>
      </div>
    </div>
  );
}
