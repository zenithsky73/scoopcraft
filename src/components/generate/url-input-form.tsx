'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Link2, Sparkles } from 'lucide-react';
import type { DesignStyle, OutputFormat } from '@prisma/client';
import { Input, Label, FieldError } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { OptionChip } from '@/components/generate/option-chip';
import { SlideSelector } from '@/components/generate/slide-selector';
import { AVAILABLE_STYLES, DEFAULT_STYLE } from '@/config/styles';
import { FORMAT_LIST, DEFAULT_FORMATS } from '@/config/formats';

export function UrlInputForm({ disabled, defaultSlides }: { disabled?: boolean; defaultSlides: number }) {
  const router = useRouter();

  const [url, setUrl] = React.useState('');
  const [styles, setStyles] = React.useState<DesignStyle[]>([DEFAULT_STYLE]);
  const [formats, setFormats] = React.useState<OutputFormat[]>([...DEFAULT_FORMATS]);
  const [slides, setSlides] = React.useState(defaultSlides);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  /** Minimal satu pilihan harus tersisa — nol pilihan bukan permintaan yang sah. */
  function toggle<T>(list: T[], value: T, set: (next: T[]) => void) {
    const next = list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
    if (next.length > 0) set(next);
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ url, styles, formats, slides }),
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
      setLoading(false);
      return;
    }

    // Halaman detail yang mengambil alih pemantauan; form tidak perlu
    // menunggu pipeline selesai.
    router.push(`/content/${body.runId}`);
  }

  const totalImages = styles.length * formats.length * slides;

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <Label htmlFor="url" className="sr-only">
          URL artikel
        </Label>
        <div className="relative">
          <Link2 className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden />
          <Input
            id="url"
            type="url"
            inputMode="url"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="Tempel link berita atau video YouTube (youtube.com/watch?v=... / youtu.be/...)"
            className="h-11 pl-9"
            required
            disabled={disabled || loading}
          />
        </div>
      </div>

      <div>
        <p className="label">Gaya desain</p>
        <div className="flex flex-wrap gap-2">
          {AVAILABLE_STYLES.map((style) => (
            <OptionChip
              key={style.id}
              selected={styles.includes(style.id)}
              disabled={disabled || loading}
              onClick={() => toggle(styles, style.id, setStyles)}
              label={style.label}
              hint={style.description}
              badge={style.tier === 'PRO' ? 'PRO' : style.badge}
            />
          ))}
        </div>
      </div>

      <div>
        <p className="label">Format</p>
        <div className="flex flex-wrap gap-2">
          {FORMAT_LIST.map((format) => (
            <OptionChip
              key={format.id}
              selected={formats.includes(format.id)}
              disabled={disabled || loading}
              onClick={() => toggle(formats, format.id, setFormats)}
              label={format.label}
              hint={`${format.width}×${format.height}`}
            />
          ))}
        </div>
      </div>

      <SlideSelector value={slides} onChange={setSlides} disabled={disabled || loading} />

      {error && (
        <div className="rounded-md border border-danger/25 bg-danger/10 px-3 py-2">
          <FieldError>{error}</FieldError>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border pt-4">
        <Button type="submit" size="lg" loading={loading} disabled={disabled || !url}>
          <Sparkles aria-hidden /> Generate
        </Button>
        <p className="hint">
          {totalImages} gambar · {styles.length} gaya × {formats.length} format
          {slides > 1 ? ` × ${slides} slide` : ''}
        </p>
      </div>
    </form>
  );
}
