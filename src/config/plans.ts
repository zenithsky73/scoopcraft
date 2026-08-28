import type { Plan } from '@prisma/client';

export type PaidPlan = Exclude<Plan, 'TRIAL'>;

export type PlanDef = {
  id: PaidPlan;
  name: string;
  subName?: string;
  price: number; // IDR / bulan, 0 = trial
  quota: number; // 25, 100, 500
  quotaLabel: string;
  highlight?: boolean;
  badge?: string;
  features: string[];
};

export const PLANS: Record<PaidPlan, PlanDef> = {
  BASIC: {
    id: 'BASIC',
    name: 'Lite / Pemula',
    subName: 'Cocok untuk coba-coba & kreator pemula',
    price: 19_000,
    quota: 25,
    quotaLabel: '25 Generate / bulan',
    badge: 'Paling Hemat',
    features: [
      '25 generate konten / bulan (~1 konten/hari)',
      'Semua 10 template visual media Instagram',
      'Ekstraksi link portal berita & naskah teks',
      'Foto otomatis per slide (Unsplash HD)',
      'Semua rasio (Feed 1:1, 4:5, Story 9:16)',
      'Ekspor gambar PNG resolusi tinggi',
      'Riwayat konten 30 hari',
    ],
  },
  PRO: {
    id: 'PRO',
    name: 'Kreator Pro',
    subName: 'Pilihan paling ideal untuk konten harian',
    price: 49_000,
    quota: 100,
    quotaLabel: '100 Generate / bulan',
    highlight: true,
    badge: 'Paling Laris ⭐',
    features: [
      '100 generate konten / bulan (~3-4 konten/hari)',
      'Semua 10 template visual media Instagram',
      'Kustomisasi Watermark Brand (@akun sendiri)',
      'Bebas ganti & unggah foto kustom per slide',
      'Ekspor Carousel LinkedIn (Dokumen PDF)',
      'Input link video YouTube & prompt ide AI',
      'Unduh batch ZIP + naskah caption lengkap',
      'Riwayat konten tanpa batas',
      'Kecepatan AI Prioritas',
    ],
  },
  BUSINESS: {
    id: 'BUSINESS',
    name: 'Sultan / Agensi',
    subName: 'Untuk agensi, UMKM & admin multi-akun',
    price: 99_000,
    quota: 500,
    quotaLabel: 'Unlimited ⚡ (FUP 500/bulan)',
    badge: 'Super Cuan 👑',
    features: [
      'Generate Konten UNLIMITED (FUP 500/bln)',
      'Semua fitur Paket Kreator Pro',
      'Kustomisasi Brand Kit lengkap (Logo, Warna, Font)',
      'Prioritas antrean AI & render paling cepat',
      'Bebas kelola banyak akun media sosial',
      'Dukungan VIP & akses fitur baru duluan',
    ],
  },
};

export const PLAN_LIST = Object.values(PLANS);

/** Panjang satu siklus tagihan. Kuota berbayar direset tiap periode ini. */
export const PLAN_RESET_DAYS = Number(process.env.PLAN_RESET_DAYS ?? 30);

export function quotaForPlan(plan: Plan, trialQuota: number) {
  if (plan === 'TRIAL') return trialQuota;
  return PLANS[plan]?.quota ?? trialQuota;
}

export function formatIDR(value: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value);
}
