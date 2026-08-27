'use client';

import * as React from 'react';
import { Check, Copy, X } from 'lucide-react';
import type { RunContent } from '@/lib/run-status';
import { LIMITS } from '@/server/ai/validate';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EditableField } from '@/components/result/editable-field';
import { cn } from '@/lib/utils';

export type CopyDraft = {
  headline: string;
  feedCopy: string;
  caption: string;
  cta: string;
  hashtags: string[];
  slides: { title: string; body: string }[];
};

function toDraft(content: RunContent): CopyDraft {
  return {
    headline: content.headline,
    feedCopy: content.feedCopy,
    caption: content.caption,
    cta: content.cta,
    hashtags: [...content.hashtags],
    slides: content.slides.map((slide) => ({ ...slide })),
  };
}

export function CopyEditor({
  content,
  onSaved,
  disabled,
}: {
  content: RunContent;
  onSaved: (next: CopyDraft, needsRerender: boolean) => void;
  disabled?: boolean;
}) {
  const [draft, setDraft] = React.useState<CopyDraft>(() => toDraft(content));
  const [saved, setSaved] = React.useState<CopyDraft>(() => toDraft(content));
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Konten bisa berubah dari luar (render ulang selesai) — jangan menimpa
  // ketikan user yang belum disimpan.
  React.useEffect(() => {
    const next = toDraft(content);
    setSaved(next);
    setDraft((current) => (JSON.stringify(current) === JSON.stringify(saved) ? next : current));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content.id, content.headline, content.caption]);

  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);
  const tooLong =
    draft.headline.length > LIMITS.headline ||
    draft.feedCopy.length > LIMITS.feedCopy ||
    draft.caption.length > LIMITS.caption ||
    draft.cta.length > LIMITS.cta ||
    draft.slides.some((slide) => slide.title.length > LIMITS.slideTitle || slide.body.length > LIMITS.slideBody);

  const set = <K extends keyof CopyDraft>(key: K, value: CopyDraft[K]) =>
    setDraft((current) => ({ ...current, [key]: value }));

  const setSlide = (index: number, patch: Partial<{ title: string; body: string }>) =>
    setDraft((current) => ({
      ...current,
      slides: current.slides.map((slide, i) => (i === index ? { ...slide, ...patch } : slide)),
    }));

  async function save() {
    setSaving(true);
    setError(null);

    const res = await fetch(`/api/content/${content.id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(draft),
    });

    const body = await res.json().catch(() => ({}));
    setSaving(false);

    if (!res.ok) {
      setError(body.error ?? 'Gagal menyimpan.');
      return;
    }

    setSaved(draft);
    onSaved(draft, Boolean(body.needsRerender));
  }

  return (
    <div className="space-y-5">
      <EditableField
        id="headline"
        label="Headline"
        value={draft.headline}
        onChange={(value) => set('headline', value)}
        max={LIMITS.headline}
      />

      <EditableField
        id="feedCopy"
        label="Teks pendukung"
        value={draft.feedCopy}
        onChange={(value) => set('feedCopy', value)}
        max={LIMITS.feedCopy}
      />

      {draft.slides.length > 0 && (
        <div>
          <p className="label">Slide</p>
          <div className="space-y-3">
            {draft.slides.map((slide, index) => (
              <div key={index} className="rounded-md border border-border bg-surface-2 p-3">
                <div className="mb-2 flex items-center gap-2">
                  <Badge variant="accent">{String(index + 1).padStart(2, '0')}</Badge>
                </div>
                <div className="space-y-3">
                  <EditableField
                    id={`slide-${index}-title`}
                    label="Judul slide"
                    value={slide.title}
                    onChange={(value) => setSlide(index, { title: value })}
                    max={LIMITS.slideTitle}
                    rows={1}
                  />
                  <EditableField
                    id={`slide-${index}-body`}
                    label="Isi slide"
                    value={slide.body}
                    onChange={(value) => setSlide(index, { body: value })}
                    max={LIMITS.slideBody}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <EditableField
        id="caption"
        label="Caption"
        value={draft.caption}
        onChange={(value) => set('caption', value)}
        max={LIMITS.caption}
        rows={6}
      />

      <HashtagEditor value={draft.hashtags} onChange={(value) => set('hashtags', value)} />

      <EditableField id="cta" label="CTA" value={draft.cta} onChange={(value) => set('cta', value)} max={LIMITS.cta} rows={1} />

      {error && <p className="text-sm text-danger">{error}</p>}

      {/* Bilah simpan hanya muncul saat ada perubahan — tombol yang selalu
          terlihat tapi tidak bisa ditekan hanya jadi kebisingan. */}
      {dirty && (
        <div className="sticky bottom-20 z-10 flex flex-wrap items-center gap-3 rounded-md border border-border bg-surface p-3 lg:bottom-4">
          <Button onClick={save} loading={saving} disabled={disabled || tooLong}>
            Simpan perubahan
          </Button>
          <Button variant="ghost" onClick={() => setDraft(saved)} disabled={saving}>
            <X aria-hidden /> Batalkan
          </Button>
          {tooLong && <p className="text-xs text-danger">Ada teks yang melebihi batas.</p>}
        </div>
      )}

      <CopyAllButton draft={draft} />
    </div>
  );
}

function HashtagEditor({ value, onChange }: { value: string[]; onChange: (next: string[]) => void }) {
  const [input, setInput] = React.useState('');

  function add() {
    const tag = input.toLowerCase().replace(/^#+/, '').replace(/[^a-z0-9]/g, '');
    if (!tag || value.includes(tag) || value.length >= LIMITS.hashtagsMax) {
      setInput('');
      return;
    }
    onChange([...value, tag]);
    setInput('');
  }

  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <span className="text-sm font-medium">Hashtag</span>
        <span className={cn('text-2xs tabular-nums', value.length < LIMITS.hashtagsMin ? 'text-warning' : 'text-muted')}>
          {value.length}/{LIMITS.hashtagsMax}
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-sm border border-border bg-surface-2 py-1 pl-2 pr-1 text-xs"
          >
            #{tag}
            <button
              type="button"
              onClick={() => onChange(value.filter((item) => item !== tag))}
              className="rounded-sm p-0.5 text-muted transition-colors hover:bg-danger/10 hover:text-danger"
              aria-label={`Hapus ${tag}`}
            >
              <X className="size-3" aria-hidden />
            </button>
          </span>
        ))}

        {value.length < LIMITS.hashtagsMax && (
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ',' || event.key === ' ') {
                event.preventDefault();
                add();
              }
            }}
            onBlur={add}
            placeholder="+ tambah"
            className="w-24 rounded-sm border border-dashed border-border bg-transparent px-2 py-1 text-xs outline-none focus:border-accent"
          />
        )}
      </div>
    </div>
  );
}

/** Tombol penyalinan cepat naskah media sosial. */
function CopyAllButton({ draft }: { draft: CopyDraft }) {
  const [copiedCaption, setCopiedCaption] = React.useState(false);
  const [copiedTags, setCopiedTags] = React.useState(false);
  const [copiedAll, setCopiedAll] = React.useState(false);

  async function copyText(text: string, setFn: (v: boolean) => void) {
    try {
      await navigator.clipboard.writeText(text);
      setFn(true);
      setTimeout(() => setFn(false), 2000);
    } catch {
      setFn(false);
    }
  }

  const tagsFormatted = draft.hashtags.map((tag) => (tag.startsWith('#') ? tag : `#${tag}`)).join(' ');
  const fullPost = `${draft.headline}\n\n${draft.caption}\n\n${tagsFormatted}`;

  return (
    <div className="space-y-2 pt-2 border-t border-border">
      <Button variant="secondary" block onClick={() => copyText(fullPost, setCopiedAll)}>
        {copiedAll ? <Check className="size-4 text-success" /> : <Copy className="size-4" />}
        {copiedAll ? 'Naskah Lengkap Tersalin!' : 'Salin Semua (Headline + Caption + Hashtag)'}
      </Button>

      <div className="grid grid-cols-2 gap-2">
        <Button variant="secondary" size="sm" onClick={() => copyText(draft.caption, setCopiedCaption)}>
          {copiedCaption ? <Check className="size-3.5 text-success mr-1" /> : <Copy className="size-3.5 mr-1" />}
          {copiedCaption ? 'Tersalin' : 'Salin Caption'}
        </Button>
        <Button variant="secondary" size="sm" onClick={() => copyText(tagsFormatted, setCopiedTags)}>
          {copiedTags ? <Check className="size-3.5 text-success mr-1" /> : <Copy className="size-3.5 mr-1" />}
          {copiedTags ? 'Tersalin' : 'Salin Hashtag'}
        </Button>
      </div>
    </div>
  );
}
