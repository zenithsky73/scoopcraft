'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Link2, Sparkles } from 'lucide-react';
import { Input, FieldError } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

/**
 * Formulir coba-langsung di halaman depan. Tidak perlu akun: server membuat
 * akun tamu saat tombol ditekan, lalu mengarahkan ke halaman hasil yang sama
 * dengan yang dipakai user terdaftar.
 *
 * Sengaja hanya satu kolom URL — pilihan gaya, format, dan jumlah slide baru
 * muncul di dashboard. Satu bidang isian mengubah pengunjung jadi pencoba
 * lebih sering daripada formulir lengkap.
 */
import { UpgradeDialog } from '@/components/billing/upgrade-dialog';

export function TryForm({ guestQuota }: { guestQuota: number }) {
  const router = useRouter();
  const [url, setUrl] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [limitReached, setLimitReached] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLimitReached(false);
    setLoading(true);

    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ url }),
    });

    let body: any = {};
    try {
      const text = await res.text();
      body = JSON.parse(text);
    } catch {
      body = { error: `Server error (${res.status})` };
    }

    if (!res.ok) {
      setError(body.error || `Error ${res.status}: Gagal memulai proses.`);
      setLimitReached(body.code === 'GUEST_LIMIT');
      setLoading(false);
      return;
    }

    router.push(`/content/${body.runId}`);
  }

  return (
    <>
      <form onSubmit={onSubmit} className="w-full max-w-xl">
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Link2 className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden />
            <Input
              type="url"
              inputMode="url"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="Tempel link berita atau video YouTube di sini"
              className="h-12 pl-9"
              required
              disabled={loading}
              aria-label="URL artikel berita atau video YouTube"
            />
          </div>
          <Button type="submit" size="lg" className="h-12" loading={loading} disabled={!url}>
            <Sparkles aria-hidden /> Coba gratis
          </Button>
        </div>

        <p className="hint mt-2">
          Tanpa daftar, tanpa kartu kredit · Mendukung portal berita & YouTube · {guestQuota} percobaan gratis
        </p>

        {error && (
          <div className="mt-3 rounded-md border border-danger/25 bg-danger/10 px-3 py-2">
            <FieldError>{error}</FieldError>
            {limitReached && (
              <div className="mt-2 flex gap-2">
                <Button asChild size="sm">
                  <Link href="/register">Daftar Akun</Link>
                </Button>
                <Button variant="secondary" size="sm" onClick={() => setLimitReached(true)}>
                  Lihat Paket Pro
                </Button>
              </div>
            )}
          </div>
        )}
      </form>

      <UpgradeDialog
        open={limitReached}
        onClose={() => setLimitReached(false)}
        reason="GUEST_LIMIT"
        title="Batas Coba Gratis Tercapai"
      />
    </>
  );
}
