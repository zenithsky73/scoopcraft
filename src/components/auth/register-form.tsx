'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Input, Label, FieldError } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const data = new FormData(e.currentTarget);
    const email = String(data.get('email') || '').trim().toLowerCase();
    const password = String(data.get('password') || '');
    const name = String(data.get('name') || '').trim();

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, password, name: name || undefined }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? 'Gagal membuat akun. Coba lagi.');
      setLoading(false);
      return;
    }

    // Langsung login supaya user tidak perlu mengetik ulang kredensial.
    await signIn('credentials', { email, password, redirect: false });
    setLoading(false);
    router.push('/dashboard');
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <div>
        <Label htmlFor="name">Nama <span className="hint font-normal">(opsional)</span></Label>
        <Input id="name" name="name" autoComplete="name" placeholder="Nama kamu" />
      </div>

      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required placeholder="nama@email.com" />
      </div>

      <div>
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" autoComplete="new-password" required minLength={8} placeholder="Minimal 8 karakter" />
      </div>

      {error && (
        <div className="rounded-md border border-danger/25 bg-danger/10 px-3 py-2">
          <FieldError>{error}</FieldError>
        </div>
      )}

      <Button type="submit" block loading={loading}>
        Buat akun
      </Button>
    </form>
  );
}
