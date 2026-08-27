'use client';

import { Check, CircleDashed, Loader2, TriangleAlert, X } from 'lucide-react';
import type { RunStep, RunStatusResponse, StepStatus } from '@/lib/run-status';
import { ProgressBar } from '@/components/ui/progress-bar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const ICONS: Record<StepStatus, typeof Check> = {
  QUEUED: CircleDashed,
  PROCESSING: Loader2,
  DONE: Check,
  PARTIAL: TriangleAlert,
  FAILED: X,
};

const TONES: Record<StepStatus, string> = {
  QUEUED: 'text-muted',
  PROCESSING: 'text-accent',
  DONE: 'text-success',
  PARTIAL: 'text-warning',
  FAILED: 'text-danger',
};

export function PipelineProgress({ run }: { run: RunStatusResponse }) {
  const failed = run.status === 'FAILED';
  const partial = run.status === 'PARTIAL';

  return (
    <Card>
      <CardContent className="space-y-4 py-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-sm font-semibold">
              {failed ? 'Proses gagal' : partial ? 'Sebagian selesai' : run.status === 'DONE' ? 'Selesai' : 'Memproses artikel…'}
            </p>
            <p className="hint mt-0.5 tabular-nums">
              {run.stepsDone} dari {run.stepsTotal} langkah
            </p>
          </div>
          {partial && <Badge variant="warning">Sebagian</Badge>}
          {failed && <Badge variant="danger">Gagal</Badge>}
        </div>

        <ProgressBar
          value={run.stepsDone}
          max={run.stepsTotal}
          tone={failed ? 'danger' : partial ? 'warning' : 'accent'}
        />

        <ol className="space-y-2.5">
          {run.steps.map((step) => (
            <StepRow key={step.type} step={step} />
          ))}
        </ol>

        {run.error && (
          <p className="rounded-md border border-danger/25 bg-danger/10 px-3 py-2 text-sm text-danger">{run.error}</p>
        )}

        {run.article && (
          <div className="rounded-md border border-border bg-surface-2 p-3">
            <p className="text-2xs font-medium uppercase tracking-wide text-muted">Artikel terdeteksi</p>
            <p className="mt-1 text-sm font-medium leading-snug">{run.article.title}</p>
            <p className="hint mt-1">
              {[run.article.source, run.article.wordCount ? `${run.article.wordCount} kata` : null]
                .filter(Boolean)
                .join(' · ')}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function StepRow({ step }: { step: RunStep }) {
  const Icon = ICONS[step.status];
  const spinning = step.status === 'PROCESSING';

  return (
    <li className="flex items-start gap-3">
      <Icon className={cn('mt-0.5 size-4 shrink-0', TONES[step.status], spinning && 'animate-spin')} aria-hidden />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-3">
          <span className={cn('text-sm', step.status === 'QUEUED' ? 'text-muted' : 'font-medium')}>
            {step.label}
            {/* Tahap render bercabang per slide dan format — tunjukkan berapa
                yang sudah jadi, bukan sekadar "sedang berjalan". */}
            {step.total > 1 && (
              <span className="ml-1.5 text-muted tabular-nums">
                {step.done}/{step.total}
              </span>
            )}
          </span>
          {step.durationMs !== null && (
            <span className="hint shrink-0 tabular-nums">{(step.durationMs / 1000).toFixed(1)}s</span>
          )}
        </div>
        {step.error && <p className="mt-0.5 text-xs text-danger">{step.error}</p>}
      </div>
    </li>
  );
}
