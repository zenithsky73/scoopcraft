'use client';

import { cn } from '@/lib/utils';
import { SLIDES } from '@/server/design/deck';

const OPTIONS = [1, 3, 5, 7];

/**
 * Pilihan jumlah slide. Angka ditampilkan sebagai preset, bukan input bebas:
 * 2 slide dan 4 slide jarang masuk akal untuk carousel berita, dan preset
 * membuat pilihannya jelas dalam satu ketukan di layar kecil.
 */
export function SlideSelector({
  value,
  onChange,
  disabled,
}: {
  value: number;
  onChange: (next: number) => void;
  disabled?: boolean;
}) {
  return (
    <div>
      <p className="label">Jumlah slide</p>
      <div className="flex flex-wrap gap-2">
        {OPTIONS.filter((option) => option <= SLIDES.max).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            disabled={disabled}
            aria-pressed={value === option}
            className={cn(
              'min-w-[92px] rounded-md border px-3 py-2 text-sm font-medium transition-colors',
              'disabled:cursor-not-allowed disabled:opacity-50',
              value === option
                ? 'border-accent bg-accent-soft text-accent'
                : 'border-border bg-surface text-muted hover:border-fg/20 hover:text-fg',
            )}
          >
            {option === 1 ? 'Tunggal' : `${option} slide`}
          </button>
        ))}
      </div>
      <p className="hint mt-1.5">
        {value === 1
          ? 'Satu gambar berisi judul dan visual utama.'
          : `Cover + ${value - 2} poin penting + penutup. Menyesuaikan kalau poinnya lebih sedikit.`}
      </p>
    </div>
  );
}
