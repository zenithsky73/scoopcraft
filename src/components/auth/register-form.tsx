'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { User, Mail, Lock, Eye, EyeOff, Sparkles, AlertCircle } from 'lucide-react';
import { Input, Label } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function RegisterForm() {
  const router = useRouter();
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [googleLoading, setGoogleLoading] = React.useState(false);

  const handleGoogleRegister = async () => {
    setGoogleLoading(true);
    await signIn('google', { callbackUrl: '/dashboard' });
  };

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Email dan password wajib diisi.');
      return;
    }

    if (password.length < 8) {
      setError('Password minimal harus 8 karakter.');
      return;
    }

    setLoading(true);

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: email.trim().toLowerCase(), password, name: name.trim() || undefined }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? 'Gagal membuat akun. Silakan coba lagi.');
      setLoading(false);
      return;
    }

    // Langsung login otomatis
    const loginRes = await signIn('credentials', {
      email: email.trim().toLowerCase(),
      password,
      redirect: false,
    });

    setLoading(false);

    if (loginRes?.error) {
      router.push('/login');
      return;
    }

    router.push('/dashboard');
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {/* ─── 1. GOOGLE 1-CLICK AUTH ─── */}
      <button
        type="button"
        disabled={googleLoading}
        onClick={handleGoogleRegister}
        className="w-full h-11 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-800 dark:text-slate-200 font-bold text-xs shadow-sm flex items-center justify-center gap-2.5 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
      >
        <svg className="size-4 shrink-0" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
        <span>{googleLoading ? 'Menghubungkan ke Google...' : 'Daftar Cepat dengan Google'}</span>
      </button>

      {/* ─── 2. STYLISH DIVIDER ─── */}
      <div className="relative my-2">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-slate-200 dark:border-slate-800" />
        </div>
        <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-wider">
          <span className="bg-white dark:bg-slate-900 px-3 text-slate-400">
            atau daftar dengan email
          </span>
        </div>
      </div>

      {/* ─── 3. EMAIL REGISTRATION FORM ─── */}
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        {/* Name Field */}
        <div>
          <Label htmlFor="name" className="text-xs font-bold text-slate-800 dark:text-slate-200">
            Nama Lengkap <span className="text-slate-400 font-normal">(opsional)</span>
          </Label>
          <div className="relative mt-1">
            <User className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <Input
              id="name"
              name="name"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nama Anda"
              className="pl-10 h-11 text-xs bg-slate-50 dark:bg-slate-950/80 border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-slate-900 dark:text-white"
            />
          </div>
        </div>

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
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimal 8 karakter..."
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
          <p className="text-[10px] text-slate-500 mt-1">Gunakan minimal 8 karakter kombinasi huruf &amp; angka.</p>
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
              <Sparkles className="size-4" /> Daftar &amp; Dapatkan Kuota Gratis
            </span>
          </Button>
        </div>
      </form>
    </div>
  );
}
