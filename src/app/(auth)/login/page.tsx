import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/server/auth';
import { LoginForm } from '@/components/auth/login-form';
import { LogIn, UserPlus } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Masuk Akun — Newsly AI',
  description: 'Masuk ke akun Newsly AI Anda dan mulai buat konten carousel viral.',
};

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) redirect('/dashboard');

  return (
    <div className="space-y-6">
      {/* Switch Tab Headers */}
      <div className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
        <div className="py-2 px-3 rounded-xl bg-white dark:bg-slate-900 shadow-sm text-center text-xs font-black text-slate-900 dark:text-white flex items-center justify-center gap-1.5">
          <LogIn className="size-3.5 text-primary" />
          <span>Masuk</span>
        </div>
        <Link
          href="/register"
          className="py-2 px-3 rounded-xl text-center text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center gap-1.5 transition-colors"
        >
          <UserPlus className="size-3.5" />
          <span>Daftar Baru</span>
        </Link>
      </div>

      <div className="space-y-1">
        <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
          Selamat Datang Kembali 👋
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Masukkan email dan kata sandi Anda untuk melanjutkan.
        </p>
      </div>

      {/* Form Component */}
      <LoginForm />

      {/* Footer Switch */}
      <div className="pt-2 text-center text-xs text-slate-500 dark:text-slate-400">
        Belum memiliki akun?{' '}
        <Link href="/register" className="font-bold text-primary hover:underline">
          Daftar sekarang gratis
        </Link>
      </div>
    </div>
  );
}
