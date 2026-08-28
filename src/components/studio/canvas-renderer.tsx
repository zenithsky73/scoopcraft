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

  // Aspect ratio dimensions based on standard Instagram sizes
  // Feed 4:5 (1080x1350), Square 1:1 (1080x1080), Story 9:16 (1080x1920)
  const aspectClass =
    format === 'FEED_PORTRAIT'
      ? 'aspect-[4/5] max-w-[440px]'
      : format === 'STORY'
      ? 'aspect-[9/16] max-w-[360px]'
      : 'aspect-square max-w-[440px]';

  const isCover = slide.type === 'COVER' || slide.index === 0;
  const isOutro = slide.type === 'OUTRO' || slide.index === totalSlides - 1;
  const isPoint = !isCover && !isOutro;

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

      {style === 'CORPORATE' && (
        <>
          <div className="absolute top-0 right-0 w-60 h-60 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-60 h-60 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        </>
      )}

      {style === 'CUSTOM_BRAND' && (
        <>
          <div className="absolute top-0 right-0 w-72 h-72 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-60 h-60 bg-fuchsia-600/15 rounded-full blur-3xl pointer-events-none" />
        </>
      )}

      {style === 'MODERN' && (
        <>
          <div className="absolute top-0 right-0 w-48 h-48 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />
        </>
      )}

      {/* ─── 2. HEADER BAR ─── */}
      <div className="relative z-20 px-6 pt-4 pb-2.5 flex items-center justify-between border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <span
            className="px-2.5 py-0.5 text-[10px] font-black tracking-wider uppercase rounded-md shadow-sm shrink-0"
            style={{
              backgroundColor: accent,
              color: '#FFFFFF',
            }}
          >
            {slide.tag ||
              (isCover
                ? style === 'BREAKING_NEWS'
                  ? 'BREAKING'
                  : style === 'CUSTOM_BRAND'
                  ? 'TAUKAH KAMU?'
                  : style === 'TECH'
                  ? 'TECH UPDATE'
                  : 'HEADLINE'
                : isOutro
                ? 'KESIMPULAN'
                : `FAKTA 0${slide.pointNumber || slide.index}`)}
          </span>

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
        <div className="relative z-10 flex-1 flex flex-col justify-end p-6 sm:p-7 overflow-hidden">
          {/* Background Photo for Cover */}
          {slide.imageUrl && (
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
              <img
                src={slide.imageUrl}
                alt="Cover Background"
                className="w-full h-full object-cover opacity-45 filter contrast-125 brightness-90 scale-105"
              />
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(to top, ${styleDef.bgColor} 20%, ${styleDef.bgColor}d9 55%, transparent 85%, ${styleDef.bgColor}e6 100%)`,
                }}
              />
            </div>
          )}

          <div className="relative z-10 space-y-3.5">
            {/* Tech / Trading Ticker for TECH */}
            {style === 'TECH' && (
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-[10px] font-bold">
                <span>📈 $ANALYSIS</span>
                <span>•</span>
                <span>MARKET PULSE</span>
              </div>
            )}

            {/* Fakta vs Mitos Badge for CUSTOM_BRAND */}
            {style === 'CUSTOM_BRAND' && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/40 text-purple-300 text-[10px] font-black uppercase tracking-wider">
                <Sparkles className="size-3" /> FAKTA POP & TRIVIA
              </div>
            )}

            <h1
              className={`font-black tracking-tight leading-[1.2] ${
                style === 'EDITORIAL'
                  ? 'font-serif text-2xl sm:text-3xl lg:text-[30px]'
                  : style === 'BOLD'
                  ? 'italic font-black text-2xl sm:text-3xl uppercase tracking-tighter'
                  : style === 'LIFESTYLE'
                  ? 'font-sans text-2xl sm:text-3xl font-extrabold text-slate-800'
                  : 'font-sans text-2xl sm:text-3xl lg:text-[28px]'
              }`}
              style={{
                color:
                  style === 'LIFESTYLE'
                    ? '#0F172A'
                    : style === 'BOLD'
                    ? '#FACC15'
                    : '#FFFFFF',
              }}
            >
              {slide.headline || 'Headline Utama Berita'}
            </h1>

            {slide.lead && (
              <p
                className={`text-xs sm:text-sm leading-relaxed font-medium line-clamp-3 ${
                  style === 'LIFESTYLE' ? 'text-slate-600' : 'text-slate-200/90'
                }`}
              >
                {slide.lead}
              </p>
            )}

            {/* Swipe Callout Indicator */}
            <div
              className="pt-2 flex items-center gap-2 text-[11px] font-bold tracking-wider uppercase"
              style={{ color: accent }}
            >
              <span className="w-7 h-0.5 rounded-full" style={{ backgroundColor: accent }} />
              <span>Geser untuk info lengkap ➔</span>
            </div>
          </div>
        </div>
      )}

      {/* ─── B. POINT SLIDE (DYNAMIC SPLIT PHOTO & RICH CARD LAYOUT) ─── */}
      {isPoint && (
        <div className="relative z-10 flex-1 flex flex-col p-4 sm:p-5 gap-3.5 overflow-hidden">
          {/* Top Half: Contextual Photo Frame with Caption & Badge */}
          {slide.imageUrl && (
            <div className="relative w-full h-[38%] min-h-[120px] rounded-xl overflow-hidden shadow-lg border border-white/10 shrink-0 group">
              <img
                src={slide.imageUrl}
                alt={slide.takeaway || 'Foto Berita'}
                className="w-full h-full object-cover filter contrast-110 brightness-95"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              
              {/* Photo Corner Label */}
              <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-[10px] text-white/90 font-medium">
                <span className="bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/15 truncate max-w-[200px]">
                  📷 {slide.takeaway || 'Ilustrasi Berita'}
                </span>
                <span className="bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded-md font-mono text-[9px]">
                  #{slide.pointNumber || slide.index}
                </span>
              </div>
            </div>
          )}

          {/* Bottom Half: High-Impact Structured Content Card */}
          <div
            className={`flex-1 rounded-2xl p-4 sm:p-4.5 border backdrop-blur-md flex flex-col justify-between space-y-2.5 overflow-y-auto ${
              style === 'FINANCE'
                ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-100 shadow-lg'
                : style === 'TECH'
                ? 'bg-slate-900/80 border-slate-700/80 text-slate-200 shadow-lg'
                : style === 'LIFESTYLE'
                ? 'bg-white/90 border-pink-200 text-slate-700 shadow-md'
                : style === 'CORPORATE'
                ? 'bg-blue-950/40 border-blue-500/25 text-blue-100 shadow-lg'
                : style === 'CUSTOM_BRAND'
                ? 'bg-purple-950/40 border-purple-500/30 text-purple-100 shadow-lg'
                : style === 'BOLD'
                ? 'bg-neutral-900/90 border-yellow-500/30 text-slate-100 shadow-lg'
                : 'bg-white/5 border-white/10 text-slate-200'
            }`}
          >
            <div>
              {/* Header Number & Takeaway Headline */}
              <div className="flex items-start gap-2.5 mb-2">
                <span
                  className={`font-black italic tracking-tighter text-2xl shrink-0 leading-none ${
                    style === 'BOLD' ? 'text-yellow-400' : ''
                  }`}
                  style={{ color: style === 'BOLD' ? '#FACC15' : accent }}
                >
                  0{slide.pointNumber || slide.index}
                </span>
                <h2
                  className={`font-bold leading-snug ${
                    style === 'EDITORIAL'
                      ? 'font-serif text-base sm:text-lg'
                      : style === 'BOLD'
                      ? 'italic font-black text-base sm:text-lg uppercase'
                      : 'text-sm sm:text-base'
                  }`}
                  style={{ color: style === 'LIFESTYLE' ? '#0F172A' : '#FFFFFF' }}
                >
                  {slide.takeaway || 'Inti Poin Informasi'}
                </h2>
              </div>

              {/* Explanatory Body */}
              {slide.supportingText && (
                <p className="text-xs sm:text-[13px] leading-relaxed opacity-90 font-normal">
                  {slide.supportingText}
                </p>
              )}
            </div>

            {/* Supporting Widget Assets (Stat Highlight / Quote Badge) */}
            <div className="pt-1.5 space-y-1.5 border-t border-white/10">
              {slide.statHighlight && (
                <div
                  className="flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg border"
                  style={{
                    backgroundColor: style === 'LIFESTYLE' ? '#FDF2F8' : 'rgba(255,255,255,0.06)',
                    borderColor: accent,
                    color: style === 'LIFESTYLE' ? '#831843' : '#FFFFFF',
                  }}
                >
                  <span className="size-1.5 rounded-full" style={{ backgroundColor: accent }} />
                  <span className="truncate">{slide.statHighlight}</span>
                </div>
              )}

              {slide.sourceQuote && (
                <blockquote
                  className="border-l-2 pl-2.5 py-0.5 italic text-[11px] opacity-85 truncate"
                  style={{
                    borderColor: accent,
                    color: style === 'LIFESTYLE' ? '#475569' : '#E2E8F0',
                  }}
                >
                  &ldquo;{slide.sourceQuote}&rdquo;
                </blockquote>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── C. OUTRO SLIDE (VIRAL CALL TO ACTION) ─── */}
      {isOutro && (
        <div className="relative z-10 flex-1 flex flex-col justify-center p-6 sm:p-8 text-center space-y-4">
          {/* Background image overlay with strong dark blur */}
          {slide.imageUrl && (
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
              <img
                src={slide.imageUrl}
                alt="Outro Background"
                className="w-full h-full object-cover opacity-20 filter blur-sm scale-110"
              />
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(to top, ${styleDef.bgColor} 10%, ${styleDef.bgColor}e6 90%)`,
                }}
              />
            </div>
          )}

          <div className="relative z-10 space-y-4">
            <div
              className="inline-flex p-3 rounded-2xl mx-auto shadow-xl"
              style={{
                backgroundColor: style === 'LIFESTYLE' ? '#FCE7F3' : 'rgba(255,255,255,0.08)',
                color: accent,
              }}
            >
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <div className="space-y-1.5 max-w-sm mx-auto">
              <h2
                className={`text-xl sm:text-2xl font-black tracking-tight ${
                  style === 'EDITORIAL' ? 'font-serif' : 'font-sans'
                }`}
                style={{ color: style === 'LIFESTYLE' ? '#0F172A' : '#FFFFFF' }}
              >
                {slide.ctaText || 'Bagikan Informasi Ini!'}
              </h2>
              <p
                className={`text-xs sm:text-sm leading-relaxed ${
                  style === 'LIFESTYLE' ? 'text-slate-600' : 'text-slate-300'
                }`}
              >
                {slide.secondaryCta || 'Follow kami untuk update berita & analisis harian terpercaya.'}
              </p>
            </div>

            <div
              className="inline-block px-5 py-2.5 rounded-2xl font-mono font-bold text-xs tracking-wider border shadow-xl"
              style={{
                backgroundColor: style === 'LIFESTYLE' ? '#FFFFFF' : 'rgba(255,255,255,0.1)',
                borderColor: accent,
                color: style === 'LIFESTYLE' ? '#0F172A' : '#FFFFFF',
              }}
            >
              {handle}
            </div>

            <div className="pt-2 flex items-center justify-center gap-4 text-[11px] opacity-75 font-semibold">
              <span>🔖 Simpan</span>
              <span>•</span>
              <span>💬 Komentar</span>
              <span>•</span>
              <span>↗️ Bagikan</span>
            </div>
          </div>
        </div>
      )}

      {/* ─── 4. FOOTER BAR ─── */}
      <div
        className={`relative z-20 px-6 py-3 flex items-center justify-between border-t text-[10px] font-semibold shrink-0 ${
          style === 'LIFESTYLE' ? 'border-pink-200/60 text-slate-500' : 'border-white/10 text-slate-400'
        }`}
      >
        <div className="flex items-center gap-1.5 truncate">
          <span className="font-bold">{handle}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="truncate max-w-[160px]">{slide.source || 'Sumber: Portal Berita'}</span>
        </div>
      </div>
    </div>
  );

  if (showPhoneFrame) {
    return (
      <div className="p-3 bg-slate-900 rounded-[36px] border-4 border-slate-800 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)]">
        {/* Dynamic Island / Speaker notch */}
        <div className="w-24 h-4 bg-slate-950 rounded-full mx-auto mb-2 border border-slate-800 flex items-center justify-center gap-1.5">
          <div className="size-1.5 rounded-full bg-slate-800" />
          <div className="size-1 rounded-full bg-slate-700" />
        </div>
        {canvasContent}
      </div>
    );
  }

  return canvasContent;
}
