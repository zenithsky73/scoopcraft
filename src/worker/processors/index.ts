import { UnrecoverableError } from 'bullmq';
import type { JobType, Prisma } from '@prisma/client';
import { startJob, completeJob, failJob } from '@/server/pipeline/run-service';
import { isAiError } from '@/server/ai';
import { isScrapeError } from '@/server/scraper';
import { processScrape } from '@/worker/processors/scrape';
import { processAnalyze } from '@/worker/processors/analyze';
import { processGenerateContent } from '@/worker/processors/generate-content';
import { processGenerateImage } from '@/worker/processors/generate-image';
import { processRenderDesign } from '@/worker/processors/render-design';
import type { StepContext } from '@/worker/processors/types';

type Handler = (ctx: StepContext) => Promise<unknown>;

const HANDLERS: Record<JobType, Handler> = {
  SCRAPE: processScrape,
  ANALYZE: processAnalyze,
  GENERATE_CONTENT: processGenerateContent,
  GENERATE_IMAGE: processGenerateImage,
  RENDER_DESIGN: processRenderDesign,
};

/**
 * Kegagalan dipilah: yang tidak masuk akal untuk diulang (URL tidak valid,
 * paywall, AI menolak) dilempar sebagai UnrecoverableError supaya BullMQ
 * berhenti mencoba dan run langsung ditandai gagal.
 */
function isRetryable(err: unknown) {
  if (isAiError(err)) return err.retryable;
  if (isScrapeError(err)) return err.code === 'TIMEOUT' || err.code === 'FETCH_FAILED';
  return true;
}

export async function processJob(
  type: JobType,
  ctx: StepContext,
  options: { isLastAttempt?: boolean } = {},
) {
  const handler = HANDLERS[type];
  if (!handler) throw new UnrecoverableError(`Step ${type} belum diimplementasikan.`);

  await startJob(ctx.jobId);

  try {
    const result = await handler(ctx);
    await completeJob(ctx.jobId, (result ?? {}) as Prisma.InputJsonValue);
    return result;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const retryable = isRetryable(err);
    const final = !retryable || (options.isLastAttempt ?? true);

    await failJob(ctx.jobId, message, final);

    if (!retryable) throw new UnrecoverableError(message);
    throw err;
  }
}

export { HANDLERS };
