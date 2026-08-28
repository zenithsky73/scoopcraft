import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getViewer } from '@/server/viewer';
import { db } from '@/server/db';
import { getRun } from '@/server/pipeline/run-service';
import { planSteps, STEP_LABELS } from '@/server/pipeline/steps';
import { CarouselStudio } from '@/components/studio/carousel-studio';
import { ResultView } from '@/components/result/result-view';
import { ContentClientLoader } from '@/components/studio/content-client-loader';
import type { RunStatusResponse } from '@/lib/run-status';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Studio Konten & Carousel' };

export default async function ContentDetailPage({ params }: { params: { id: string } }) {
  const viewer = await getViewer();
  if (!viewer) redirect('/login');

  let run: any = null;
  try {
    run = await getRun(params.id, viewer.user.id);
  } catch (err) {
    console.warn('[ContentDetailPage] getRun failed:', err);
  }

  // Jika run tidak ditemukan di DB (misal saat DB cold-start / client-side instant generation)
  if (!run) {
    return <ContentClientLoader id={params.id} />;
  }

  const user = await db.user.findUnique({
    where: { id: viewer.user.id },
    select: { role: true, plan: true },
  });
  const isProUser = user?.role === 'OWNER' || user?.plan === 'PRO' || user?.plan === 'BUSINESS';

  if (run.generatedContent) {
    const rawSlides = run.generatedContent.slides as any;
    const slideList = Array.isArray(rawSlides?.slides)
      ? rawSlides.slides
      : Array.isArray(rawSlides)
      ? rawSlides
      : [];

    return (
      <CarouselStudio
        initialContent={{
          headline: run.generatedContent.headline,
          caption: run.generatedContent.caption,
          hashtags: run.generatedContent.hashtags,
          cta: run.generatedContent.cta,
          angle: run.generatedContent.angle,
          slides: slideList,
        }}
        article={{
          title: run.article?.title || run.generatedContent.headline,
          source: run.article?.source || 'Newsly AI',
          url: run.article?.url,
          imageUrl: run.generatedContent.visualUrl || run.article?.imageUrl,
          author: run.article?.author || 'Redaksi',
        }}
        initialStyle={run.requestedStyles[0] || 'BREAKING_NEWS'}
        initialFormat={run.requestedFormats[0] || 'FEED_PORTRAIT'}
        isProUser={isProUser}
      />
    );
  }

  const plan = planSteps({
    styles: run.requestedStyles,
    formats: run.requestedFormats,
    slides: run.requestedSlides,
  });

  const steps = plan.map((step) => {
    const jobs = run.jobs.filter((job: any) => job.type === step.type);
    const done = jobs.filter((job: any) => job.status === 'DONE').length;
    const failed = jobs.filter((job: any) => job.status === 'FAILED').length;

    let status: RunStatusResponse['steps'][number]['status'] = 'QUEUED';
    if (jobs.some((job: any) => job.status === 'PROCESSING')) status = 'PROCESSING';
    else if (done === step.count) status = 'DONE';
    else if (done + failed === step.count) status = done > 0 ? 'PARTIAL' : 'FAILED';

    return {
      type: step.type,
      label: STEP_LABELS[step.type],
      status,
      done,
      total: step.count,
      error: jobs.find((job: any) => job.error)?.error ?? null,
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
    content: null,
  };

  return <ResultView initial={initial} />;
}
