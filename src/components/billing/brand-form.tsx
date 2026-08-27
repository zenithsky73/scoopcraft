'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Check } from 'lucide-react';
import { Input, Label, FieldError } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

/**
 * Identitas akun yang dicetak di gambar. Pratinjau kecil ikut berubah saat
 * diketik supaya user tahu persis apa yang akan muncul di hasil render.
 */
export function BrandForm({
  initialHandle,
  initialDisplayName,
  fallbackHandle,
}: {
  initialHandle: string | null;
  initialDisplayName: string | null;
  fallbackHandle: string;
}) {
  const router = useRouter();
  const [handle, setHandle] = React.useState(initialHandle?.replace(/^@/, '') ?? '');
  const [displayName, setDisplayName] = React.useState(initialDisplayName ?? '');
  const [state, setState] = React.useState<'idle' | 'saving' | 'saved'>('idle');
  const [error, setError] = React.useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setState('saving');

    const res = await fetch('/api/brand', {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ handle, displayName }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? 'Gagal menyimpan.');
      setState('idle');
      return;
    }

    setState('saved');
    router.refresh();
    setTimeout(() => setState('idle'), 2500);
  }

  const preview = handle ? `@${handle.replace(/^@/, '')}` : fallbackHandle;

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <Label htmlFor="handle">Nama akun</Label>
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted">@</span>
          <Input
            id="handle"
            value={handle}
            onChange={(event) => setHandle(event.target.value.replace(/^@+/, ''))}
            placeholder="redaksikita"
            className="pl-7"
            maxLength={32}
          />
        </div>
        <p className="hint mt-1.5">Muncul di setiap gambar yang kamu buat.</p>
      </div>

      <div>
        <Label htmlFor="displayName">
          Nama tampilan <span className="hint font-normal">(opsional)</span>
        </Label>
        <Input
          id="displayName"
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          placeholder="Redaksi Kita"
          maxLength={48}
        />
      </div>

      <div className="rounded-md border border-border bg-surface-2 p-3">
        <p className="text-2xs font-medium uppercase tracking-wide text-muted">Tampil di gambar</p>
        <p className="mt-1 text-sm font-semibold">{preview}</p>
        {displayName && <p className="text-sm text-muted">{displayName}</p>}
      </div>

      <FieldError>{error}</FieldError>

      <div className="flex items-center gap-3">
        <Button type="submit" loading={state === 'saving'}>
          Simpan
        </Button>
        {state === 'saved' && (
          <span className="flex items-center gap-1.5 text-sm text-success">
            <Check className="size-4" aria-hidden /> Tersimpan
          </span>
        )}
      </div>
    </form>
  );
}
