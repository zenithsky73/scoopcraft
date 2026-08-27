'use client';

import * as React from 'react';
import type { AssetStatus, DesignStyle, JobType, OutputFormat, SlideType } from '@prisma/client';

export type StepStatus = 'QUEUED' | 'PROCESSING' | 'DONE' | 'PARTIAL' | 'FAILED';

export type RunStep = {
  type: JobType;
  label: string;
  status: StepStatus;
  done: number;
  total: number;
  error: string | null;
  durationMs: number | null;
};

export type RunAsset = {
  id: string;
  style: DesignStyle;
  format: OutputFormat;
  slideIndex: number;
  slideType: SlideType;
  status: AssetStatus;
  imageUrl: string | null;
  width: number;
  height: number;
  error: string | null;
};

export type RunContent = {
  id: string;
  headline: string;
  feedCopy: string;
  caption: string;
  hashtags: string[];
  cta: string;
  angle: string;
  slides: { title: string; body: string }[];
  imageSource: string | null;
  visualUrl: string | null;
  assets: RunAsset[];
};

export type RunStatusResponse = {
  id: string;
  status: 'PENDING' | 'PROCESSING' | 'PARTIAL' | 'DONE' | 'FAILED';
  stepsDone: number;
  stepsTotal: number;
  error: string | null;
  sourceUrl: string;
  requestedStyles: DesignStyle[];
  requestedFormats: OutputFormat[];
  requestedSlides: number;
  steps: RunStep[];
  article: { id: string; title: string; source: string | null; wordCount: number | null } | null;
  content: RunContent | null;
};

const TERMINAL = new Set(['DONE', 'PARTIAL', 'FAILED']);

/**
 * Polling status pipeline.
 *
 * Intervalnya melambat sendiri: tahap awal (scrape, AI) berlangsung detik demi
 * detik sehingga poll cepat terasa responsif, tapi kalau sebuah run berjalan
 * lama, polling 1 detik hanya membebani server tanpa memberi informasi baru.
 * Polling berhenti total saat run mencapai status akhir.
 */
export function useRunStatus(runId: string | null, initial?: RunStatusResponse | null) {
  const [data, setData] = React.useState<RunStatusResponse | null>(initial ?? null);
  const [error, setError] = React.useState<string | null>(null);
  const attempt = React.useRef(0);

  const refresh = React.useCallback(async () => {
    if (!runId) return null;

    const res = await fetch(`/api/runs/${runId}/status`, { cache: 'no-store' });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? 'Gagal memuat status.');
      return null;
    }

    const json = (await res.json()) as RunStatusResponse;
    setError(null);
    setData(json);
    return json;
  }, [runId]);

  React.useEffect(() => {
    if (!runId) return;
    if (data && TERMINAL.has(data.status)) return;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    const tick = async () => {
      const json = await refresh();
      if (cancelled) return;
      if (json && TERMINAL.has(json.status)) return;

      attempt.current += 1;
      const delay = Math.min(1_000 + attempt.current * 500, 5_000);
      timer = setTimeout(tick, delay);
    };

    void tick();

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // `data` sengaja tidak masuk dependency: hook ini yang mengendalikan
    // kapan berhenti, bukan setiap perubahan data memicu efek baru.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runId, refresh]);

  const isRunning = !!data && !TERMINAL.has(data.status);

  return { data, error, isRunning, refresh, setData };
}
