import type { DesignStyle } from '@prisma/client';

export type StyleTier = 'FREE' | 'PRO';

export type StyleDef = {
  id: DesignStyle;
  label: string;
  subLabel?: string;
  description: string;
  tier: StyleTier;
  available: boolean;
  accentColor: string;
  bgColor: string;
  textColor: string;
  badge?: string;
  instagramRef?: string;
  requiresBrandKit?: boolean;
};

export const STYLES: StyleDef[] = [
  // ─── 3 TEMPLATE GRATIS (TRIAL & GUEST) ───
  {
    id: 'BREAKING_NEWS',
    label: 'Breaking News Standar',
    subLabel: 'ala Portal Berita Populer',
    description: 'Format berita standar, banner merah tegas, foto latar, badge BREAKING.',
    tier: 'FREE',
    available: true,
    accentColor: '#EF4444',
    bgColor: '#0B0F19',
    textColor: '#FFFFFF',
    badge: 'GRATIS',
    instagramRef: '@beritaterkini',
  },
  {
    id: 'EDITORIAL',
    label: 'Editorial Nasional',
    subLabel: 'ala Jurnalisme Nasional',
    description: 'Format jurnalisme berita umum dengan tipografi serif koran standar.',
    tier: 'FREE',
    available: true,
    accentColor: '#DC2626',
    bgColor: '#18181B',
    textColor: '#FFFFFF',
    badge: 'GRATIS',
    instagramRef: '@redaksinasional',
  },
  {
    id: 'MODERN',
    label: 'Modern Clean Media',
    subLabel: 'ala Media Berita Bersih',
    description: 'Layout geometris sederhana, aksen biru sky, tipografi sans-serif standar.',
    tier: 'FREE',
    available: true,
    accentColor: '#0EA5E9',
    bgColor: '#0F172A',
    textColor: '#FFFFFF',
    badge: 'GRATIS',
    instagramRef: '@portalmodern',
  },

  // ─── 7 TEMPLATE PRO EKSKLUSIF (LOCKED 🔒) ───
  {
    id: 'FINANCE',
    label: 'Finansial & Cuan',
    subLabel: 'ala @ngomonginuang & @mikirduit',
    description: 'Emerald green & deep navy, kartu data rapi, angka metrik tebal, sangat berwibawa.',
    tier: 'PRO',
    available: true,
    accentColor: '#10B981',
    bgColor: '#064E3B',
    textColor: '#FFFFFF',
    badge: '🔒 PRO',
    instagramRef: '@ngomonginuang / @mikirduit',
  },
  {
    id: 'TECH',
    label: 'Saham & Trading Tech',
    subLabel: 'ala @supercuansaham.id',
    description: 'Tema gelap modern, aksen neon gold/cyan, kartu ticker & analisis poin padat.',
    tier: 'PRO',
    available: true,
    accentColor: '#F59E0B',
    bgColor: '#0F172A',
    textColor: '#FFFFFF',
    badge: '🔒 PRO',
    instagramRef: '@supercuansaham.id',
  },
  {
    id: 'LIFESTYLE',
    label: 'Tentang Kampus & Edukasi',
    subLabel: 'ala @tentangkampus_id',
    description: 'Kartu pastel lembut ramah Gen-Z, font bulat bersahabat, ikon edukasi rapi.',
    tier: 'PRO',
    available: true,
    accentColor: '#EC4899',
    bgColor: '#FDF2F8',
    textColor: '#1E293B',
    badge: '🔒 PRO',
    instagramRef: '@tentangkampus_id',
  },
  {
    id: 'BOLD',
    label: 'Sport & Dynamic Energy',
    subLabel: 'ala @kepoball',
    description: 'Tipografi miring ultra-bold, efek glow berenergi tinggi, aksen kuning kontras.',
    tier: 'PRO',
    available: true,
    accentColor: '#FACC15',
    bgColor: '#0A0A0A',
    textColor: '#FFFFFF',
    badge: '🔒 PRO',
    instagramRef: '@kepoball',
  },
  {
    id: 'CORPORATE',
    label: 'Karier & Networking',
    subLabel: 'ala @ilmu_networking & @official.indeed',
    description: 'Desain korporat bersih, kartu tips bertingkat (1-2-3), layout profesional LinkedIn.',
    tier: 'PRO',
    available: true,
    accentColor: '#2563EB',
    bgColor: '#0F172A',
    textColor: '#FFFFFF',
    badge: '🔒 PRO',
    instagramRef: '@ilmu_networking',
  },
  {
    id: 'CUSTOM_BRAND',
    label: 'Fakta Pop & Trivia',
    subLabel: 'ala @voxpopular.id & @faktadanmitos',
    description: 'Warna pop vibrant, kartu Fakta vs Mitos, badge Taukah Kamu, memancing rasa penasaran.',
    tier: 'PRO',
    available: true,
    accentColor: '#8B5CF6',
    bgColor: '#1E1B4B',
    textColor: '#FFFFFF',
    badge: '🔒 PRO',
    instagramRef: '@voxpopular.id',
  },
  {
    id: 'MINIMAL',
    label: 'Minimalist Pure',
    subLabel: 'ala Media Seni & Kreatif',
    description: 'Banyak ruang bernapas, minimalis tanpa distraksi, sangat bersih dan estetis.',
    tier: 'PRO',
    available: true,
    accentColor: '#6366F1',
    bgColor: '#090D16',
    textColor: '#FFFFFF',
    badge: '🔒 PRO',
    instagramRef: '@minimalmedia',
  },
];

export const AVAILABLE_STYLES = STYLES.filter((s) => s.available);
export const FREE_STYLES = AVAILABLE_STYLES.filter((s) => s.tier === 'FREE');
export const PRO_STYLES = AVAILABLE_STYLES.filter((s) => s.tier === 'PRO');
export const DEFAULT_STYLE: DesignStyle = 'BREAKING_NEWS';

export function isProStyle(style: DesignStyle): boolean {
  const def = STYLES.find((s) => s.id === style);
  return def?.tier === 'PRO';
}
