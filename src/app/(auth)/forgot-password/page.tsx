'use client';

import * as React from 'react';
import Link from 'next/link';
import { Mail, KeyRound, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { Input, Label } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function ForgotPasswordPage() {
  const [email, setEmail] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [resetUrl, setResetUrl] = React.useState<string | null>(null);
  const [registeredEmail, setRegisteredEmail] = React.useState<string>('');

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!email) {
      setError('Email wajib diisi.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        setError(data.error || 'Email tidak ditemukan.');
        return;
      }

      if (data.resetUrl) {
        setResetUrl(data.resetUrl);
        setRegisteredEmail(data.email || email);
      }
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Terjadi kesalahan sistem.');
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <div className="size-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-primary mb-2 shadow-sm">
          <KeyRound className="size-5" />
        </div>
        <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
          Lupa Kata Sandi? 🔑
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Masukkan email akun Newsly AI Anda untuk membuat kata sandi baru.
        </p>
      </div>

      {!resetUrl ? (
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <div>
            <Label htmlFor="email" className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Email Akun Terdaftar
            </Label>
            <div className="relative mt-1">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="pl-10 h-11 text-xs bg-slate-50 dark:bg-slate-950/80 border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-xs font-bold flex items-center gap-2 animate-fade-in">
              <AlertCircle className="size-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <Button
            type="submit"
            block
            loading={loading}
            className="h-11 rounded-xl bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-primary/25 transition-all"
          >
            <span className="flex items-center justify-center gap-1.5">
              Verifikasi &amp; Buat Sandi Baru <ArrowRight className="size-4" />
            </span>
          </Button>
        </form>
      ) : (
        <div className="space-y-4 animate-fade-in">
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm">
              <CheckCircle2 className="size-5 text-emerald-600 shrink-0" />
              <span>Akun Ditemukan &amp; Terverifikasi!</span>
            </div>
            <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
              Akun untuk <strong>{registeredEmail}</strong> siap direset. Klik tombol di bawah ini untuk membuat kata sandi baru Anda.
            </p>
          </div>

          <Button
            asChild
            block
            className="h-11 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-600/25"
          >
            <Link href={resetUrl} className="flex items-center justify-center gap-1.5">
              <span>🔑 Buat Kata Sandi Baru Sekarang</span>
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      )}

      {/* Back to Login Link */}
      <div className="pt-2 text-center text-xs">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 font-bold text-slate-600 dark:text-slate-400 hover:text-primary transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          <span>Kembali ke Halaman Masuk</span>
        </Link>
      </div>
    </div>
  );
}
