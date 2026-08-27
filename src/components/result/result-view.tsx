'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { useRunStatus, type RunStatusResponse } from '@/lib/run-status';
import { PipelineProgress } from '@/components/generate/pipeline-progress';
import { CopyEditor, type CopyDraft } from '@/components/result/copy-editor';
import { VisualPanel } from '@/components/result/visual-panel';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

/**
 * Halaman hasil. Selama pipeline berjalan, yang tampil progress tracker;
 * begitu teks siap, panel edit muncul walau gambar masih dirender — user
 * bisa mulai membaca dan memperbaiki caption sambil menunggu.
 *
 * Desktop: dua kolom (teks | visual). Mobile: satu kolom dengan tab.
 */
export function ResultView({ initial }: { initial: RunStatusResponse }) {
  const { data, isRunning, refresh, setData } = useRunStatus(initial.id, initial);
  const [stale, setStale] = React.useState(false);
  const [rerendering, setRerendering] = React.useState(false);
  const [mobileTab, setMobileTab] = React.useState<'teks' | 'visual'>('teks');

  const run = data ?? initial;
  const content = run.content;

  function onSaved(draft: CopyDraft, needsRerender: boolean) {
    if (needsRerender) setStale(true);
    setData((current) =>
      current && current.content ? { ...current, content: { ...current.content, ...draft } } : current,
    );
  }

  async function rerender() {
    if (!content) return;
    setRerendering(true);

    const res = await fetch(`/api/content/${content.id}/rerender`, { method: 'POST' });
    setRerendering(false);

    if (res.ok) {
      setStale(false);
      // Polling menyala lagi begitu status run kembali PROCESSING.
      await refresh();
    }
  }

  const header = (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0">
        <Button asChild variant="ghost" size="sm" className="-ml-3 mb-1">
          <Link href="/content">
            <ArrowLeft aria-hidden /> Riwayat
          </Link>
        </Button>
        <h2 className="truncate text-lg font-semibold tracking-tight">
          {run.article?.title ?? content?.headline ?? 'Memproses…'}
        </h2>
        <a
          href={run.sourceUrl}
          target="_blank"
          rel="noreferrer noopener"
          className="mt-1 inline-flex items-center gap-1 text-sm text-muted hover:text-accent"
        >
          {run.article?.source ?? new URL(run.sourceUrl).hostname}
          <ExternalLink className="size-3" aria-hidden />
        </a>
      </div>

      {run.status === 'PARTIAL' && <Badge variant="warning">Sebagian gagal</Badge>}
      {run.status === 'DONE' && <Badge variant="success">Selesai</Badge>}
    </div>
  );

  // Sebelum teks siap, tidak ada yang bisa diedit — tampilkan progres saja.
  if (!content) {
    return (
      <div className="mx-auto max-w-work space-y-5">
        {header}
        <PipelineProgress run={run} />
      </div>
    );
  }

  const textPanel = (
    <Card>
      <CardContent className="py-5">
        <CopyEditor content={content} onSaved={onSaved} disabled={rerendering} />
      </CardContent>
    </Card>
  );

  const visualPanel = (
    <VisualPanel
      contentId={content.id}
      content={content}
      assets={content.assets}
      stale={stale}
      rerendering={rerendering}
      onRerender={rerender}
    />
  );

  return (
    <div className="space-y-5">
      {header}

      {isRunning && <PipelineProgress run={run} />}

      {/* Satu instance panel saja. Merender ulang panel untuk mobile dan
          desktop akan membuat dua editor dengan state terpisah — dan id
          form yang kembar. Yang berubah hanya panel mana yang terlihat. */}
      <div className="lg:hidden">
        <Tabs value={mobileTab} onValueChange={(value) => setMobileTab(value as 'teks' | 'visual')}>
          <TabsList className="w-full">
            <TabsTrigger value="teks" className="flex-1">
              Teks
            </TabsTrigger>
            <TabsTrigger value="visual" className="flex-1">
              Visual
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className={cn(mobileTab !== 'teks' && 'hidden lg:block')}>{textPanel}</div>
        <div className={cn(mobileTab !== 'visual' && 'hidden lg:block', 'lg:sticky lg:top-20 lg:self-start')}>
          {visualPanel}
        </div>
      </div>
    </div>
  );
}
