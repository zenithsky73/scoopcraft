'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Input, Label, FieldError } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get('callbackUrl') || '/dashboard';
  const errorParam = params.get('error');

  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (errorParam === 'CredentialsSignin') {
      setError('Email atau password salah.');
    } else if (errorParam) {
      setError('Sesi berakhir atau terjadi kendala. Silakan coba masuk kembali.');
    }
  }, [errorParam]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const data = new FormData(e.currentTarget);
    const res = await signIn('credentials', {
      email: String(data.get('email') || '').trim().toLowerCase(),
      password: String(data.get('password') || ''),
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      // Pesan sengaja generik: jangan bocorkan email mana yang terdaftar.
      setError('Email atau password salah.');
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required placeholder="nama@email.com" />
      </div>

      <div>
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" autoComplete="current-password" required placeholder="••••••••" />
      </div>

      {error && (
        <div className="rounded-md border border-danger/25 bg-danger/10 px-3 py-2">
          <FieldError>{error}</FieldError>
        </div>
      )}

      <Button type="submit" block loading={loading}>
        Masuk
      </Button>
    </form>
  );
}
