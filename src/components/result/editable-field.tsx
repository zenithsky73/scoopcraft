'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Field teks yang tumbuh mengikuti isinya, dengan penghitung karakter.
 *
 * Batasnya ditegakkan lunak: mengetik melewati batas tidak diblokir, tapi
 * penghitungnya berubah merah dan tombol simpan dimatikan pemanggilnya.
 * Memblokir ketikan di tengah kalimat terasa seperti aplikasi rusak.
 */
export function EditableField({
  label,
  value,
  onChange,
  max,
  rows = 2,
  mono,
  id,
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
  max: number;
  rows?: number;
  mono?: boolean;
  id: string;
}) {
  const ref = React.useRef<HTMLTextAreaElement>(null);

  const resize = React.useCallback(() => {
    const node = ref.current;
    if (!node) return;
    node.style.height = 'auto';
    node.style.height = `${node.scrollHeight}px`;
  }, []);

  React.useEffect(resize, [value, resize]);

  // Tinggi dihitung dari scrollHeight, jadi harus dihitung ulang setiap kali
  // pembungkusan baris berubah: saat font Inter selesai dimuat (sebelum itu
  // teks diukur dengan font fallback yang lebih sempit) dan saat lebar layar
  // berubah. Tanpa ini, baris terakhir terpotong.
  React.useEffect(() => {
    const onResize = () => resize();
    window.addEventListener('resize', onResize);
    document.fonts?.ready.then(resize).catch(() => {});
    return () => window.removeEventListener('resize', onResize);
  }, [resize]);

  const over = value.length > max;

  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-medium">
          {label}
        </label>
        <span className={cn('text-2xs tabular-nums', over ? 'font-semibold text-danger' : 'text-muted')}>
          {value.length}/{max}
        </span>
      </div>
      <textarea
        id={id}
        ref={ref}
        rows={rows}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={cn('field resize-none overflow-hidden', mono && 'font-mono text-[13px]', over && 'border-danger focus:border-danger focus:ring-danger/25')}
      />
    </div>
  );
}
