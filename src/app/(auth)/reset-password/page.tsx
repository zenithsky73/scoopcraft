'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck, RefreshCw } from 'lucide-react';
import { Input, Label } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError('Token reset kata sandi tidak ditemukan atau tidak valid.');
      return;
    }

    if (password.length < 8) {
      setError('Password baru minimal harus 8 karakter.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Konfirmasi password tidak cocok dengan password baru.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password }),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        setError(data.error || 'Gagal mereset kata sandi.');
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Terjadi kesalahan sistem.');
    }
  }

  if (!token) {
    return (
      <div className="space-y-4 text-center">
        <div className="size-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600 mx-auto">
          <AlertCircle className="size-6" />
        </div>
        <h1 className="text-lg font-black text-slate-900 dark:text-white">Token Tidak Ditemukan</h1>
        <p className="text-xs text-slate-500">
          Tautan reset tidak memiliki token yang valid. Silakan ajukan ulang lupa kata sandi.
        </p>
        <Button asChild block className="h-10 text-xs font-bold bg-primary text-white rounded-xl">
          <Link href="/forgot-password">Ajukan Reset Ulang</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <div className="size-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-primary mb-2 shadow-sm">
          <ShieldCheck className="size-5" />
        </div>
        <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
          Buat Kata Sandi Baru 🔐
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Masukkan kata sandi baru untuk akun Anda.
        </p>
      </div>

      {!success ? (
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          {/* Password Field */}
          <div>
            <Label htmlFor="password" className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Kata Sandi Baru
            </Label>
            <div className="relative mt-1">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 8 karakter..."
                className="pl-10 pr-10 h-11 text-xs bg-slate-50 dark:bg-slate-950/80 border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary text-slate-900 dark:text-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password Field */}
          <div>
            <Label htmlFor="confirmPassword" className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Ulangi Kata Sandi Baru
            </Label>
            <div className="relative mt-1">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <Input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ketik ulang kata sandi..."
                className="pl-10 pr-10 h-11 text-xs bg-slate-50 dark:bg-slate-950/80 border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-3 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-xs font-bold flex items-center gap-2 animate-fade-in">
              <AlertCircle className="size-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-2">
            <Button
              type="submit"
              block
              loading={loading}
              className="h-11 rounded-xl bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-primary/25 transition-all"
            >
              <span className="flex items-center justify-center gap-1.5">
                Simpan Kata Sandi Baru <ArrowRight className="size-4" />
              </span>
            </Button>
          </div>
        </form>
      ) : (
        <div className="space-y-4 animate-fade-in text-center">
          <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs space-y-2">
            <CheckCircle2 className="size-8 text-emerald-600 mx-auto" />
            <h3 className="font-bold text-sm">Kata Sandi Berhasil Diperbarui!</h3>
            <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
              Mengalihkan Anda ke halaman Masuk dalam 2 detik...
            </p>
          </div>

          <Button asChild block className="h-11 text-xs font-bold bg-primary text-white rounded-xl">
            <Link href="/login">Masuk Sekarang ➔</Link>
          </Button>
        </div>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <React.Suspense
      fallback={
        <div className="p-8 text-center text-xs text-slate-500 flex flex-col items-center gap-2">
          <RefreshCw className="size-5 animate-spin text-primary" />
          <span>Memuat halaman reset sandi...</span>
        </div>
      }
    >
      <ResetPasswordForm />
    </React.Suspense>
  );
}
