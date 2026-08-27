'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { History, Layers, Loader2, Search } from 'lucide-react';
import type { DesignStyle, OutputFormat } from '@prisma/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { FORMAT_SPECS } from '@/config/formats';
import { AVAILABLE_STYLES } from '@/config/styles';
import { formatDate, cn } from '@/lib/utils';

type RunCard = {
  id: string;
  status: 'PENDING' | 'PROCESSING' | 'PARTIAL' | 'DONE' | 'FAILED';
  createdAt: string;
  sourceUrl: string;
  styles: DesignStyle[];
  formats: OutputFormat[];
  slides: number;
  progress: { done: number; total: number };
  title: string | null;
  source: string | null;
  assetCount: number;
  thumbnail: { imageUrl: string | null; format: OutputFormat } | null;
};

const DATE_FILTERS = [
  { value: '', label: 'Semua' },
  { value: '7', label: '7 hari' },
  { value: '30', label: '30 hari' },
  { value: '90', label: '90 hari' },
];

export function ContentGrid() {
  const [runs, setRuns] = React.useState<RunCard[]>([]);
  const [cursor, setCursor] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [loadingMore, setLoadingMore] = React.useState(false);

  const [style, setStyle] = React.useState('');
  const [since, setSince] = React.useState('');
  const [query, setQuery] = React.useState('');
  const [debounced, setDebounced] = React.useState('');

  // Menunda pencarian supaya tiap ketukan tidak jadi satu request.
  React.useEffect(() => {
    const timer = setTimeout(() => setDebounced(query.trim()), 350);
    return () => clearTimeout(timer);
  }, [query]);

  const load = React.useCallback(
    async (options: { append?: boolean; cursor?: string | null } = {}) => {
      const params = new URLSearchParams();
      if (style) params.set('style', style);
      if (since) params.set('since', since);
      if (debounced) params.set('q', debounced);
      if (options.cursor) params.set('cursor', options.cursor);

      const res = await fetch(`/api/runs?${params.toString()}`, { cache: 'no-store' });
      if (!res.ok) return;

      const body = (await res.json()) as { runs: RunCard[]; nextCursor: string | null };
      setRuns((current) => (options.append ? [...current, ...body.runs] : body.runs));
      setCursor(body.nextCursor);
    },
    [style, since, debounced],
  );

  React.useEffect(() => {
    setLoading(true);
    void load().finally(() => setLoading(false));
  }, [load]);

  async function loadMore() {
    if (!cursor) return;
    setLoadingMore(true);
    await load({ append: true, cursor });
    setLoadingMore(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[200px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Cari judul atau URL"
            className="pl-9"
          />
        </div>

        <FilterGroup
          label="Gaya"
          value={style}
          onChange={setStyle}
          options={[{ value: '', label: 'Semua' }, ...AVAILABLE_STYLES.map((item) => ({ value: item.id, label: item.label }))]}
        />
        <FilterGroup label="Tanggal" value={since} onChange={setSince} options={DATE_FILTERS} />
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={index} className="aspect-[4/5] w-full" />
          ))}
        </div>
      ) : runs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-14 text-center">
            <History className="size-6 text-muted" aria-hidden />
            <p className="text-sm font-medium">Belum ada konten</p>
            <p className="max-w-xs text-sm text-muted">
              {style || since || debounced ? 'Tidak ada yang cocok dengan filter ini.' : 'Tempel URL berita di halaman Buat untuk mulai.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {runs.map((run) => (
              <ContentCard key={run.id} run={run} />
            ))}
          </div>

          {cursor && (
            <div className="flex justify-center">
              <Button variant="secondary" onClick={loadMore} loading={loadingMore}>
                Muat lebih banyak
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function FilterGroup({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="flex items-center gap-1 rounded-md border border-border bg-surface-2 p-1">
      <span className="px-2 text-2xs font-medium uppercase tracking-wide text-muted">{label}</span>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          aria-pressed={value === option.value}
          className={cn(
            'rounded-sm px-2.5 py-1 text-xs font-medium transition-colors',
            value === option.value ? 'border border-border bg-surface text-fg' : 'text-muted hover:text-fg',
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function ContentCard({ run }: { run: RunCard }) {
  const running = run.status === 'PENDING' || run.status === 'PROCESSING';
  const spec = run.thumbnail ? FORMAT_SPECS[run.thumbnail.format] : FORMAT_SPECS.FEED_SQUARE;

  return (
    <Link
      href={`/content/${run.id}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-border bg-surface transition-colors hover:border-accent/50"
    >
      <div className="relative w-full overflow-hidden bg-surface-2" style={{ aspectRatio: spec.ratio }}>
        {run.thumbnail?.imageUrl ? (
          <Image
            src={run.thumbnail.imageUrl}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center">
            {running ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="size-5 animate-spin text-muted" aria-hidden />
                <span className="text-2xs tabular-nums text-muted">
                  {run.progress.done}/{run.progress.total}
                </span>
              </div>
            ) : (
              <span className="text-2xs text-muted">Tidak ada gambar</span>
            )}
          </div>
        )}

        {run.slides > 1 && (
          <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-sm bg-fg/75 px-1.5 py-0.5 text-2xs font-semibold text-bg">
            <Layers className="size-3" aria-hidden />
            {run.slides}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <p className="line-clamp-2 text-sm font-medium leading-snug">{run.title ?? run.sourceUrl}</p>

        <div className="mt-auto flex flex-wrap items-center gap-1.5">
          {run.status === 'FAILED' && <Badge variant="danger">Gagal</Badge>}
          {run.status === 'PARTIAL' && <Badge variant="warning">Sebagian</Badge>}
          {running && <Badge variant="accent">Proses</Badge>}
          <span className="text-2xs text-muted">
            {[run.source, formatDate(run.createdAt)].filter(Boolean).join(' · ')}
          </span>
        </div>
      </div>
    </Link>
  );
}
