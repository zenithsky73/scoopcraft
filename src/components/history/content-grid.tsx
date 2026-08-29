'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  History,
  Layers,
  Loader2,
  Search,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Calendar,
  Eye,
} from 'lucide-react';
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
    <div className="space-y-6">
      {/* Filters Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[240px] flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Cari judul konten atau tautan sumber..."
            className="pl-10 h-10 text-xs rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
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
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={index} className="aspect-[4/5] w-full rounded-2xl" />
          ))}
        </div>
      ) : runs.length === 0 ? (
        <Card className="rounded-3xl border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md">
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <div className="size-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-primary shadow-sm">
              <History className="size-7" />
            </div>
            <p className="text-base font-black text-slate-900 dark:text-white">Belum Ada Riwayat Konten</p>
            <p className="max-w-sm text-xs text-slate-500 dark:text-slate-400">
              {style || since || debounced
                ? 'Tidak ada konten yang cocok dengan filter pencarian.'
                : 'Mulai buat carousel pertama Anda dari link berita, YouTube, atau prompt AI di Dashboard!'}
            </p>
            <Button asChild size="sm" className="mt-2 text-xs font-bold rounded-xl bg-primary text-white">
              <Link href="/dashboard">Buat Carousel Sekarang ➔</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 items-stretch">
            {runs.map((run) => (
              <ContentCard key={run.id} run={run} />
            ))}
          </div>

          {cursor && (
            <div className="flex justify-center pt-4">
              <Button variant="secondary" onClick={loadMore} loading={loadingMore} className="text-xs font-bold rounded-xl px-6">
                Muat Lebih Banyak Konten
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
    <div className="flex items-center gap-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 p-1 backdrop-blur-md overflow-x-auto max-w-full">
      <span className="px-2 text-[10px] font-black uppercase tracking-wider text-slate-400 shrink-0">{label}</span>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          aria-pressed={value === option.value}
          className={cn(
            'rounded-lg px-2.5 py-1 text-xs font-bold transition-all shrink-0',
            value === option.value
              ? 'bg-primary text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800',
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
  const spec = run.thumbnail ? FORMAT_SPECS[run.thumbnail.format] : FORMAT_SPECS.FEED_PORTRAIT;
  const styleObj = AVAILABLE_STYLES.find((s) => s.id === run.styles?.[0]);

  return (
    <Link
      href={`/content/${run.id}`}
      className="group flex flex-col overflow-hidden rounded-[24px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 shadow-sm hover:shadow-xl hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 relative"
    >
      {/* Visual Thumbnail / Gradient Mini Cover */}
      <div
        className="relative w-full overflow-hidden bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950"
        style={{ aspectRatio: spec.ratio }}
      >
        {run.thumbnail?.imageUrl ? (
          <>
            <Image
              src={run.thumbnail.imageUrl}
              alt={run.title || 'Thumbnail Carousel'}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
          </>
        ) : (
          /* Mini Cover Graphic Fallback */
          <div className="absolute inset-0 p-4 flex flex-col justify-between bg-gradient-to-br from-slate-900 via-indigo-950/80 to-slate-950 text-white relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute -top-10 -right-10 w-28 h-28 bg-primary/20 rounded-full blur-2xl pointer-events-none" />

            {/* Top Style Tag */}
            <div className="flex items-center justify-between z-10">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/30 border border-primary/40 text-[9px] font-black uppercase text-indigo-300">
                <Sparkles className="size-2.5" /> {styleObj?.label || 'Carousel AI'}
              </span>
            </div>

            {/* Center Hook Typography Preview */}
            <div className="my-auto z-10 space-y-1">
              <span className="text-[9px] font-bold uppercase tracking-wider text-amber-400 block font-mono">
                TRENDING HOOK
              </span>
              <p className="text-xs font-black leading-snug line-clamp-3 text-slate-100">
                {run.title || 'Carousel Tanpa Judul'}
              </p>
            </div>

            {/* Bottom Brand Watermark */}
            <div className="flex items-center justify-between text-[9px] text-slate-400 border-t border-slate-800/80 pt-1.5 z-10 font-mono">
              <span>Newsly AI Studio</span>
              <span>Slide 1 / {run.slides}</span>
            </div>
          </div>
        )}

        {/* Hover Quick Action Overlay */}
        <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center p-4">
          <div className="px-3.5 py-2 rounded-xl bg-primary text-white font-black text-xs shadow-lg flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-200">
            <Eye className="size-3.5" />
            <span>Buka di Studio ➔</span>
          </div>
        </div>

        {/* Slide Counter Badge */}
        {run.slides > 1 && (
          <span className="absolute right-2.5 top-2.5 inline-flex items-center gap-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-slate-700/60 px-2 py-0.5 text-[10px] font-black text-white shadow-md z-20">
            <Layers className="size-3 text-primary" aria-hidden />
            <span>{run.slides} Slide</span>
          </span>
        )}
      </div>

      {/* Card Info Details */}
      <div className="flex flex-1 flex-col justify-between p-4 gap-3">
        <h3 className="line-clamp-2 text-xs sm:text-sm font-black text-slate-900 dark:text-white leading-snug group-hover:text-primary transition-colors">
          {run.title ?? run.sourceUrl}
        </h3>

        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/80 pt-2.5">
          <div className="flex items-center gap-1 font-semibold truncate max-w-[120px]">
            <span className="truncate">{run.source || 'Newsly AI'}</span>
          </div>

          <div className="flex items-center gap-1 shrink-0 font-mono text-[10px]">
            <Calendar className="size-3 text-slate-400" />
            <span>{formatDate(run.createdAt)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
