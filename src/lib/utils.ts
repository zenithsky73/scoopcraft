import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string, opts?: Intl.DateTimeFormatOptions) {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', ...opts }).format(d);
}

/** Sisa hari (dibulatkan ke atas), minimal 0. */
export function daysUntil(date: Date | null | undefined, now = new Date()) {
  if (!date) return 0;
  const ms = date.getTime() - now.getTime();
  if (ms <= 0) return 0;
  return Math.ceil(ms / 86_400_000);
}
