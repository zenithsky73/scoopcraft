// BullMQ menolak nama antrean yang mengandung ":" (dipakai internal
// sebagai pemisah key Redis) — pakai tanda hubung.
export const QUEUE_NAMES = {
  /** Rantai step teks: scrape → analyze → generate content. */
  PIPELINE: 'scoopcraft-pipeline',
  /** Render gambar per format (modul 4). */
  RENDER: 'scoopcraft-render',
} as const;

export type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES];

/** Data job sengaja minimal — database tetap sumber kebenaran. */
export type PipelineJobData = { runId: string; jobId: string };
