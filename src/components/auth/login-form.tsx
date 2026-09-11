'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';
import { Input, Label } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get('callbackUrl') || '/dashboard';
  const errorParam = params.get('error');

  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [rememberMe, setRememberMe] = React.useState(true);
  const [showPassword, setShowPassword] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    try {
      const savedEmail = localStorage.getItem('instadeck_remember_email') || localStorage.getItem('newsly_remember_email');
      if (savedEmail) {
        setEmail(savedEmail);
        setRememberMe(true);
      }
    } catch {}
  }, []);

  React.useEffect(() => {
    if (errorParam === 'CredentialsSignin') {
      setError('Email atau password salah. Silakan periksa kembali.');
    } else if (errorParam) {
      setError('Sesi berakhir atau terjadi kendala. Silakan coba masuk kembali.');
    }
  }, [errorParam]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Email dan password wajib diisi.');
      return;
    }

    // Simpan atau hapus preferensi Ingat Saya
    try {
      if (rememberMe) {
        localStorage.setItem('instadeck_remember_email', email.trim().toLowerCase());
      } else {
        localStorage.removeItem('instadeck_remember_email');
        localStorage.removeItem('newsly_remember_email');
      }
    } catch {}

    setLoading(true);

    const res = await signIn('credentials', {
      email: email.trim().toLowerCase(),
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError('Email atau password tidak sesuai.');
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {/* ─── EMAIL FORM ─── */}
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        {/* Email Field */}
        <div>
          <Label htmlFor="email" className="text-xs font-bold text-slate-800 dark:text-slate-200">
            Email Akun
          </Label>
          <div className="relative mt-1">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
              className="pl-10 h-11 text-xs bg-slate-50 dark:bg-slate-950/80 border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-slate-900 dark:text-white"
            />
          </div>
        </div>

        {/* Password Field */}
        <div>
          <Label htmlFor="password" className="text-xs font-bold text-slate-800 dark:text-slate-200">
            Password
          </Label>
          <div className="relative mt-1">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <Input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan kata sandi..."
              className="pl-10 pr-10 h-11 text-xs bg-slate-50 dark:bg-slate-950/80 border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-slate-900 dark:text-white"
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

        {/* Remember Me & Forgot Password Row */}
        <div className="flex items-center justify-between pt-0.5">
          <label className="flex items-center gap-2 cursor-pointer select-none group">
            <input
              type="checkbox"
              id="rememberMe"
              name="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="size-4 rounded border-slate-300 dark:border-slate-700 text-primary focus:ring-primary/40 accent-primary cursor-pointer"
            />
            <span className="text-xs text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors font-medium">
              Ingat saya
            </span>
          </label>

          <Link
            href="/forgot-password"
            className="text-xs font-semibold text-primary hover:underline transition-colors"
          >
            Lupa kata sandi?
          </Link>
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
            className="h-11 rounded-xl bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-600 text-white font-bold text-xs shadow-lg shadow-primary/25 transition-all"
          >
            <span className="flex items-center justify-center gap-1.5">
              Masuk ke Studio AI <ArrowRight className="size-4" />
            </span>
          </Button>
        </div>
      </form>
    </div>
  );
}
