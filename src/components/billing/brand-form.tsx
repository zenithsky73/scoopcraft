'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Check, Upload, Trash2, Image as ImageIcon } from 'lucide-react';
import { Input, Label, FieldError } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function BrandForm({
  initialHandle,
  initialDisplayName,
  initialLogoUrl,
  fallbackHandle,
}: {
  initialHandle: string | null;
  initialDisplayName: string | null;
  initialLogoUrl?: string | null;
  fallbackHandle: string;
}) {
  const router = useRouter();
  const [handle, setHandle] = React.useState(initialHandle?.replace(/^@/, '') ?? '');
  const [displayName, setDisplayName] = React.useState(initialDisplayName ?? '');
  const [logoUrl, setLogoUrl] = React.useState<string | null>(initialLogoUrl ?? null);
  const [state, setState] = React.useState<'idle' | 'saving' | 'saved'>('idle');
  const [error, setError] = React.useState<string | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError('Ukuran file logo maksimal 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setLogoUrl(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setState('saving');

    const res = await fetch('/api/brand', {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ handle, displayName, logoUrl }),
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
    <form onSubmit={onSubmit} className="space-y-5">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleLogoUpload}
        accept="image/png,image/jpeg,image/svg+xml,image/webp"
        className="hidden"
      />

      {/* Handle / Username */}
      <div>
        <Label htmlFor="handle" className="text-xs font-bold text-slate-800 dark:text-slate-200">Nama Akun / Handle</Label>
        <div className="relative mt-1">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-bold">@</span>
          <Input
            id="handle"
            value={handle}
            onChange={(event) => setHandle(event.target.value.replace(/^@+/, ''))}
            placeholder="redaksikita"
            className="pl-8 text-xs bg-slate-50 dark:bg-slate-950/80 border-slate-200 dark:border-slate-800 rounded-xl"
            maxLength={32}
          />
        </div>
        <p className="text-[11px] text-slate-500 mt-1">Muncul di footer setiap slide yang Anda buat.</p>
      </div>

      {/* Display Name */}
      <div>
        <Label htmlFor="displayName" className="text-xs font-bold text-slate-800 dark:text-slate-200">
          Nama Media / Bisnis <span className="text-slate-400 font-normal">(opsional)</span>
        </Label>
        <Input
          id="displayName"
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          placeholder="Redaksi Kita Official"
          className="mt-1 text-xs bg-slate-50 dark:bg-slate-950/80 border-slate-200 dark:border-slate-800 rounded-xl"
          maxLength={48}
        />
      </div>

      {/* Upload Logo Brand */}
      <div>
        <Label className="text-xs font-bold text-slate-800 dark:text-slate-200">
          Logo Brand Transparan (.PNG)
        </Label>
        <div className="mt-1.5 flex items-center gap-3">
          {logoUrl ? (
            <div className="relative size-12 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 p-1 flex items-center justify-center">
              <img src={logoUrl} alt="Logo Brand" className="max-w-full max-h-full object-contain" />
              <button
                type="button"
                onClick={() => setLogoUrl(null)}
                className="absolute -top-1.5 -right-1.5 size-4 rounded-full bg-red-600 text-white flex items-center justify-center text-[10px]"
                title="Hapus logo"
              >
                ×
              </button>
            </div>
          ) : (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs font-bold bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
            >
              <Upload className="size-3.5 mr-1.5" /> Upload Logo PNG
            </Button>
          )}
          <span className="text-[11px] text-slate-500">Maks. 2MB (disarankan transparan PNG).</span>
        </div>
      </div>

      {/* Live Preview Card */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-4 space-y-2">
        <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">Pratinjau Tampilan di Slide:</p>
        <div className="flex items-center gap-3">
          {logoUrl && (
            <div className="size-8 rounded-lg bg-white dark:bg-slate-950 p-1 border border-slate-200 dark:border-slate-800 flex items-center justify-center shrink-0">
              <img src={logoUrl} alt="Logo" className="max-w-full max-h-full object-contain" />
            </div>
          )}
          <div>
            <p className="text-xs font-black text-slate-900 dark:text-white">{preview}</p>
            {displayName && <p className="text-[11px] font-semibold text-primary">{displayName}</p>}
          </div>
        </div>
      </div>

      <FieldError>{error}</FieldError>

      <div className="flex items-center gap-3 pt-1">
        <Button type="submit" loading={state === 'saving'} className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl h-10 px-5 shadow-md shadow-indigo-600/20">
          Simpan Setelan Brand
        </Button>
        {state === 'saved' && (
          <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
            <Check className="size-4" aria-hidden /> Berhasil Tersimpan!
          </span>
        )}
      </div>
    </form>
  );
}
