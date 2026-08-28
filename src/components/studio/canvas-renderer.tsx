'use client';

import * as React from 'react';
import type { DesignStyle, OutputFormat } from '@prisma/client';
import { STYLES, type StyleDef } from '@/config/styles';
import {
  Sparkles,
  TrendingUp,
  Award,
  BookOpen,
  Zap,
  Briefcase,
  Lightbulb,
  CheckCircle2,
  Quote,
  Flame,
  ArrowRight,
  Terminal,
  Compass,
  FileText,
  Star,
  Mic,
  Utensils,
  Share2,
} from 'lucide-react';

export type SlideData = {
  index: number;
  type: 'COVER' | 'POINT' | 'OUTRO';
  tag?: string;
  headline?: string;
  lead?: string;
  pointNumber?: number;
  takeaway?: string;
  supportingText?: string;
  sourceQuote?: string;
  statHighlight?: string;
  ctaText?: string;
  secondaryCta?: string;
  imageUrl?: string | null;
  author?: string;
  source?: string;
};

export type CanvasRendererProps = {
  slide: SlideData;
  style: DesignStyle;
  format: OutputFormat;
  handle?: string;
  brandName?: string;
  totalSlides?: number;
  scale?: number;
  showPhoneFrame?: boolean;
  className?: string;
};

