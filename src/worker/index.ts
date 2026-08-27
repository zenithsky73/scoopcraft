/**
 * Proses worker terpisah: `npm run worker`.
 * Next.js hanya memasukkan job ke antrean; semua pekerjaan berat
 * (scrape, AI, nanti render) dijalankan di sini.
 */
import 'dotenv/config';
import { Worker } from 'bullmq';
import type { JobType } from '@prisma/client';
import { getRedis, closeRedis } from '@/server/queue/connection';
import { QUEUE_NAMES, type PipelineJobData } from '@/server/queue/names';
import { processJob } from '@/worker/processors';
import { reapStaleJobs } from '@/server/pipeline/run-service';

const concurrency = Number(process.env.WORKER_CONCURRENCY ?? 3);

const worker = new Worker<PipelineJobData>(
  QUEUE_NAMES.PIPELINE,
  async (job) => {
    const isLastAttempt = job.attemptsMade + 1 >= (job.opts.attempts ?? 1);
    return processJob(job.name as JobType, { runId: job.data.runId, jobId: job.data.jobId }, { isLastAttempt });
  },
  { connection: getRedis(), concurrency },
);

// BullMQ menduplikasi koneksi Redis untuk blocking command; error dari
// koneksi duplikat itu muncul di sini, bukan di handler connection.ts.
let redisWarned = false;
worker.on('error', (err: NodeJS.ErrnoException) => {
  if (err.code === 'ECONNREFUSED') {
    if (redisWarned) return;
    redisWarned = true;
    console.error(
      `[worker] Redis tidak tersedia di ${process.env.REDIS_URL ?? 'redis://localhost:6379'}. ` +
        'Jalankan `docker compose up -d`, atau pakai QUEUE_DRIVER=inline untuk dev tanpa Redis.',
    );
    return;
  }
  console.error('[worker] error:', err.message);
});

worker.on('completed', (job) => {
  console.log(`[worker] ✓ ${job.name} run=${job.data.runId}`);
});

worker.on('failed', (job, err) => {
  console.error(`[worker] ✗ ${job?.name} run=${job?.data.runId}: ${err.message}`);
});

// Job yang tersangkut karena worker mati mendadak dibersihkan berkala.
const reaper = setInterval(() => {
  reapStaleJobs().catch((err) => console.error('[worker] reaper', err));
}, 5 * 60_000);
reaper.unref();

console.log(`[worker] siap · antrean ${QUEUE_NAMES.PIPELINE} · concurrency ${concurrency}`);

async function shutdown(signal: string) {
  console.log(`[worker] ${signal} — menutup...`);
  clearInterval(reaper);
  await worker.close();
  await closeRedis();
  process.exit(0);
}

process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));
