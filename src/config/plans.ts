import type { Plan } from '@prisma/client';

export type PaidPlan = Exclude<Plan, 'TRIAL'>;

export type PlanDef = {
  id: PaidPlan;
  name: string;
  price: number; // IDR / bulan, 0 = trial
  quota: number; // -1 = tanpa batas
  highlight?: boolean;
  features: string[];
};

export const PLANS: Record<PaidPlan, PlanDef> = {
  BASIC: {
    id: 'BASIC',
    name: 'Basic',
    price: 99_000,
    quota: 50,
    features: [
      '50 generate / bulan',
      '3 template desain Free',
      'Semua format (Feed 1:1, 4:5, Story)',
      'Ekstraksi link berita',
      'Riwayat 30 hari',
    ],
  },
  PRO: {
    id: 'PRO',
    name: 'Pro',
    price: 199_000,
    quota: 200,
    highlight: true,
    features: [
      '200 generate / bulan',
      'Semua 9 visual desain (Free & Pro)',
      'Ekstraksi video YouTube & transkrip',
      'Ekspor Carousel LinkedIn (PDF)',
      'Kustomisasi & ganti foto per slide',
      'Unduh batch ZIP + naskah caption',
      'Riwayat tanpa batas',
    ],
  },
  BUSINESS: {
    id: 'BUSINESS',
    name: 'Business',
    price: 499_000,
    quota: -1,
    features: [
      'Generate tanpa batas',
      'Semua fitur paket Pro',
      'Brand kit lengkap (logo, warna, font)',
      'Template Custom Brand',
      'Prioritas antrean render',
    ],
  },
};

export const PLAN_LIST = Object.values(PLANS);

/** Panjang satu siklus tagihan. Kuota berbayar direset tiap periode ini. */
export const PLAN_RESET_DAYS = Number(process.env.PLAN_RESET_DAYS ?? 30);

export function quotaForPlan(plan: Plan, trialQuota: number) {
  if (plan === 'TRIAL') return trialQuota;
  return PLANS[plan].quota;
}

export function formatIDR(value: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value);
}
