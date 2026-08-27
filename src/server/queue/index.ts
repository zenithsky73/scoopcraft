import type { JobType } from '@prisma/client';
import { QUEUE_NAMES, type PipelineJobData } from '@/server/queue/names';

export type QueueDriver = 'redis' | 'inline';

export const QUEUE_DRIVER: QueueDriver =
  (process.env.QUEUE_DRIVER as QueueDriver) ?? (process.env.REDIS_URL ? 'redis' : 'inline');

export const JOB_OPTIONS = {
  attempts: Number(process.env.QUEUE_ATTEMPTS ?? 3),
  backoff: { type: 'exponential' as const, delay: 3_000 },
  removeOnComplete: { age: 3_600, count: 500 },
  removeOnFail: { age: 86_400 },
};

/**
 * Dua driver:
 *  - redis  : BullMQ, dipakai di produksi. Job dikerjakan proses worker terpisah.
 *  - inline : jalankan langsung di proses ini, tanpa Redis. Untuk dev di mesin
 *             yang belum punya Redis. Tidak ada retry, tidak tahan restart —
 *             jangan dipakai di produksi.
 */
export async function enqueueStep(data: PipelineJobData & { type: JobType }) {
  if (QUEUE_DRIVER === 'inline') {
    const { runInline } = await import('@/server/queue/inline');
    runInline(data);
    return;
  }

  const { getPipelineQueue } = await import('@/server/queue/queues');
  await getPipelineQueue().add(data.type, { runId: data.runId, jobId: data.jobId }, JOB_OPTIONS);
}

export { QUEUE_NAMES };
export type { PipelineJobData };
