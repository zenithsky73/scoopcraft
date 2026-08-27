import type { DesignStyle } from '@prisma/client';

export type StyleTier = 'FREE' | 'PRO';

export type StyleDef = {
  id: DesignStyle;
  label: string;
  description: string;
  tier: StyleTier;
  available: boolean;
  accentColor: string;
  badge?: string;
  /** Butuh plan BUSINESS (brand kit). */
  requiresBrandKit?: boolean;
};

export const STYLES: StyleDef[] = [
  // Free Tiers
  {
    id: 'MINIMAL',
    label: 'Minimal',
    description: 'Banyak ruang kosong, tipografi modern & tenang.',
    tier: 'FREE',
    available: true,
    accentColor: '#4F46E5',
  },
  {
    id: 'BREAKING_NEWS',
    label: 'Breaking News',
    description: 'Kontras tinggi, banner merah, urgensi berita utama.',
    tier: 'FREE',
    available: true,
    accentColor: '#DC2626',
    badge: 'BREAKING',
  },
  {
    id: 'MODERN',
    label: 'Modern Clean',
    description: 'Layout geometris, aksen blok tegas ala media teknologi modern.',
    tier: 'FREE',
    available: true,
    accentColor: '#0EA5E9',
  },

  // Pro Tiers
  {
    id: 'BOLD',
    label: 'Bold Impact',
    description: 'Tema gelap ultra-bold, aksen kuning kontras tinggi, foto per slide.',
    tier: 'PRO',
    available: true,
    accentColor: '#FACC15',
    badge: 'PRO',
  },
  {
    id: 'EDITORIAL',
    label: 'Editorial Serif',
    description: 'Kemewahan majalah premium, tipografi serif klasik & garis koran mewah.',
    tier: 'PRO',
    available: true,
    accentColor: '#B45309',
    badge: 'PRO',
  },
  {
    id: 'TECH',
    label: 'Tech HUD',
    description: 'Nuansa cyberpunk/terminal, font monospace, aksen neon emerald & cyan.',
    tier: 'PRO',
    available: true,
    accentColor: '#10B981',
    badge: 'PRO',
  },
  {
    id: 'FINANCE',
    label: 'Finance & Stat',
    description: 'Aura Bloomberg/FT, latar warm paper, metrik angka & grafik finansial.',
    tier: 'PRO',
    available: true,
    accentColor: '#047857',
    badge: 'PRO',
  },
  {
    id: 'CORPORATE',
    label: 'Corporate Pro',
    description: 'Wibawa McKinsey/HBR, deep navy & clean white, penekanan poin eksekutif.',
    tier: 'PRO',
    available: true,
    accentColor: '#1E40AF',
    badge: 'PRO',
  },
  {
    id: 'LIFESTYLE',
    label: 'Lifestyle Pastel',
    description: 'Hangat, elegan, kartu rounded dengan gradasi lembut untuk travel & kuliner.',
    tier: 'PRO',
    available: true,
    accentColor: '#F43F5E',
    badge: 'PRO',
  },
  {
    id: 'CUSTOM_BRAND',
    label: 'Custom Brand',
    description: 'Pakai logo, warna, dan font brand kit kustom Anda.',
    tier: 'PRO',
    available: false,
    accentColor: '#8B5CF6',
    badge: 'BUSINESS',
    requiresBrandKit: true,
  },
];

export const AVAILABLE_STYLES = STYLES.filter((s) => s.available);
export const FREE_STYLES = AVAILABLE_STYLES.filter((s) => s.tier === 'FREE');
export const PRO_STYLES = AVAILABLE_STYLES.filter((s) => s.tier === 'PRO');
export const DEFAULT_STYLE: DesignStyle = 'MINIMAL';

export function isProStyle(style: DesignStyle): boolean {
  const def = STYLES.find((s) => s.id === style);
  return def?.tier === 'PRO';
}
