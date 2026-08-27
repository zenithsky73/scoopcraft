import type { DesignStyle, JobType, OutputFormat } from '@prisma/client';
import { estimateVisualCount } from '@/server/design/deck';

export type StepPlanInput = { styles: DesignStyle[]; formats: OutputFormat[]; slides?: number };

/** Satu tahap pipeline; `count` > 1 berarti tahap itu berisi beberapa job paralel. */
export type PlannedStep = { type: JobType; count: number };

/**
 * Bentuk pipeline untuk satu GenerationRun — satu-satunya tempat yang tahu
 * urutan dan jumlah job. `stepsTotal`, progress tracker, dan penentuan tahap
 * berikutnya semuanya dihitung dari sini.
 *
 * Dua tahap bercabang:
 *  - GENERATE_IMAGE: satu job per slide yang butuh gambar
 *  - RENDER_DESIGN : satu job per kombinasi style × format × slide
 *
 * Keduanya berjalan paralel, dan kegagalan satu cabang tidak menjatuhkan
 * yang lain.
 */
export function planSteps(input: StepPlanInput): PlannedStep[] {
  const slides = Math.max(1, input.slides ?? 1);
  const renders = Math.max(1, input.styles.length * input.formats.length * slides);
  // Satu gambar per slide (kecuali penutup) — bukan satu gambar untuk semua.
  const visuals = estimateVisualCount(slides);

  return [
    { type: 'SCRAPE', count: 1 },
    { type: 'ANALYZE', count: 1 },
    { type: 'GENERATE_CONTENT', count: 1 },
    { type: 'GENERATE_IMAGE', count: visuals },
    { type: 'RENDER_DESIGN', count: renders },
  ];
}

export function totalSteps(plan: PlannedStep[]) {
  return plan.reduce((sum, step) => sum + step.count, 0);
}

export function nextStep(plan: PlannedStep[], current: JobType): PlannedStep | null {
  const index = plan.findIndex((step) => step.type === current);
  if (index === -1 || index === plan.length - 1) return null;
  return plan[index + 1];
}

export const STEP_LABELS: Record<JobType, string> = {
  SCRAPE: 'Ambil artikel',
  ANALYZE: 'Analisis',
  GENERATE_CONTENT: 'Tulis konten',
  GENERATE_IMAGE: 'Siapkan visual',
  RENDER_DESIGN: 'Render desain',
};
