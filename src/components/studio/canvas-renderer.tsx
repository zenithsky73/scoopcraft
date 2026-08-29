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
  Bookmark,
  ChevronRight,
  TrendingDown,
  Activity,
  ShieldAlert,
  Globe,
  Radio,
  MapPin,
  HeartPulse,
  Gamepad2,
  Leaf,
  Layers,
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
  const isLight = styleDef.isLight ?? false;

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

  // Warna teks dinamis dengan kontras tajam
  const textPrimary = isLight ? '#0F172A' : '#FFFFFF';
  const textSecondary = isLight ? '#334155' : '#E2E8F0';
  const textMuted = isLight ? '#64748B' : '#94A3B8';

  const canvasContent = (
    <div
      id={`slide-canvas-${slide.index}`}
      data-slide-index={slide.index}
      className={`relative w-full overflow-hidden rounded-2xl shadow-2xl flex flex-col justify-between select-none transition-all duration-300 ${aspectClass} ${className}`}
      style={{
        backgroundColor: styleDef.bgColor,
        color: textPrimary,
        transform: scale !== 1 ? `scale(${scale})` : undefined,
        transformOrigin: 'top center',
      }}
    >
      {/* ─── 1. THEME BACKGROUND ACCENTS & GRAPHIC DNA ─── */}
      {style === 'BREAKING_NEWS' && (
        <>
          <div className="absolute top-0 left-0 right-0 h-3 bg-red-600 z-30 shadow-[0_0_20px_rgba(239,68,68,0.9)]" />
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />
        </>
      )}

      {style === 'EDITORIAL' && (
        <div className="absolute inset-0 bg-[radial-gradient(#0000000d_1px,transparent_1px)] [background-size:12px_12px] pointer-events-none" />
      )}

      {style === 'FINANCE' && (
        <>
          <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#10b98108_1px,transparent_1px),linear-gradient(to_bottom,#10b98108_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        </>
      )}

      {style === 'TECH' && (
        <>
          <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#38bdf80f_1px,transparent_1px),linear-gradient(to_bottom,#38bdf80f_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
        </>
      )}

      {style === 'LIFESTYLE' && (
        <>
          <div className="absolute top-0 right-0 w-64 h-64 bg-rose-200/40 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-100/50 rounded-full blur-3xl pointer-events-none" />
        </>
      )}

      {style === 'BOLD' && (
        <div className="absolute top-0 left-0 right-0 h-3 bg-black z-30" />
      )}

      {style === 'MINIMAL' && (
        <div className="absolute inset-3 border-2 border-slate-900 pointer-events-none rounded-xl" />
      )}

      {style === 'STREETWEAR' && (
        <div className="absolute inset-0 bg-[radial-gradient(#00000010_1px,transparent_1px)] [background-size:10px_10px] pointer-events-none" />
      )}

      {style === 'BLOOMBERG' && (
        <>
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        </>
      )}

      {style === 'TERMINAL' && (
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#06b6d408_1px,transparent_1px),linear-gradient(to_bottom,#06b6d408_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />
      )}

      {style === 'ATHLETIC' && (
        <div className="absolute top-0 right-0 w-64 h-16 bg-yellow-400/20 -skew-x-12 pointer-events-none" />
      )}

      {style === 'COSMIC' && (
        <>
          <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        </>
      )}

      {style === 'SPOTLIGHT' && (
        <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-fuchsia-600/25 to-transparent pointer-events-none" />
      )}

      {style === 'RED_COLLAGE' && (
        <div className="absolute -top-10 -right-10 w-48 h-12 bg-red-600 -rotate-12 shadow-lg pointer-events-none" />
      )}

      {style === 'PODCAST' && (
        <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      )}

      {style === 'CULINARY' && (
        <div className="absolute bottom-0 left-0 right-0 h-44 bg-gradient-to-t from-orange-600/25 to-transparent pointer-events-none" />
      )}

      {/* ─── 2. HEADER BAR (CUSTOM UNIK PER TEMPLATE) ─── */}
      <div
        className={`relative z-20 px-5 sm:px-6 pt-4 pb-3 flex items-center justify-between shrink-0 ${
          isLight ? 'border-b border-slate-300' : 'border-b border-white/10'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          {/* Custom Header: TERMINAL macOS Window */}
          {style === 'TERMINAL' ? (
            <div className="flex items-center gap-1.5 bg-slate-900 px-2 py-1 rounded-lg border border-slate-700">
              <span className="size-2 rounded-full bg-red-500 inline-block" />
              <span className="size-2 rounded-full bg-yellow-500 inline-block" />
              <span className="size-2 rounded-full bg-emerald-500 inline-block" />
              <span className="font-mono text-[9px] text-cyan-400 ml-1.5 font-bold">newsly.sh</span>
            </div>
          ) : style === 'EDITORIAL' || style === 'POLICY' ? (
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-serif font-black uppercase tracking-widest text-red-800 dark:text-red-400 border-b-2 border-red-800">
                {slide.tag || (isCover ? 'EDISI UTAMA' : isOutro ? 'KESIMPULAN' : 'CATATAN')}
              </span>
            </div>
          ) : style === 'MINIMAL' ? (
            <span className="px-2 py-0.5 text-[9px] font-mono font-black tracking-widest uppercase border-2 border-black bg-black text-white">
              {slide.tag || (isCover ? 'OVERVIEW' : isOutro ? 'SUMMARY' : `POINT 0${slide.index}`)}
            </span>
          ) : style === 'STREETWEAR' ? (
            <span className="px-2.5 py-0.5 text-[10px] font-black uppercase bg-black text-white shadow-[3px_3px_0px_0px_#FFF] border border-black">
              {slide.tag || 'URBAN DISPATCH'}
            </span>
          ) : style === 'PODCAST' ? (
            <span className="px-2.5 py-0.5 text-[10px] font-black uppercase bg-indigo-600 text-white rounded-md flex items-center gap-1">
              <Mic className="size-3" /> {slide.tag || 'INTERVIEW'}
            </span>
          ) : style === 'CULINARY' ? (
            <span className="px-2.5 py-0.5 text-[10px] font-black uppercase bg-orange-600 text-white rounded-md flex items-center gap-1 shadow-sm">
              <Utensils className="size-3" /> {slide.tag || 'KULINER VIRAL'}
            </span>
          ) : style === 'ATHLETIC' ? (
            <span className="px-2.5 py-0.5 text-[10px] font-black uppercase italic bg-yellow-400 text-black -skew-x-12 shadow-md">
              ⚡ {slide.tag || 'SPEED REPORT'}
            </span>
          ) : style === 'BLOOMBERG' ? (
            <span className="px-2.5 py-0.5 text-[10px] font-mono font-black uppercase bg-blue-600 text-white rounded">
              MARKETS LIVE
            </span>
          ) : (
            <span
              className="px-2.5 py-0.5 text-[10px] font-black tracking-wider uppercase rounded-md shadow-sm shrink-0"
              style={{
                backgroundColor: accent,
                color: '#FFFFFF',
              }}
            >
              {slide.tag || (isCover ? 'HEADLINE' : isOutro ? 'KESIMPULAN' : 'POIN UTAMA')}
            </span>
          )}

          <span
            className="text-[11px] font-bold tracking-wider uppercase truncate"
            style={{ color: textMuted }}
          >
            {brandName}
          </span>
        </div>

        {/* Slide Counter */}
        <div
          className={`text-[10px] font-mono font-black px-2.5 py-0.5 rounded-full border shrink-0 ${
            isLight
              ? 'bg-white border-slate-300 text-slate-800 shadow-sm'
              : 'bg-white/10 border-white/20 text-slate-100 backdrop-blur-md'
          }`}
        >
          {slide.index + 1} / {totalSlides}
        </div>
      </div>

      {/* ─── 3. MAIN BODY CONTENT ─── */}

      {/* ─── A. COVER SLIDE ─── */}
      {isCover && (
        <div className="relative z-10 flex-1 flex flex-col justify-end p-5 sm:p-7 overflow-hidden">
          {/* Background Photo for Cover - Selalu Berwarna Tajam & Nyata */}
          {slide.imageUrl && (
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
              <img
                src={slide.imageUrl}
                alt="Cover Background"
                className={`w-full h-full object-cover filter ${
                  isLight ? 'opacity-85 brightness-100 contrast-105' : 'opacity-65 brightness-95 contrast-110'
                }`}
              />
              {/* Soft Vignette Overlay agar foto tetap jernih dan teks terbaca sempurna */}
              <div
                className="absolute inset-0"
                style={{
                  background: isLight
                    ? `linear-gradient(to top, #FFFFFF 25%, rgba(255,255,255,0.92) 55%, rgba(255,255,255,0.4) 85%, transparent 100%)`
                    : `linear-gradient(to top, ${styleDef.bgColor} 30%, ${styleDef.bgColor}d9 65%, rgba(0,0,0,0.3) 90%, ${styleDef.bgColor}99 100%)`,
                }}
              />
            </div>
          )}

          {/* STREETWEAR SPECIAL: NEO-BRUTALIST OFFSET HARD CARD */}
          {style === 'STREETWEAR' ? (
            <div className="relative z-10 p-5 rounded-2xl bg-white border-2 border-black shadow-[6px_6px_0px_0px_#000] text-black space-y-3">
              <div className="inline-block px-2.5 py-0.5 bg-black text-white text-[10px] font-black uppercase tracking-wider">
                {slide.tag || 'URBAN DISPATCH'}
              </div>
              <h1 className="font-black text-xl sm:text-2xl uppercase tracking-tight text-black leading-tight">
                {slide.headline || cleanTakeaway || 'Informasi & Tren Terkini'}
              </h1>
              {slide.lead && (
                <p className="text-xs font-semibold text-slate-800 leading-relaxed">
                  {slide.lead}
                </p>
              )}
              <div className="pt-1 flex items-center justify-between text-[10px] font-bold text-black border-t border-black/20">
                <span>GESER ➔</span>
                <span className="font-mono">#NEWSLY</span>
              </div>
            </div>
          ) : (
            <div
              className={`relative z-10 space-y-3 ${
                isLight ? 'p-4 rounded-2xl bg-white/95 border border-slate-200 shadow-xl' : ''
              }`}
            >
              {/* Live Ticker for BLOOMBERG */}
              {style === 'BLOOMBERG' && (
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 font-mono text-[9px] font-bold shadow-sm">
                  <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>▲ IHSG +1.4% • BTC $94.2K</span>
                </div>
              )}

              {/* Spotlight Tag for SPOTLIGHT */}
              {style === 'SPOTLIGHT' && (
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-fuchsia-600/40 border border-fuchsia-400/50 text-fuchsia-100 text-[10px] font-black uppercase shadow-sm">
                  <Star className="size-3 text-amber-400 fill-amber-400" /> TOP TRENDING #1
                </div>
              )}

              {/* Headline */}
              <h1
                className={`font-black tracking-tight leading-[1.2] ${
                  style === 'EDITORIAL' || style === 'POLICY'
                    ? 'font-serif text-2xl sm:text-3xl'
                    : style === 'BOLD' || style === 'ATHLETIC'
                    ? 'italic font-black text-2xl sm:text-3xl uppercase'
                    : style === 'MINIMAL'
                    ? 'font-sans text-2xl sm:text-3xl uppercase tracking-tighter'
                    : 'font-sans text-2xl sm:text-3xl'
                }`}
                style={{
                  color: isLight
                    ? textPrimary
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
                  style={{ color: textSecondary }}
                >
                  {slide.lead}
                </p>
              )}

              <div className="pt-1 flex items-center gap-2">
                <span
                  className="text-[10px] font-black uppercase tracking-wider flex items-center gap-1"
                  style={{ color: accent }}
                >
                  Geser untuk ulasan lengkap <ArrowRight className="size-3 inline" />
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── B. POINT SLIDE (FAKTA & PEMBAHASAN) ─── */}
      {isPoint && (
        <div className="relative z-10 flex-1 flex flex-col justify-between p-4 sm:p-6 space-y-3.5 overflow-hidden">
          {/* Main Visual Photo Container - Jernih, Tajam, & Terbingkai Rapi */}
          {slide.imageUrl && (
            <div
              className={`relative w-full h-36 sm:h-44 rounded-2xl overflow-hidden shadow-md shrink-0 ${
                isLight ? 'border-2 border-slate-200 shadow-lg' : 'border border-white/15'
              }`}
            >
              <img
                src={slide.imageUrl}
                alt={`Visual Slide ${slide.index + 1}`}
                className="w-full h-full object-cover filter contrast-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
              <div className="absolute bottom-2.5 left-3.5 right-3.5 flex items-center justify-between">
                <span className="text-[10px] font-bold text-white drop-shadow truncate max-w-[220px]">
                  {cleanTakeaway || slide.headline}
                </span>
                <span className="text-[9px] font-mono font-black bg-black/80 px-2.5 py-0.5 rounded-lg text-white border border-white/20">
                  #{slide.index + 1}
                </span>
              </div>
            </div>
          )}

          {/* Text Content Block */}
          <div
            className={`space-y-2.5 flex-1 flex flex-col justify-center ${
              isLight ? 'p-4 rounded-2xl bg-white border border-slate-200 shadow-md' : 'p-3 rounded-2xl bg-slate-900/60 border border-white/10'
            }`}
          >
            {/* Header Poin Manfaat */}
            <div className="flex items-start gap-2">
              {style === 'EDITORIAL' || style === 'POLICY' ? (
                <div className="w-1.5 self-stretch bg-red-800 rounded-full shrink-0" />
              ) : style === 'MINIMAL' ? (
                <div className="w-1.5 self-stretch bg-black rounded-full shrink-0" />
              ) : style === 'FINANCE' ? (
                <div className="w-1.5 self-stretch bg-emerald-500 rounded-full shrink-0" />
              ) : (
                <div className="w-1.5 self-stretch rounded-full shrink-0" style={{ backgroundColor: accent }} />
              )}

              <h2
                className={`font-black tracking-tight text-base sm:text-lg leading-snug ${
                  style === 'EDITORIAL' || style === 'POLICY' ? 'font-serif' : 'font-sans'
                }`}
                style={{ color: textPrimary }}
              >
                {cleanTakeaway || `Poin Pembahasan`}
              </h2>
            </div>

            {/* Penjelasan Mendalam */}
            {slide.supportingText && (
              <p
                className="text-xs sm:text-sm font-medium leading-relaxed"
                style={{ color: textSecondary }}
              >
                {slide.supportingText}
              </p>
            )}

            {/* Stat Highlight Badge */}
            {slide.statHighlight && (
              <div
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl border self-start text-[10px] font-black shadow-sm"
                style={{
                  backgroundColor: isLight ? `${accent}15` : `${accent}25`,
                  borderColor: isLight ? `${accent}40` : `${accent}50`,
                  color: isLight ? accent : '#FFFFFF',
                }}
              >
                <TrendingUp className="size-3" style={{ color: accent }} />
                <span>{slide.statHighlight}</span>
              </div>
            )}

            {/* Quote Box */}
            {slide.sourceQuote && (
              <div
                className="relative pl-3 py-1 border-l-2 text-[10px] sm:text-xs italic leading-relaxed font-serif"
                style={{
                  borderColor: accent,
                  color: isLight ? '#475569' : '#CBD5E1',
                }}
              >
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
            className={`size-16 rounded-3xl flex items-center justify-center shadow-xl border ${
              isLight ? 'bg-white border-slate-200 shadow-md' : 'border-white/20'
            }`}
            style={{
              backgroundColor: isLight ? `${accent}15` : `${accent}25`,
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
              style={{ color: textPrimary }}
            >
              {cleanTakeaway || 'Rangkuman & Wawasan'}
            </h2>
            <p
              className="text-xs sm:text-sm font-medium leading-relaxed"
              style={{ color: textSecondary }}
            >
              {slide.supportingText || 'Semoga ringkasan informasi ini bermanfaat untuk wawasan dan strategi Anda.'}
            </p>
          </div>

          {/* Social Action Grid */}
          <div className="w-full max-w-xs grid grid-cols-2 gap-2 pt-2 text-[10px] font-bold">
            <div
              className={`rounded-xl p-2.5 flex items-center justify-center gap-1.5 border shadow-sm ${
                isLight ? 'bg-white border-slate-200 text-slate-900 font-bold' : 'bg-white/5 border-white/10 text-slate-100'
              }`}
            >
              <span>📌 Simpan Postingan</span>
            </div>
            <div
              className={`rounded-xl p-2.5 flex items-center justify-center gap-1.5 border shadow-sm ${
                isLight ? 'bg-white border-slate-200 text-slate-900 font-bold' : 'bg-white/5 border-white/10 text-slate-100'
              }`}
            >
              <span>🚀 Bagikan ke Tim</span>
            </div>
          </div>

          {/* CTA Button Badge */}
          <div
            className="w-full max-w-xs py-3 px-4 rounded-2xl font-black text-xs shadow-xl flex items-center justify-center gap-2"
            style={{
              backgroundColor: accent,
              color: style === 'STREETWEAR' || style === 'MINIMAL' || style === 'BOLD' ? '#000000' : '#FFFFFF',
            }}
          >
            <span>{slide.ctaText || 'Ikuti untuk analisis harian'}</span>
            <ArrowRight className="size-3.5" />
          </div>
        </div>
      )}

      {/* ─── 4. FOOTER BAR ─── */}
      <div
        className={`relative z-20 px-5 sm:px-6 py-3 flex items-center justify-between text-[10px] font-semibold shrink-0 ${
          isLight ? 'border-t border-slate-200 bg-white/40' : 'border-t border-white/10'
        }`}
      >
        <span className="font-bold tracking-wide" style={{ color: textMuted }}>
          {handle}
        </span>

        <span className="uppercase tracking-widest text-[9px] font-bold" style={{ color: textMuted }}>
          {slide.source || 'Newsly AI'}
        </span>
      </div>
    </div>
  );

  if (showPhoneFrame) {
    return (
      <div
        className={`relative p-2.5 sm:p-4 rounded-[40px] border-4 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] flex flex-col items-center transition-colors duration-200 ${
          isLight ? 'bg-slate-200 border-slate-300' : 'bg-slate-900 border-slate-700/80'
        }`}
      >
        {/* Phone Notch */}
        <div
          className={`w-24 h-4 rounded-full mb-3 shadow-inner shrink-0 ${
            isLight ? 'bg-slate-400' : 'bg-slate-950 border border-slate-800'
          }`}
        />
        {canvasContent}
        {/* Phone Bottom Pill */}
        <div
          className={`w-28 h-1 rounded-full mt-3.5 shrink-0 ${
            isLight ? 'bg-slate-400' : 'bg-slate-600'
          }`}
        />
      </div>
    );
  }

  return canvasContent;
}
