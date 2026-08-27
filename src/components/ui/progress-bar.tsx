import { cn } from '@/lib/utils';

/** Bar tipis flat — dipakai QuotaMeter dan progress pipeline (modul 5). */
export function ProgressBar({
  value,
  max = 100,
  className,
  tone = 'accent',
}: {
  value: number;
  max?: number;
  className?: string;
  tone?: 'accent' | 'warning' | 'danger';
}) {
  const pct = max <= 0 ? 0 : Math.min(100, Math.max(0, (value / max) * 100));
  const tones = { accent: 'bg-accent', warning: 'bg-warning', danger: 'bg-danger' };
  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      className={cn('h-1.5 w-full overflow-hidden rounded-sm bg-surface-2', className)}
    >
      <div className={cn('h-full rounded-sm transition-[width] duration-500', tones[tone])} style={{ width: `${pct}%` }} />
    </div>
  );
}
