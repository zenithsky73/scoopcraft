import type { JobType } from '@prisma/client';
import type { PipelineJobData } from '@/server/queue/names';

/**
 * Driver dev tanpa Redis. Job dijalankan asinkron di proses yang sama supaya
 * request HTTP tetap balas cepat; kegagalan hanya dicatat ke log dan ditandai
 * di database oleh processor-nya sendiri.
 */
export function runInline(data: PipelineJobData & { type: JobType }) {
  setImmediate(async () => {
    try {
      // Import dinamis memutus siklus: processor → run-service → queue → inline.
      const { processJob } = await import('@/worker/processors');
      await processJob(data.type, data);
    } catch (err) {
      console.error('[queue:inline]', data.type, err);
    }
  });
}
