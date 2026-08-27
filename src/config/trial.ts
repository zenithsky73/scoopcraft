/**
 * Aturan trial dibuat env-driven supaya bisa diubah tanpa deploy ulang kode.
 * mode:
 *  - FIRST_EXHAUSTED : habis kalau hari ATAU kuota duluan habis (default)
 *  - DAYS_ONLY       : hanya batas hari
 *  - QUOTA_ONLY      : hanya batas jumlah generate
 */
export type TrialMode = 'FIRST_EXHAUSTED' | 'DAYS_ONLY' | 'QUOTA_ONLY';

function num(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

/**
 * Batas percobaan tanpa mendaftar. Sengaja kecil: tiap generate memanggil
 * Claude dan model gambar, jadi biayanya nyata dan bisa disalahgunakan.
 */
export const GUEST = {
  quota: num(process.env.GUEST_QUOTA, 1),
  /** Pagar kedua terhadap orang yang menghapus cookie berulang kali. */
  perIpPerDay: num(process.env.GUEST_IP_LIMIT, 3),
  /** Gaya desain yang boleh dicoba tanpa akun. */
  enabled: process.env.GUEST_TRIAL !== '0',
} as const;

export const TRIAL = {
  durationDays: num(process.env.TRIAL_DURATION_DAYS, 14),
  quota: num(process.env.TRIAL_QUOTA, 10),
  mode: (process.env.TRIAL_MODE as TrialMode) || 'FIRST_EXHAUSTED',
} as const;
