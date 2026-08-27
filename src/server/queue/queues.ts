import { Queue } from 'bullmq';
import { getRedis } from '@/server/queue/connection';
import { QUEUE_NAMES, type PipelineJobData } from '@/server/queue/names';

const globalForQueues = globalThis as unknown as { pipelineQueue?: Queue<PipelineJobData> };

export function getPipelineQueue() {
  if (!globalForQueues.pipelineQueue) {
    globalForQueues.pipelineQueue = new Queue<PipelineJobData>(QUEUE_NAMES.PIPELINE, {
      connection: getRedis(),
    });
  }
  return globalForQueues.pipelineQueue;
}
