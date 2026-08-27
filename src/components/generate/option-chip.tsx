'use client';

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Chip pilihan multi-select yang dipakai untuk gaya dan format. */
export function OptionChip({
  selected,
  disabled,
  onClick,
  label,
  hint,
  badge,
}: {
  selected: boolean;
  disabled?: boolean;
  onClick: () => void;
  label: string;
  hint?: string;
  badge?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
      title={hint}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border px-3 py-2 text-sm font-medium transition-colors',
        'disabled:cursor-not-allowed disabled:opacity-50',
        selected
          ? 'border-accent bg-accent-soft text-accent'
          : 'border-border bg-surface text-muted hover:border-fg/20 hover:text-fg',
      )}
    >
      {selected && <Check className="size-3.5 shrink-0" aria-hidden />}
      <span>{label}</span>
      {badge && (
        <span
          className={cn(
            'rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider',
            badge === 'PRO' ? 'bg-amber-500/20 text-amber-500' : 'bg-red-500/20 text-red-500',
          )}
        >
          {badge}
        </span>
      )}
      {hint && !badge && <span className="text-2xs font-normal opacity-70">{hint}</span>}
    </button>
  );
}
