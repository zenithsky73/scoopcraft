import type { DesignStyle } from '@prisma/client';

export type StyleTokens = {
  label: string;
  bg: string;
  fg: string;
  muted: string;
  accent: string;
  accentFg: string;
  rule: string;
  /** Gelap di atas foto agar teks tetap terbaca. */
  scrim: string;
  headlineWeight: number;
  headlineTracking: string;
  badgeText: string | null;
  /** Latar cadangan saat tidak ada gambar sama sekali. */
  fallbackBg: string;
  cardBg?: string;
  fontFamily?: string;
  headlineFont?: string;
};

export const STYLE_TOKENS: Record<
  'MINIMAL' | 'BREAKING_NEWS' | 'MODERN' | 'BOLD' | 'EDITORIAL' | 'TECH' | 'FINANCE' | 'CORPORATE' | 'LIFESTYLE',
  StyleTokens
> = {
  MINIMAL: {
    label: 'Minimal',
    bg: '#FFFFFF',
    fg: '#0F172A',
    muted: '#64748B',
    accent: '#4F46E5',
    accentFg: '#FFFFFF',
    rule: '#E2E8F0',
    scrim: 'linear-gradient(180deg, rgba(15,23,42,0) 40%, rgba(15,23,42,.55) 100%)',
    headlineWeight: 700,
    headlineTracking: '-0.022em',
    badgeText: null,
    fallbackBg: 'linear-gradient(140deg,#EEF2FF,#E0E7FF 55%,#C7D2FE)',
  },
  BREAKING_NEWS: {
    label: 'Breaking News',
    bg: '#0B1120',
    fg: '#FFFFFF',
    muted: '#94A3B8',
    accent: '#DC2626',
    accentFg: '#FFFFFF',
    rule: 'rgba(255,255,255,.16)',
    scrim: 'linear-gradient(180deg, rgba(11,17,32,.35) 0%, rgba(11,17,32,.72) 52%, rgba(11,17,32,.96) 100%)',
    headlineWeight: 800,
    headlineTracking: '-0.024em',
    badgeText: 'BREAKING',
    fallbackBg: 'linear-gradient(140deg,#1E1B4B,#0B1120 60%,#450A0A)',
  },
  MODERN: {
    label: 'Modern Clean',
    bg: '#0F172A',
    fg: '#F8FAFC',
    muted: '#94A3B8',
    accent: '#0EA5E9',
    accentFg: '#0F172A',
    rule: 'rgba(255,255,255,.12)',
    scrim: 'linear-gradient(180deg, rgba(15,23,42,.2) 0%, rgba(15,23,42,.75) 50%, rgba(15,23,42,.98) 100%)',
    headlineWeight: 800,
    headlineTracking: '-0.025em',
    badgeText: 'UPDATE',
    fallbackBg: 'linear-gradient(140deg,#0369A1,#0F172A 60%,#082F49)',
    cardBg: 'rgba(30, 41, 59, 0.7)',
  },
  BOLD: {
    label: 'Bold Impact',
    bg: '#0B0B0F',
    fg: '#FFFFFF',
    muted: '#A1A1AA',
    accent: '#FACC15',
    accentFg: '#0B0B0F',
    rule: 'rgba(255,255,255,.14)',
    scrim: 'linear-gradient(180deg, rgba(11,11,15,.15) 0%, rgba(11,11,15,.62) 48%, rgba(11,11,15,.97) 100%)',
    headlineWeight: 900,
    headlineTracking: '-0.03em',
    badgeText: null,
    fallbackBg: 'linear-gradient(140deg,#1F1300,#0B0B0F 60%,#0B0B0F)',
  },
  EDITORIAL: {
    label: 'Editorial Serif',
    bg: '#FDFBF7',
    fg: '#1A1817',
    muted: '#78716C',
    accent: '#B45309',
    accentFg: '#FFFFFF',
    rule: '#D6D3D1',
    scrim: 'linear-gradient(180deg, rgba(26,24,23,0) 30%, rgba(26,24,23,.7) 100%)',
    headlineWeight: 700,
    headlineTracking: '-0.015em',
    badgeText: 'EDITORIAL',
    fallbackBg: 'linear-gradient(140deg,#F5EBE6,#E7E5E4 50%,#D6D3D1)',
    fontFamily: "Georgia, 'Times New Roman', serif",
    headlineFont: "'Playfair Display', Georgia, 'Times New Roman', serif",
    cardBg: '#FFFFFF',
  },
  TECH: {
    label: 'Tech HUD',
    bg: '#050811',
    fg: '#E2E8F0',
    muted: '#64748B',
    accent: '#10B981',
    accentFg: '#050811',
    rule: 'rgba(16,185,129,.25)',
    scrim: 'linear-gradient(180deg, rgba(5,8,17,.25) 0%, rgba(5,8,17,.8) 55%, rgba(5,8,17,.98) 100%)',
    headlineWeight: 800,
    headlineTracking: '-0.02em',
    badgeText: 'SYS://NEWS',
    fallbackBg: 'linear-gradient(140deg,#064E3B,#050811 60%,#022C22)',
    fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
    cardBg: 'rgba(15, 23, 42, 0.85)',
  },
  FINANCE: {
    label: 'Finance & Stat',
    bg: '#F6EFEB', // FT/Bloomberg salmon paper color
    fg: '#1C1917',
    muted: '#78716C',
    accent: '#047857',
    accentFg: '#FFFFFF',
    rule: '#D1C7BD',
    scrim: 'linear-gradient(180deg, rgba(28,25,23,0) 35%, rgba(28,25,23,.75) 100%)',
    headlineWeight: 800,
    headlineTracking: '-0.025em',
    badgeText: 'MARKET REPORT',
    fallbackBg: 'linear-gradient(140deg,#F6EFEB,#E5DACF 60%,#D1C7BD)',
    cardBg: '#FFFFFF',
  },
  CORPORATE: {
    label: 'Corporate Pro',
    bg: '#0F172A',
    fg: '#FFFFFF',
    muted: '#94A3B8',
    accent: '#2563EB',
    accentFg: '#FFFFFF',
    rule: 'rgba(255,255,255,.15)',
    scrim: 'linear-gradient(180deg, rgba(15,23,42,.3) 0%, rgba(15,23,42,.85) 60%, rgba(15,23,42,.98) 100%)',
    headlineWeight: 800,
    headlineTracking: '-0.02em',
    badgeText: 'INSIGHTS',
    fallbackBg: 'linear-gradient(140deg,#1E3A8A,#0F172A 60%,#172554)',
    cardBg: 'rgba(30, 41, 59, 0.85)',
  },
  LIFESTYLE: {
    label: 'Lifestyle Pastel',
    bg: '#FFF1F2',
    fg: '#4C0519',
    muted: '#9F1239',
    accent: '#F43F5E',
    accentFg: '#FFFFFF',
    rule: '#FECDD3',
    scrim: 'linear-gradient(180deg, rgba(76,5,25,0) 30%, rgba(76,5,25,.65) 100%)',
    headlineWeight: 700,
    headlineTracking: '-0.015em',
    badgeText: 'LIFESTYLE',
    fallbackBg: 'linear-gradient(140deg,#FFE4E6,#FECDD3 60%,#FDA4AF)',
    cardBg: '#FFFFFF',
  },
};

export function tokensFor(style: DesignStyle): StyleTokens {
  return STYLE_TOKENS[style as keyof typeof STYLE_TOKENS] ?? STYLE_TOKENS.MINIMAL;
}

export const IMPLEMENTED_STYLES: DesignStyle[] = [
  'MINIMAL',
  'BREAKING_NEWS',
  'MODERN',
  'BOLD',
  'EDITORIAL',
  'TECH',
  'FINANCE',
  'CORPORATE',
  'LIFESTYLE',
];