export function CanvasRenderer({
  slide,
  style,
  format = 'FEED_PORTRAIT',
  handle = '@newsly.ai',
  brandName = 'NEWSLY AI',
  totalSlides = 5,
  scale = 1,
  showPhoneFrame = false,
  className = '',
}: CanvasRendererProps) {
  const styleDef = STYLES.find((s) => s.id === style) || STYLES[0];
  const accent = styleDef.accentColor;

  const aspectClass =
    format === 'FEED_PORTRAIT'
      ? 'aspect-[4/5] max-w-[440px]'
      : format === 'STORY'
      ? 'aspect-[9/16] max-w-[360px]'
      : 'aspect-square max-w-[440px]';

  const isCover = slide.type === 'COVER' || slide.index === 0;
  const isOutro = slide.type === 'OUTRO' || slide.index === totalSlides - 1;
  const isPoint = !isCover && !isOutro;

  // Bersihkan penomoran kaku 1,2,3 dari takeaway
  const cleanTakeaway = (slide.takeaway || '')
    .replace(/^(?:\d+[\.\)\-:]\s*|Poin\s*\d+[\.\)\-:]\s*|Fakta\s*\d+[\.\)\-:]\s*|Langkah\s*\d+[\.\)\-:]\s*)/i, '')
    .trim();

  const canvasContent = (
    <div
      id={`slide-canvas-${slide.index}`}
      data-slide-index={slide.index}
      className={`relative w-full overflow-hidden rounded-2xl shadow-2xl flex flex-col justify-between select-none transition-all duration-300 ${aspectClass} ${className}`}
      style={{
        backgroundColor: styleDef.bgColor,
        color: styleDef.textColor,
        transform: scale !== 1 ? `scale(${scale})` : undefined,
        transformOrigin: 'top center',
      }}
    >
      {/* ─── 1. THEME BACKGROUND OVERLAYS & ACCENTS ─── */}
      {style === 'BREAKING_NEWS' && (
        <>
          <div className="absolute top-0 left-0 right-0 h-2 bg-red-600 z-30 shadow-[0_0_15px_rgba(239,68,68,0.8)]" />
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        </>
      )}

      {style === 'FINANCE' && (
        <>
          <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        </>
      )}

      {style === 'TECH' && (
        <>
          <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#38bdf810_1px,transparent_1px),linear-gradient(to_bottom,#38bdf810_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
          <div className="absolute top-0 right-0 w-56 h-56 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        </>
      )}

      {style === 'EDITORIAL' && (
        <>
          <div className="absolute top-0 left-8 w-6 h-4 bg-red-600 z-30 rounded-b-sm shadow-md" />
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
        </>
      )}

      {style === 'LIFESTYLE' && (
        <>
          <div className="absolute top-0 right-0 w-64 h-64 bg-pink-300/30 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-300/25 rounded-full blur-3xl pointer-events-none" />
        </>
      )}

      {style === 'BOLD' && (
        <>
          <div className="absolute top-0 left-0 right-0 h-2 bg-yellow-400 z-30 shadow-[0_0_20px_rgba(250,204,21,0.8)]" />
          <div className="absolute -bottom-10 -right-10 w-60 h-60 bg-yellow-400/10 rounded-full blur-3xl pointer-events-none" />
        </>
      )}

      {style === 'TERMINAL' && (
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#06b6d408_1px,transparent_1px),linear-gradient(to_bottom,#06b6d408_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />
      )}

      {style === 'ATHLETIC' && (
        <div className="absolute top-0 right-0 w-48 h-12 bg-yellow-400/20 -skew-x-12 pointer-events-none" />
      )}

      {style === 'COSMIC' && (
        <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      )}

      {style === 'SPOTLIGHT' && (
        <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-fuchsia-600/20 to-transparent pointer-events-none" />
      )}

      {/* ─── 2. HEADER BAR ─── */}
      <div className="relative z-20 px-5 sm:px-6 pt-4 pb-2.5 flex items-center justify-between border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          {/* Custom Terminal Header for TERMINAL */}
          {style === 'TERMINAL' ? (
            <div className="flex items-center gap-1.5 bg-slate-900/90 px-2 py-0.5 rounded-lg border border-slate-700">
              <span className="size-2 rounded-full bg-red-500 inline-block" />
              <span className="size-2 rounded-full bg-yellow-500 inline-block" />
              <span className="size-2 rounded-full bg-emerald-500 inline-block" />
              <span className="font-mono text-[9px] text-cyan-400 ml-1 font-bold">insights.ts</span>
            </div>
          ) : (
            <span
              className="px-2.5 py-0.5 text-[10px] font-black tracking-wider uppercase rounded-md shadow-sm shrink-0"
              style={{
                backgroundColor: accent,
                color: style === 'STREETWEAR' || style === 'PODCAST' ? '#000000' : '#FFFFFF',
              }}
            >
              {slide.tag || (isCover ? 'HEADLINE' : isOutro ? 'KESIMPULAN' : 'POIN UTAMA')}
            </span>
          )}

          <span
            className="text-[11px] font-bold tracking-wider uppercase truncate"
            style={{ color: style === 'LIFESTYLE' ? '#64748B' : '#94A3B8' }}
          >
            {brandName}
          </span>
        </div>

        {/* Slide Counter */}
        <div
          className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border border-white/15 backdrop-blur-md shrink-0"
          style={{
            backgroundColor: style === 'LIFESTYLE' ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.1)',
            color: style === 'LIFESTYLE' ? '#475569' : '#E2E8F0',
          }}
        >
          {slide.index + 1} / {totalSlides}
        </div>
      </div>

      {/* ─── 3. MAIN BODY CONTENT ─── */}

      {/* ─── A. COVER SLIDE ─── */}
      {isCover && (
        <div className="relative z-10 flex-1 flex flex-col justify-end p-5 sm:p-7 overflow-hidden">
          {/* Background Photo for Cover */}
          {slide.imageUrl && (
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
              <img
                src={slide.imageUrl}
                alt="Cover Background"
                className="w-full h-full object-cover opacity-50 filter contrast-115 brightness-90 scale-105"
              />
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(to top, ${styleDef.bgColor} 18%, ${styleDef.bgColor}d9 55%, transparent 85%, ${styleDef.bgColor}e6 100%)`,
                }}
              />
            </div>
          )}

          <div className="relative z-10 space-y-3">
            {/* Live Ticker for BLOOMBERG */}
            {style === 'BLOOMBERG' && (
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 font-mono text-[9px] font-bold">
                <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>▲ IHSG +1.4% • BTC $94.2K</span>
              </div>
            )}

            {/* Spotlight Tag for SPOTLIGHT */}
            {style === 'SPOTLIGHT' && (
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-fuchsia-600/30 border border-fuchsia-400/40 text-fuchsia-200 text-[10px] font-black uppercase">
                <Star className="size-3 text-amber-400 fill-amber-400" /> TOP TRENDING #1
              </div>
            )}

            <h1
              className={`font-black tracking-tight leading-[1.2] ${
                style === 'EDITORIAL' || style === 'POLICY'
                  ? 'font-serif text-2xl sm:text-3xl'
                  : style === 'BOLD' || style === 'ATHLETIC'
                  ? 'italic font-black text-2xl sm:text-3xl uppercase'
                  : style === 'LIFESTYLE'
                  ? 'font-sans text-2xl sm:text-3xl font-extrabold text-slate-800'
                  : 'font-sans text-2xl sm:text-3xl'
              }`}
              style={{
                color:
                  style === 'LIFESTYLE'
                    ? '#0F172A'
                    : style === 'BOLD' || style === 'ATHLETIC'
                    ? '#FACC15'
                    : '#FFFFFF',
              }}
            >
              {slide.headline || cleanTakeaway || 'Informasi & Wawasan Terkini'}
            </h1>

            {slide.lead && (
              <p
                className="text-xs sm:text-sm font-medium line-clamp-3 leading-relaxed"
                style={{
                  color: style === 'LIFESTYLE' ? '#475569' : '#CBD5E1',
                }}
              >
                {slide.lead}
              </p>
            )}

            <div className="pt-2 flex items-center gap-2">
              <span
                className="text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1"
                style={{ color: accent }}
              >
                Geser untuk info lengkap <ArrowRight className="size-3 inline" />
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ─── B. POINT SLIDE (FAKTA & PEMBAHASAN) ─── */}
      {isPoint && (
        <div className="relative z-10 flex-1 flex flex-col justify-between p-5 sm:p-6 space-y-4 overflow-hidden">
          {/* Main Visual Photo Container */}
          {slide.imageUrl && (
            <div className="relative w-full h-36 sm:h-44 rounded-xl overflow-hidden shadow-lg border border-white/10 shrink-0">
              <img
                src={slide.imageUrl}
                alt={`Visual Slide ${slide.index + 1}`}
                className="w-full h-full object-cover filter contrast-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between">
                <span className="text-[10px] font-bold text-white/90 drop-shadow truncate max-w-[200px]">
                  {cleanTakeaway || slide.headline}
                </span>
                <span className="text-[9px] font-mono font-bold bg-black/60 px-2 py-0.5 rounded text-white/80 border border-white/20 backdrop-blur-md">
                  #{slide.index + 1}
                </span>
              </div>
            </div>
          )}

          {/* Text Content Block */}
          <div className="space-y-2.5 flex-1 flex flex-col justify-center">
            {/* Header Poin Manfaat Bersih (Tanpa Angka Kaku 1,2,3) */}
            <div className="flex items-start gap-2">
              <h2
                className={`font-bold tracking-tight text-base sm:text-lg leading-snug ${
                  style === 'EDITORIAL' || style === 'POLICY' ? 'font-serif' : 'font-sans'
                }`}
                style={{
                  color: style === 'LIFESTYLE' ? '#0F172A' : '#FFFFFF',
                }}
              >
                {cleanTakeaway || `Poin Pembahasan`}
              </h2>
            </div>

            {/* Penjelasan Mendalam */}
            {slide.supportingText && (
              <p
                className="text-xs sm:text-sm font-normal leading-relaxed"
                style={{
                  color: style === 'LIFESTYLE' ? '#475569' : '#CBD5E1',
                }}
              >
                {slide.supportingText}
              </p>
            )}

            {/* Stat Highlight Badge */}
            {slide.statHighlight && (
              <div
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl border backdrop-blur-sm self-start text-[10px] font-bold shadow-sm"
                style={{
                  backgroundColor: `${accent}15`,
                  borderColor: `${accent}40`,
                  color: style === 'LIFESTYLE' ? accent : '#FFFFFF',
                }}
              >
                <TrendingUp className="size-3" style={{ color: accent }} />
                <span>{slide.statHighlight}</span>
              </div>
            )}

            {/* Quote Box */}
            {slide.sourceQuote && (
              <div className="relative pl-3 py-1 border-l-2 text-[10px] sm:text-xs italic leading-relaxed text-slate-300/90" style={{ borderColor: accent }}>
                "{slide.sourceQuote.replace(/^["']|["']$/g, '')}"
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── C. OUTRO / CTA SLIDE ─── */}
      {isOutro && (
        <div className="relative z-10 flex-1 flex flex-col justify-center items-center p-6 sm:p-8 text-center space-y-5">
          {/* Outro Graphic Indicator */}
          <div
            className="size-16 rounded-3xl flex items-center justify-center shadow-xl border border-white/20"
            style={{
              backgroundColor: `${accent}25`,
              color: accent,
            }}
          >
            <CheckCircle2 className="size-8" />
          </div>

          <div className="space-y-2 max-w-xs">
            <h2
              className={`font-black text-xl sm:text-2xl tracking-tight ${
                style === 'EDITORIAL' || style === 'POLICY' ? 'font-serif' : 'font-sans'
              }`}
              style={{
                color: style === 'LIFESTYLE' ? '#0F172A' : '#FFFFFF',
              }}
            >
              {cleanTakeaway || 'Rangkuman & Insight'}
            </h2>
            <p
              className="text-xs sm:text-sm font-medium leading-relaxed"
              style={{ color: style === 'LIFESTYLE' ? '#64748B' : '#94A3B8' }}
            >
              {slide.supportingText || 'Semoga ringkasan informasi ini bermanfaat untuk wawasan dan strategi Anda.'}
            </p>
          </div>

          {/* Social Action Grid */}
          <div className="w-full max-w-xs grid grid-cols-2 gap-2 pt-2 text-[10px] font-bold">
            <div className="bg-white/5 border border-white/10 rounded-xl p-2 flex items-center justify-center gap-1.5 text-slate-200">
              <span>📌 Simpan Postingan</span>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-2 flex items-center justify-center gap-1.5 text-slate-200">
              <span>🚀 Bagikan ke Tim</span>
            </div>
          </div>

          {/* CTA Button Badge */}
          <div
            className="w-full max-w-xs py-2.5 px-4 rounded-xl font-bold text-xs shadow-lg flex items-center justify-center gap-2"
            style={{
              backgroundColor: accent,
              color: style === 'STREETWEAR' || style === 'PODCAST' ? '#000000' : '#FFFFFF',
            }}
          >
            <span>{slide.ctaText || 'Ikuti untuk update harian'}</span>
            <ArrowRight className="size-3.5" />
          </div>
        </div>
      )}

      {/* ─── 4. FOOTER BAR ─── */}
      <div className="relative z-20 px-5 sm:px-6 py-3 flex items-center justify-between border-t border-white/10 text-[10px] font-semibold shrink-0">
        <span
          className="font-medium tracking-wide"
          style={{ color: style === 'LIFESTYLE' ? '#64748B' : '#94A3B8' }}
        >
          {handle}
        </span>

        <span
          className="uppercase tracking-widest text-[9px]"
          style={{ color: style === 'LIFESTYLE' ? '#94A3B8' : '#64748B' }}
        >
          {slide.source || 'Newsly AI'}
        </span>
      </div>
    </div>
  );

  if (showPhoneFrame) {
    return (
      <div className="relative p-2.5 sm:p-4 rounded-[40px] bg-slate-900 border-4 border-slate-700/80 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] flex flex-col items-center">
        {/* Phone Notch */}
        <div className="w-24 h-4 bg-slate-950 rounded-full mb-3 border border-slate-800 shadow-inner shrink-0" />
        {canvasContent}
        {/* Phone Bottom Pill */}
        <div className="w-28 h-1 bg-slate-600 rounded-full mt-3.5 shrink-0" />
      </div>
    );
  }

  return canvasContent;
}
