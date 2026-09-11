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
    price: 49_000,
    quota: 30,
    quotaLabel: '30 Generate / bulan',
    badge: 'Paling Hemat',
    features: [
      '30 generate konten AI / bulan (~1 konten/hari)',
      'Semua 20 template visual media Instagram',
      'Ekstraksi link produk, web, video & naskah teks',
      'Foto otomatis per slide (Unsplash HD)',
      'Semua rasio (Feed 1:1, 4:5, Story 9:16)',
      'Ekspor gambar PNG resolusi tinggi',
      'Akses Kalender Konten & Simulator Jadwal',
      'Riwayat konten 30 hari',
    ],
  },
  PRO: {
    id: 'PRO',
    name: 'Kreator Pro',
    subName: 'Pilihan paling ideal untuk konten harian & auto-post',
    price: 99_000,
    quota: 100,
    quotaLabel: '100 Generate / bulan',
    highlight: true,
    badge: 'Paling Laris ⭐',
    features: [
      '100 generate konten AI / bulan (~3-4 konten/hari)',
      '🚀 Auto-Post Otomatis ke Instagram & LinkedIn (Live)',
      '🤖 AI Campaign 30 Hari Auto-Pilot (Sekali Klik)',
      '📅 Kalender Konten & Penjadwalan Tanpa Batas',
      '📱 Hubungkan hingga 3 Akun Media Sosial',
      'Kustomisasi Watermark Brand (@akun sendiri)',
      'Bebas ganti & unggah foto kustom per slide',
      'Ekspor Carousel LinkedIn (Dokumen PDF)',
      'Input link video YouTube & prompt ide AI',
      'Unduh batch ZIP + naskah caption lengkap',
      'Riwayat konten tanpa batas & AI Prioritas',
    ],
  },
  BUSINESS: {
    id: 'BUSINESS',
    name: 'Sultan / Agensi',
    subName: 'Untuk agensi, UMKM & admin multi-akun klien',
    price: 199_000,
    quota: 500,
    quotaLabel: 'Unlimited ⚡ (FUP 500/bulan)',
    badge: 'Super Cuan 👑',
    features: [
      'Generate Konten UNLIMITED (FUP 500/bln)',
      '👑 Auto-Post Multi-Akun (Hingga 10 Akun Medsos Klien)',
      '🏢 Multi-Brand Campaign 30 Hari Auto-Pilot',
      'Semua fitur Paket Kreator Pro lengkap',
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
