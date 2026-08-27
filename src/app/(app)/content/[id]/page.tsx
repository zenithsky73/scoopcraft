import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { getViewer } from '@/server/viewer';
import { getRun } from '@/server/pipeline/run-service';
import { planSteps, STEP_LABELS } from '@/server/pipeline/steps';
import { slidesFromJson } from '@/server/design/slides-json';
import { ResultView } from '@/components/result/result-view';
import type { RunStatusResponse } from '@/lib/run-status';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Hasil' };

/**
 * Status awal dirender di server supaya halaman langsung berisi — tanpa ini
 * user melihat kerangka kosong dulu sampai polling pertama kembali.
 * Selanjutnya komponen klien yang mengambil alih.
 */
export default async function ContentDetailPage({ params }: { params: { id: string } }) {
  const viewer = await getViewer();
  if (!viewer) redirect('/login');

  const run = await getRun(params.id, viewer.user.id);
  if (!run) notFound();

  const plan = planSteps({
    styles: run.requestedStyles,
    formats: run.requestedFormats,
    slides: run.requestedSlides,
  });

  const steps = plan.map((step) => {
    const jobs = run.jobs.filter((job) => job.type === step.type);
    const done = jobs.filter((job) => job.status === 'DONE').length;
    const failed = jobs.filter((job) => job.status === 'FAILED').length;

    let status: RunStatusResponse['steps'][number]['status'] = 'QUEUED';
    if (jobs.some((job) => job.status === 'PROCESSING')) status = 'PROCESSING';
    else if (done === step.count) status = 'DONE';
    else if (done + failed === step.count) status = done > 0 ? 'PARTIAL' : 'FAILED';

    return {
      type: step.type,
      label: STEP_LABELS[step.type],
      status,
      done,
      total: step.count,
      error: jobs.find((job) => job.error)?.error ?? null,
      durationMs: null,
    };
  });

  const initial: RunStatusResponse = {
    id: run.id,
    status: run.status,
    stepsDone: run.stepsDone,
    stepsTotal: run.stepsTotal,
    error: run.error,
    sourceUrl: run.sourceUrl,
    requestedStyles: run.requestedStyles,
    requestedFormats: run.requestedFormats,
    requestedSlides: run.requestedSlides,
    steps,
    article: run.article
      ? { id: run.article.id, title: run.article.title, source: run.article.source, wordCount: run.article.wordCount }
      : null,
    content: run.generatedContent
      ? {
          id: run.generatedContent.id,
          headline: run.generatedContent.headline,
          feedCopy: run.generatedContent.feedCopy,
          caption: run.generatedContent.caption,
          hashtags: run.generatedContent.hashtags,
          cta: run.generatedContent.cta,
          angle: run.generatedContent.angle,
          slides: slidesFromJson(run.generatedContent.slides),
          imageSource: run.generatedContent.imageSource,
          visualUrl: run.generatedContent.visualUrl,
          assets: run.generatedContent.assets,
        }
      : null,
  };

  return <ResultView initial={initial} />;
}
