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
  HelpCircle,
  BarChart3,
  Check,
  ShoppingBag,
  Tag,
  MessageSquare,
  ThumbsUp,
  Calendar,
  Clock,
  Ticket,
  BadgeCheck,
  Repeat,
} from 'lucide-react';

export type SlideLayoutVariant =
  | 'COVER'
  | 'OUTRO'
  | 'STAT_HERO'
  | 'IMAGE_TOP_TEXT_BOTTOM'
  | 'TEXT_CENTER'
  | 'TEXT_BOTTOM'
  | 'QUOTE_CARD'
  | 'SPLIT_TWO_COL';

export type SlideData = {
  index: number;
  type: 'COVER' | 'POINT' | 'OUTRO';
  layoutVariant?: SlideLayoutVariant;
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
  logoUrl?: string | null;
  hideNewslyWatermark?: boolean;
  totalSlides?: number;
  scale?: number;
  showPhoneFrame?: boolean;
  className?: string;
  customAccent?: string;
  fontFamily?: string;
};

export function CanvasRenderer({
  slide,
  style,
  format = 'FEED_PORTRAIT',
  handle = '@newsly.ai',
  brandName = 'NEWSLY AI',
  logoUrl = null,
  hideNewslyWatermark = false,
  totalSlides = 5,
  scale = 1,
  showPhoneFrame = false,
  className = '',
  customAccent,
  fontFamily,
}: CanvasRendererProps) {
  const styleDef = STYLES.find((s) => s.id === style) || STYLES[0];
  const accent = customAccent || styleDef.accentColor;
  const isLight = styleDef.isLight ?? false;

  const aspectClass =
    format === 'FEED_PORTRAIT'
      ? 'aspect-[4/5] max-w-[440px]'
      : format === 'STORY'
      ? 'aspect-[9/16] max-w-[360px]'
      : 'aspect-square max-w-[440px]';

  const isCover = slide.type === 'COVER' || slide.index === 0;
  const isOutro = slide.type === 'OUTRO' || slide.index === totalSlides - 1;

  // Slide roles for dynamic visual rhythm
  const isSlide2_Metric = !isCover && !isOutro && slide.index === 1;
  const isSlide3_Detail = !isCover && !isOutro && slide.index === 2;
  const isSlide4_Quote = !isCover && !isOutro && (slide.index === 3 || slide.index >= 3);

  // Menentukan varian tata letak dinamis untuk slide konten (slide 2 ke atas)
  const defaultVariant: SlideLayoutVariant =
    slide.index % 5 === 1
      ? 'STAT_HERO'
      : slide.index % 5 === 2
      ? 'IMAGE_TOP_TEXT_BOTTOM'
      : slide.index % 5 === 3
      ? 'QUOTE_CARD'
      : slide.index % 5 === 4
      ? 'SPLIT_TWO_COL'
      : 'TEXT_CENTER';

  const activeVariant: SlideLayoutVariant = slide.layoutVariant || defaultVariant;

  const fontClass =
    fontFamily === 'font-serif'
      ? 'font-serif'
      : fontFamily === 'font-mono'
      ? 'font-mono'
      : fontFamily === 'font-bold-impact'
      ? 'font-sans tracking-tight'
      : 'font-sans';

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
      className={`relative w-full overflow-hidden rounded-2xl shadow-2xl flex flex-col justify-between select-none transition-all duration-300 ${aspectClass} ${fontClass} ${className}`}
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

      {/* ─── 12 NEW E-COMMERCE & SOCIAL DNA ACCENTS ─── */}
      {style === 'SHOPEE_PROMO' && (
        <>
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-orange-500 via-amber-400 to-red-500 z-30 shadow-[0_0_20px_rgba(238,77,45,0.8)]" />
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-orange-600/25 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-red-600/20 rounded-full blur-3xl pointer-events-none" />
        </>
      )}

      {style === 'RACUN_SHOPEE' && (
        <>
          <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-60 h-60 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        </>
      )}

      {style === 'PRODUCT_CATALOG' && (
        <div className="absolute inset-3 border border-[#C5A880]/40 pointer-events-none rounded-2xl" />
      )}

      {style === 'BRUTALIST_SALE' && (
        <>
          <div className="absolute inset-2 border-2 border-black pointer-events-none rounded-xl" />
          <div className="absolute inset-0 bg-[radial-gradient(#00000015_1px,transparent_1px)] [background-size:12px_12px] pointer-events-none" />
        </>
      )}

      {style === 'BEFORE_AFTER' && (
        <div className="absolute top-0 bottom-0 left-1/2 w-px bg-white/15 pointer-events-none z-0" />
      )}

      {style === 'TESTIMONIAL_CHAT' && (
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      )}

      {style === 'PRICE_TIER_TABLE' && (
        <>
          <div className="absolute top-0 right-0 w-72 h-72 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        </>
      )}

      {style === 'UNBOXING_POLAROID' && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-amber-200/50 -rotate-2 pointer-events-none z-30 shadow-sm backdrop-blur-[1px]" />
      )}

      {style === 'TWITTER_THREAD' && (
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(29,155,240,0.05),transparent_40%)] pointer-events-none" />
      )}

      {style === 'QUOTE_MINIMAL' && (
        <div className="absolute -bottom-8 -right-2 text-[180px] font-serif font-black text-white/5 select-none pointer-events-none leading-none z-0">
          “
        </div>
      )}

      {style === 'STEP_BY_STEP_GUIDE' && (
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-slate-800 z-30">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-300"
            style={{ width: `${((slide.index + 1) / totalSlides) * 100}%` }}
          />
        </div>
      )}

      {style === 'EVENT_WEBINAR' && (
        <>
          <div className="absolute top-0 right-0 w-80 h-80 bg-pink-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        </>
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
          ) : style === 'SHOPEE_PROMO' ? (
            <span className="px-2.5 py-0.5 text-[10px] font-black uppercase bg-[#EE4D2D] text-white flex items-center gap-1 shadow-sm rounded-md">
              <Zap className="size-3 fill-current text-yellow-300" /> {slide.tag || 'FLASH SALE'}
            </span>
          ) : style === 'RACUN_SHOPEE' ? (
            <span className="px-2.5 py-0.5 text-[10px] font-black uppercase bg-gradient-to-r from-pink-500 to-rose-500 text-white flex items-center gap-1 shadow-sm rounded-md">
              <Sparkles className="size-3" /> {slide.tag || 'RACUN SHOPEE'}
            </span>
          ) : style === 'PRODUCT_CATALOG' ? (
            <span className="px-3 py-0.5 text-[9px] font-serif tracking-widest uppercase border border-[#C5A880] text-[#8C6D46] rounded-full">
              {slide.tag || 'OFFICIAL BOUTIQUE'}
            </span>
          ) : style === 'BRUTALIST_SALE' ? (
            <span className="px-2.5 py-0.5 text-[10px] font-black uppercase bg-[#CCFF00] text-black border-2 border-black shadow-[2px_2px_0px_#000] -rotate-1">
              <Tag className="size-3 inline mr-1" /> {slide.tag || 'DROP ALERT'}
            </span>
          ) : style === 'BEFORE_AFTER' ? (
            <span className="px-2.5 py-0.5 text-[10px] font-black uppercase bg-emerald-600 text-white flex items-center gap-1 rounded-md shadow-sm">
              ✨ {slide.tag || 'TRANSFORMASI'}
            </span>
          ) : style === 'TESTIMONIAL_CHAT' ? (
            <span className="px-2.5 py-0.5 text-[10px] font-black uppercase bg-[#25D366] text-white flex items-center gap-1 rounded-md shadow-sm">
              <MessageSquare className="size-3" /> {slide.tag || 'VERIFIED BUYER'}
            </span>
          ) : style === 'PRICE_TIER_TABLE' ? (
            <span className="px-2.5 py-0.5 text-[10px] font-black uppercase bg-amber-500 text-slate-950 font-mono flex items-center gap-1 rounded-md shadow-sm">
              <Tag className="size-3" /> {slide.tag || 'PRICE LIST'}
            </span>
          ) : style === 'UNBOXING_POLAROID' ? (
            <span className="px-2.5 py-0.5 text-[10px] font-bold text-slate-700 bg-amber-100 border border-amber-300 rounded shadow-sm rotate-1">
              <Bookmark className="size-3 text-pink-500 inline mr-1" /> {slide.tag || 'UNBOXING DIARY'}
            </span>
          ) : style === 'TWITTER_THREAD' ? (
            <div className="flex items-center gap-1.5">
              <div className="size-4.5 rounded-full bg-slate-800 flex items-center justify-center text-[9px] font-bold text-white border border-white/20">
                𝕏
              </div>
              <span className="text-[10px] font-bold text-white flex items-center gap-1">
                Thread <BadgeCheck className="size-3 text-sky-400 fill-sky-400" />
              </span>
            </div>
          ) : style === 'QUOTE_MINIMAL' ? (
            <span className="text-[9px] font-mono tracking-widest uppercase text-slate-400 border-b border-slate-700 pb-0.5">
              {slide.tag || 'REFLEKSI'}
            </span>
          ) : style === 'STEP_BY_STEP_GUIDE' ? (
            <div className="flex items-center gap-1.5">
              <span className="size-4 rounded-full bg-purple-600 text-[9px] font-black text-white flex items-center justify-center">
                {slide.index + 1}
              </span>
              <span className="text-[10px] font-black text-purple-400 uppercase tracking-wider">
                {slide.tag || `LANGKAH 0${slide.index + 1}`}
              </span>
            </div>
          ) : style === 'EVENT_WEBINAR' ? (
            <span className="px-2.5 py-0.5 text-[10px] font-mono font-black uppercase bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-md flex items-center gap-1 shadow-sm">
              <Ticket className="size-3" /> {slide.tag || 'ADMISSION PASS'}
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

      {/* ─── 3. MAIN BODY CONTENT (DYNAMIC VISUAL RHYTHM) ─── */}

      {/* ─── A. SLIDE 1: COVER (HERO HOOK) ─── */}
      {isCover && (
        <div className="relative z-10 flex-1 flex flex-col justify-end p-5 sm:p-7 overflow-hidden">
          {/* Background Photo for Cover */}
          {slide.imageUrl && (
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
              <img
                src={slide.imageUrl}
                alt="Cover Background"
                className={`w-full h-full object-cover filter transition-opacity duration-300 ${
                  isLight ? 'opacity-95 brightness-100 contrast-105' : 'opacity-90 brightness-100 contrast-105'
                }`}
              />
              <div
                className="absolute inset-0"
                style={{
                  background: isLight
                    ? `linear-gradient(to top, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.7) 25%, rgba(255,255,255,0.1) 45%, transparent 65%)`
                    : `linear-gradient(to top, ${styleDef.bgColor} 0%, ${styleDef.bgColor}ee 20%, ${styleDef.bgColor}90 38%, rgba(0,0,0,0.2) 55%, transparent 70%)`,
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
                isLight ? 'p-4 rounded-2xl bg-white/80 backdrop-blur-md border border-white/60 shadow-lg' : ''
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

              {/* Special Cover: SHOPEE_PROMO */}
              {style === 'SHOPEE_PROMO' && (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-orange-950/90 border border-orange-500/60 text-xs shadow-md">
                  <span className="line-through text-slate-400 text-[11px]">Rp 189.000</span>
                  <span className="font-black text-yellow-300 text-sm">🔥 Rp 79.000</span>
                  <span className="px-1.5 py-0.5 bg-red-600 text-white text-[9px] font-black rounded-md uppercase">DISKON 60%</span>
                </div>
              )}

              {/* Special Cover: RACUN_SHOPEE */}
              {style === 'RACUN_SHOPEE' && (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-900/90 border border-pink-500/40 text-xs shadow-md">
                  <span className="text-amber-400 text-xs font-black">★★★★★</span>
                  <span className="text-white text-[11px] font-bold">4.9/5 (1.8k+ Ulasan)</span>
                  <span className="text-[10px] text-pink-400 font-mono">#ViralAffiliate</span>
                </div>
              )}

              {/* Special Cover: PRODUCT_CATALOG */}
              {style === 'PRODUCT_CATALOG' && (
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#C5A880]/20 border border-[#C5A880] text-[#8C6D46]">100% Halal</span>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#C5A880]/20 border border-[#C5A880] text-[#8C6D46]">BPOM Certified</span>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#C5A880]/20 border border-[#C5A880] text-[#8C6D46]">Original</span>
                </div>
              )}

              {/* Special Cover: BRUTALIST_SALE */}
              {style === 'BRUTALIST_SALE' && (
                <div className="inline-block px-3 py-1 bg-[#CCFF00] text-black font-black text-xs uppercase border-2 border-black shadow-[3px_3px_0px_#000] -rotate-2">
                  ⚡ SPECIAL DROP — 50% OFF TODAY
                </div>
              )}

              {/* Special Cover: BEFORE_AFTER */}
              {style === 'BEFORE_AFTER' && (
                <div className="grid grid-cols-2 gap-2 text-center text-xs font-bold pt-1">
                  <div className="p-1.5 rounded-xl bg-red-950/80 border border-red-500/40 text-red-300">❌ SEBELUM (Masalah)</div>
                  <div className="p-1.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300">✨ SESUDAH (Solusi)</div>
                </div>
              )}

              {/* Special Cover: TESTIMONIAL_CHAT */}
              {style === 'TESTIMONIAL_CHAT' && (
                <div className="p-2.5 rounded-2xl bg-[#005c4b]/90 border border-emerald-400/30 text-emerald-50 text-xs shadow-lg space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-emerald-300">
                    <span className="font-bold flex items-center gap-1"><MessageSquare className="size-3" /> WhatsApp Review</span>
                    <span>14:32 ✓✓</span>
                  </div>
                  <p className="italic font-medium text-[11px]">“Barangnya original, packing rapi dan cepat banget sampai. Bintang 5!”</p>
                </div>
              )}

              {/* Special Cover: TWITTER_THREAD */}
              {style === 'TWITTER_THREAD' && (
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/80 border border-slate-700 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <div className="size-6 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold text-white">𝕏</div>
                    <div>
                      <p className="text-[11px] font-bold text-white flex items-center gap-1">{brandName} <BadgeCheck className="size-3 text-sky-400 fill-sky-400" /></p>
                      <p className="text-[9px] text-slate-400">{handle}</p>
                    </div>
                  </div>
                  <div className="text-[9px] font-mono text-slate-400">
                    🔁 2.4k • ❤️ 18.2k
                  </div>
                </div>
              )}

              {/* Special Cover: PRICE_TIER_TABLE */}
              {style === 'PRICE_TIER_TABLE' && (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-amber-950/80 border border-amber-500/40 text-xs font-mono text-amber-300">
                  <Tag className="size-3" />
                  <span>PAKET BEST SELLER • MULAI DARI Rp 49.000</span>
                </div>
              )}

              {/* Special Cover: EVENT_WEBINAR */}
              {style === 'EVENT_WEBINAR' && (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-pink-950/80 border border-pink-500/40 text-xs font-mono text-pink-300">
                  <Calendar className="size-3" />
                  <span>ONLINE WORKSHOP • SLOT TERBATAS</span>
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
                } ${!isLight ? 'drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]' : ''}`}
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
                  className={`text-xs sm:text-sm font-medium line-clamp-3 leading-relaxed ${
                    !isLight ? 'drop-shadow-[0_1px_6px_rgba(0,0,0,0.8)]' : ''
                  }`}
                  style={{ color: isLight ? textSecondary : '#F1F5F9' }}
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

      {/* ─── B. SLIDE KONTEN (SLIDE 2 KE ATAS): DNA TEMPLATE SPESIFIK & 6 VARIAN MODULAR ─── */}
      {!isCover && !isOutro && (
        <>
          {/* KHUSUS 1: TWITTER_THREAD (Cuitan Utas X Asli Dark Mode) */}
          {style === 'TWITTER_THREAD' ? (
            <div className="relative z-10 flex-1 flex flex-col justify-between p-4 sm:p-6 overflow-hidden text-[#E7E9EA]">
              <div className="relative flex-1 flex flex-col justify-between rounded-2xl bg-black/95 border border-white/15 p-5 shadow-2xl backdrop-blur-md">
                {/* Twitter Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="size-9 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-md border border-white/20 shrink-0">
                      {brandName.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="leading-tight">
                      <div className="flex items-center gap-1 font-bold text-white text-xs sm:text-sm">
                        <span>{brandName}</span>
                        <BadgeCheck className="size-3.5 text-[#1D9BF0] fill-[#1D9BF0]" />
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">{handle} · 2h</span>
                    </div>
                  </div>
                  <div className="px-2 py-0.5 rounded-full bg-white/10 text-[9px] font-mono font-bold text-sky-400 border border-white/15">
                    {slide.index + 1}/{totalSlides} 🧵
                  </div>
                </div>

                {/* Tweet Body with Left Thread Connector */}
                <div className="relative my-3 pl-3.5 border-l-2 border-white/20 flex-1 flex flex-col justify-center space-y-2.5">
                  <h2 className="text-sm sm:text-base font-bold leading-relaxed text-white">
                    {cleanTakeaway}
                  </h2>
                  {slide.supportingText && (
                    <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed">
                      {slide.supportingText}
                    </p>
                  )}
                </div>

                {/* Tweet Interaction Bar */}
                <div className="pt-2.5 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span className="flex items-center gap-1">
                    <MessageSquare className="size-3" /> 84
                  </span>
                  <span className="flex items-center gap-1">
                    <Repeat className="size-3" /> 1.2K
                  </span>
                  <span className="flex items-center gap-1">
                    <ThumbsUp className="size-3" /> 9.4K
                  </span>
                  <span className="flex items-center gap-1">
                    <Bookmark className="size-3" /> 2.1K
                  </span>
                </div>
              </div>
            </div>
          ) : style === 'SHOPEE_PROMO' || style === 'RACUN_SHOPEE' ? (
            /* KHUSUS 2: SHOPEE_PROMO & RACUN_SHOPEE (E-Commerce Product Card) */
            <div className="relative z-10 flex-1 flex flex-col justify-between p-4 sm:p-6 space-y-3 overflow-hidden">
              {slide.imageUrl ? (
                <div className="relative w-full h-36 sm:h-44 rounded-2xl overflow-hidden border-2 border-orange-500/40 shadow-xl shrink-0">
                  <img src={slide.imageUrl} alt="Product Detail" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute bottom-2.5 left-3.5 right-3.5 flex items-center justify-between">
                    <span className="px-2 py-0.5 bg-[#EE4D2D] text-white text-[10px] font-black uppercase rounded shadow">
                      {style === 'RACUN_SHOPEE' ? '✨ RACUN VIRAL' : '🔥 FLASH DEAL'}
                    </span>
                    <span className="text-xs font-black text-yellow-300">★★★★★ 4.9/5</span>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-600/30 to-rose-600/30 border border-orange-500/50 flex items-center justify-between shadow-lg">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-mono font-black text-orange-400 uppercase tracking-wider">
                      {slide.tag || (slide.index === 1 ? 'KEUNGGULAN UTAMA' : slide.index === 2 ? 'SPESIFIKASI & LEGALITAS' : 'REVIEW PEMBELI')}
                    </span>
                    <div className="text-xl font-black text-yellow-300">
                      {slide.statHighlight || (style === 'RACUN_SHOPEE' ? 'Rating 4.9/5' : 'Diskon 50%')}
                    </div>
                  </div>
                  <div className="px-3 py-1 bg-[#EE4D2D] text-white font-black text-xs rounded-xl shadow">
                    {style === 'RACUN_SHOPEE' ? 'WAJIB PUNYA' : 'BEST SELLER'}
                  </div>
                </div>
              )}

              <div className={`p-4 rounded-2xl space-y-2.5 flex-1 flex flex-col justify-center border ${isLight ? 'bg-white border-orange-200 shadow-md' : 'bg-slate-900/80 border-orange-500/30'}`}>
                <h2 className="font-black text-base sm:text-lg tracking-tight text-white leading-snug">
                  {cleanTakeaway}
                </h2>
                {slide.supportingText && (
                  <p className="text-xs sm:text-sm font-medium leading-relaxed text-slate-300">
                    {slide.supportingText}
                  </p>
                )}

                <div className="pt-2 border-t border-white/10 grid grid-cols-2 gap-2 text-[10px] font-bold">
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <Check className="size-3.5 shrink-0" />
                    <span>100% Original Asli</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-yellow-400">
                    <Star className="size-3.5 shrink-0 fill-current" />
                    <span>Garansi Kepuasan</span>
                  </div>
                </div>
              </div>
            </div>
          ) : style === 'STEP_BY_STEP_GUIDE' ? (
            /* KHUSUS 3: STEP_BY_STEP_GUIDE (Tutorial Roadmap Card) */
            <div className="relative z-10 flex-1 flex flex-col justify-between p-4 sm:p-6 space-y-3.5 overflow-hidden">
              <div className="flex items-center justify-between gap-1.5 px-2">
                {Array.from({ length: Math.min(totalSlides - 2, 5) }).map((_, stepIdx) => (
                  <div
                    key={stepIdx}
                    className={`h-1.5 flex-1 rounded-full transition-all ${
                      stepIdx <= slide.index - 1 ? 'bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]' : 'bg-white/20'
                    }`}
                  />
                ))}
              </div>

              <div className="p-5 rounded-3xl bg-slate-900/90 border border-purple-500/40 shadow-2xl flex-1 flex flex-col justify-between space-y-3">
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-600/30 border border-purple-500/50 text-purple-300 font-mono text-xs font-black">
                    <span className="size-2 rounded-full bg-purple-400 animate-pulse" />
                    <span>LANGKAH 0{slide.index}</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">Tahap {slide.index} dari {totalSlides - 2}</span>
                </div>

                <div className="space-y-2">
                  <h2 className="font-black text-base sm:text-lg tracking-tight text-white leading-snug">
                    {cleanTakeaway}
                  </h2>
                  {slide.supportingText && (
                    <p className="text-xs sm:text-sm font-medium leading-relaxed text-slate-300">
                      {slide.supportingText}
                    </p>
                  )}
                </div>

                <div className="p-3 rounded-xl bg-purple-950/50 border border-purple-500/30 flex items-start gap-2.5 text-xs text-purple-200">
                  <Lightbulb className="size-4 shrink-0 text-amber-400 mt-0.5" />
                  <span className="text-[11px] leading-relaxed">
                    {slide.statHighlight ? `Tips: ${slide.statHighlight}` : 'Lakukan langkah ini dengan teliti agar hasil optimal.'}
                  </span>
                </div>
              </div>
            </div>
          ) : style === 'TESTIMONIAL_CHAT' ? (
            /* KHUSUS 4: TESTIMONIAL_CHAT (WhatsApp / DM Chat Screenshot) */
            <div className="relative z-10 flex-1 flex flex-col justify-between p-4 sm:p-6 space-y-3 overflow-hidden">
              <div className="p-3 rounded-2xl bg-[#1F2C34] border border-white/10 flex items-center justify-between shadow-lg">
                <div className="flex items-center gap-2.5">
                  <div className="size-8 rounded-full bg-emerald-700 flex items-center justify-center text-white font-bold text-xs">
                    {slide.author ? slide.author.slice(0, 2).toUpperCase() : 'PB'}
                  </div>
                  <div className="leading-tight">
                    <div className="font-bold text-white text-xs flex items-center gap-1">
                      <span>{slide.author || 'Pembeli Terverifikasi'}</span>
                      <BadgeCheck className="size-3.5 text-emerald-400 fill-emerald-400" />
                    </div>
                    <span className="text-[9px] text-emerald-400 font-mono">online • Shopee Verified</span>
                  </div>
                </div>
                <div className="flex items-center text-amber-400 text-xs font-black">
                  ★★★★★
                </div>
              </div>

              <div className="flex-1 flex flex-col justify-center space-y-2.5 px-1">
                <div className="self-start max-w-[95%] p-4 rounded-2xl rounded-tl-sm bg-[#005C4B] text-white shadow-xl space-y-2 border border-emerald-600/30">
                  <p className="text-xs sm:text-sm leading-relaxed font-medium">
                    "{cleanTakeaway}"
                  </p>
                  {slide.supportingText && (
                    <p className="text-[11px] text-emerald-100/80 leading-relaxed pt-1 border-t border-emerald-600/30">
                      {slide.supportingText}
                    </p>
                  )}
                  <div className="flex items-center justify-end gap-1 text-[9px] text-emerald-200 font-mono pt-1">
                    <span>14:22</span>
                    <span className="text-sky-300 font-bold">✓✓</span>
                  </div>
                </div>
              </div>

              <div className="p-2 rounded-xl bg-slate-900/60 border border-white/10 text-center text-[10px] font-mono text-slate-400">
                💬 Ulasan Nyata Pelanggan Terverifikasi
              </div>
            </div>
          ) : style === 'PRODUCT_CATALOG' ? (
            /* KHUSUS 5: PRODUCT_CATALOG (Luxury Boutique Card) */
            <div className="relative z-10 flex-1 flex flex-col justify-between p-4 sm:p-6 space-y-3 overflow-hidden text-[#26211C]">
              <div className="relative flex-1 flex flex-col justify-between p-5 rounded-3xl bg-white border border-[#C5A880]/40 shadow-xl space-y-2.5">
                {slide.imageUrl && (
                  <div className="relative w-full h-32 sm:h-40 rounded-2xl overflow-hidden border border-[#C5A880]/30 shadow-md shrink-0">
                    <img src={slide.imageUrl} alt="Catalog" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  </div>
                )}
                <div className="space-y-0.5 text-center">
                  <span className="text-[9px] font-serif uppercase tracking-widest text-[#8C6D46] block">
                    {slide.tag || `Koleksi #${slide.index}`}
                  </span>
                  <div className="h-px w-12 mx-auto bg-[#C5A880]/50 my-1" />
                </div>

                <div className="space-y-2 my-auto text-center">
                  <h2 className="font-serif font-bold text-base sm:text-lg tracking-wide text-[#26211C] leading-snug">
                    {cleanTakeaway}
                  </h2>
                  {slide.supportingText && (
                    <p className="text-xs font-normal text-[#5C5248] leading-relaxed max-w-xs mx-auto">
                      {slide.supportingText}
                    </p>
                  )}
                </div>

                <div className="pt-2 border-t border-[#C5A880]/30 flex items-center justify-around text-[10px] font-serif text-[#8C6D46]">
                  <span>✨ Premium Quality</span>
                  <span>•</span>
                  <span>BPOM & Halal</span>
                </div>
              </div>
            </div>
          ) : style === 'BEFORE_AFTER' ? (
            /* KHUSUS 6: BEFORE_AFTER (Split Problem vs Solution) */
            <div className="relative z-10 flex-1 flex flex-col justify-center p-4 sm:p-6 space-y-3 overflow-hidden">
              <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 space-y-1 shadow-md">
                <span className="text-[9px] font-black text-rose-400 uppercase tracking-wider block">
                  ❌ SEBELUM (MASALAH)
                </span>
                <h3 className="font-bold text-xs sm:text-sm text-white leading-snug">
                  {cleanTakeaway}
                </h3>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 space-y-1 shadow-md">
                <span className="text-[9px] font-black text-emerald-400 uppercase tracking-wider block">
                  ✅ SESUDAH (HASIL NYATA)
                </span>
                <p className="text-xs sm:text-sm font-medium text-emerald-100 leading-relaxed">
                  {slide.supportingText || 'Perubahan nyata terasa cepat dengan hasil yang bertahan jangka panjang.'}
                </p>
              </div>

              {slide.statHighlight && (
                <div className="text-center p-2 rounded-xl bg-white/5 border border-white/10 text-xs font-mono font-bold text-yellow-300">
                  ⚡ {slide.statHighlight}
                </div>
              )}
            </div>
          ) : style === 'QUOTE_MINIMAL' ? (
            /* KHUSUS 7: QUOTE_MINIMAL (Ultra Clean Typographic Quote) */
            <div className="relative z-10 flex-1 flex flex-col justify-center p-5 sm:p-7 space-y-4 overflow-hidden text-white">
              <div className="relative p-6 sm:p-8 rounded-3xl bg-zinc-950 border border-zinc-800 shadow-2xl space-y-4">
                <Quote className="size-8 text-zinc-600 opacity-60" />
                <h2 className="font-serif italic text-base sm:text-lg font-bold leading-relaxed text-zinc-100">
                  "{cleanTakeaway}"
                </h2>
                {slide.supportingText && (
                  <p className="text-xs sm:text-sm text-zinc-400 font-sans font-normal leading-relaxed pt-2 border-t border-zinc-800">
                    {slide.supportingText}
                  </p>
                )}
                <div className="pt-1 flex items-center justify-between text-[10px] font-mono text-zinc-500">
                  <span>— {slide.author || brandName}</span>
                  <span>0{slide.index + 1}</span>
                </div>
              </div>
            </div>
          ) : style === 'PRICE_TIER_TABLE' ? (
            /* KHUSUS 8: PRICE_TIER_TABLE */
            <div className="relative z-10 flex-1 flex flex-col justify-center p-4 sm:p-6 space-y-3 overflow-hidden">
              <div className="p-5 rounded-3xl bg-slate-900/90 border border-amber-500/40 space-y-2.5 shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider">
                    {slide.tag || `PAKET #${slide.index}`}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-mono font-black border border-amber-500/40">
                    BEST VALUE
                  </span>
                </div>
                <h2 className="font-black text-base sm:text-lg text-white leading-tight">
                  {cleanTakeaway}
                </h2>
                <div className="text-2xl font-black text-amber-400 font-mono">
                  {slide.statHighlight || 'Harga Spesial'}
                </div>
                {slide.supportingText && (
                  <p className="text-xs text-slate-300 leading-relaxed pt-2 border-t border-white/10">
                    {slide.supportingText}
                  </p>
                )}
              </div>
            </div>
          ) : style === 'BRUTALIST_SALE' ? (
            /* KHUSUS 9: BRUTALIST_SALE */
            <div className="relative z-10 flex-1 flex flex-col justify-center p-4 sm:p-6 space-y-3 overflow-hidden">
              <div className="p-5 rounded-2xl bg-white text-black border-4 border-black shadow-[6px_6px_0px_#000] space-y-3">
                <div className="inline-block px-2 py-0.5 bg-[#CCFF00] text-black font-black text-[10px] uppercase border-2 border-black -rotate-2">
                  {slide.tag || 'SPEC SPOTLIGHT'}
                </div>
                <h2 className="font-black text-base sm:text-lg uppercase tracking-tight leading-tight">
                  {cleanTakeaway}
                </h2>
                {slide.supportingText && (
                  <p className="text-xs font-bold leading-relaxed text-slate-800">
                    {slide.supportingText}
                  </p>
                )}
                <div className="pt-2 border-t-2 border-black flex items-center justify-between text-xs font-mono font-black">
                  <span className="bg-black text-white px-2 py-0.5">{slide.statHighlight || 'DROP ITEM'}</span>
                  <span>#{slide.index + 1}</span>
                </div>
              </div>
            </div>
          ) : style === 'UNBOXING_POLAROID' ? (
            /* KHUSUS 10: UNBOXING_POLAROID */
            <div className="relative z-10 flex-1 flex flex-col justify-center p-4 sm:p-6 space-y-3 overflow-hidden text-slate-800">
              <div className="relative p-5 rounded-2xl bg-white border-2 border-slate-200 shadow-xl rotate-1 space-y-2.5">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-5 bg-pink-200/80 border border-pink-300/60 rotate-2 shadow-sm pointer-events-none" />
                <span className="text-[10px] font-bold text-pink-500 uppercase tracking-wider block text-center pt-1">
                  ♡ {slide.tag || 'DIARY NOTE'} ♡
                </span>
                <h2 className="font-bold text-base sm:text-lg text-slate-900 leading-snug text-center">
                  {cleanTakeaway}
                </h2>
                {slide.supportingText && (
                  <p className="text-xs text-slate-600 leading-relaxed text-center font-medium">
                    {slide.supportingText}
                  </p>
                )}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>🌸 Rating 5/5</span>
                  <span>Page {slide.index + 1}</span>
                </div>
              </div>
            </div>
          ) : style === 'EVENT_WEBINAR' ? (
            /* KHUSUS 11: EVENT_WEBINAR */
            <div className="relative z-10 flex-1 flex flex-col justify-center p-4 sm:p-6 space-y-3 overflow-hidden text-white">
              <div className="p-5 rounded-3xl bg-slate-900/90 border border-pink-500/40 shadow-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-pink-400 uppercase tracking-wider">
                    {slide.tag || `SESI MATERI #${slide.index}`}
                  </span>
                  <span className="text-xs font-mono font-bold text-yellow-400">
                    <Calendar className="size-3 inline mr-1" /> AGENDA
                  </span>
                </div>
                <h2 className="font-black text-base sm:text-lg text-white leading-tight">
                  {cleanTakeaway}
                </h2>
                {slide.supportingText && (
                  <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
                    {slide.supportingText}
                  </p>
                )}
                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>Live Session</span>
                  <span>Q&A Terbuka</span>
                </div>
              </div>
            </div>
          ) : (
            /* ─── 6 VARIAN MODULAR BERSIH & DINAMIS (NON-BERITA/BERITA SEIMBANG) ─── */
            <>
              {/* VARIAN 1: STAT_HERO */}
              {activeVariant === 'STAT_HERO' && (
                <div className="relative z-10 flex-1 flex flex-col justify-between p-4 sm:p-6 space-y-3 overflow-hidden">
                  {slide.imageUrl ? (
                    <div className="relative w-full h-28 sm:h-36 rounded-2xl overflow-hidden shadow-md shrink-0 border border-white/15">
                      <img src={slide.imageUrl} alt="Visual" className="w-full h-full object-cover filter contrast-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between">
                        <span className="text-[9px] font-mono font-bold text-white uppercase bg-black/60 px-2 py-0.5 rounded">
                          {slide.tag || 'METRIK UTAMA'}
                        </span>
                        <span className="text-sm sm:text-base font-black text-yellow-300 font-mono">
                          {slide.statHighlight || 'Sorotan Data'}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div
                      className={`p-4 sm:p-5 rounded-2xl border text-center space-y-1.5 shadow-md ${
                        isLight
                          ? 'bg-gradient-to-br from-white to-slate-50 border-slate-200'
                          : 'bg-gradient-to-br from-slate-900/90 to-slate-950/90 border-white/15'
                      }`}
                    >
                      <span className="text-[9px] font-mono font-bold uppercase tracking-wider block" style={{ color: accent }}>
                        ⚡ {slide.tag || 'SOROTAN UTAMA'}
                      </span>
                      <div
                        className="text-2xl sm:text-3xl font-black tracking-tight leading-none"
                        style={{ color: style === 'BOLD' ? '#FACC15' : accent }}
                      >
                        {slide.statHighlight || 'Data Utama'}
                      </div>
                    </div>
                  )}

                  <div
                    className={`p-4 rounded-2xl space-y-2 flex-1 flex flex-col justify-center ${
                      isLight ? 'bg-white border border-slate-200 shadow-md' : 'bg-slate-900/70 border border-white/10'
                    }`}
                  >
                    <h2
                      className={`font-black text-base sm:text-lg tracking-tight ${
                        style === 'EDITORIAL' || style === 'POLICY' ? 'font-serif' : 'font-sans'
                      }`}
                      style={{ color: textPrimary }}
                    >
                      {cleanTakeaway || 'Sorotan Data Utama'}
                    </h2>

                    {slide.supportingText && (
                      <p className="text-xs sm:text-sm font-medium leading-relaxed" style={{ color: textSecondary }}>
                        {slide.supportingText}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* VARIAN 2: IMAGE_TOP_TEXT_BOTTOM */}
              {activeVariant === 'IMAGE_TOP_TEXT_BOTTOM' && (
                <div className="relative z-10 flex-1 flex flex-col justify-between p-4 sm:p-6 space-y-3.5 overflow-hidden">
                  {slide.imageUrl ? (
                    <div
                      className={`relative w-full h-36 sm:h-44 rounded-2xl overflow-hidden shadow-md shrink-0 ${
                        isLight ? 'border-2 border-slate-200 shadow-lg' : 'border border-white/15'
                      }`}
                    >
                      <img
                        src={slide.imageUrl}
                        alt="Visual Detail"
                        className="w-full h-full object-cover filter contrast-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                      <div className="absolute bottom-2.5 left-3.5 right-3.5 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-white drop-shadow truncate max-w-[220px]">
                          {cleanTakeaway}
                        </span>
                        <span className="text-[9px] font-mono font-black bg-black/80 px-2 py-0.5 rounded text-white border border-white/20">
                          #{slide.index + 1}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div
                      className={`p-4 rounded-2xl border space-y-2 ${
                        isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/70 border-white/10'
                      }`}
                    >
                      <span className="text-[10px] font-black uppercase tracking-wider block" style={{ color: accent }}>
                        📋 {slide.tag || 'POIN PEMBAHASAN'}
                      </span>
                      <div className="space-y-1 text-xs font-semibold" style={{ color: textSecondary }}>
                        <div className="flex items-center gap-2">
                          <Check className="size-3.5 shrink-0" style={{ color: accent }} />
                          <span>{slide.statHighlight || 'Informasi Utama & Penjelasan Terperinci'}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div
                    className={`space-y-2.5 flex-1 flex flex-col justify-center ${
                      isLight ? 'p-4 rounded-2xl bg-white border border-slate-200 shadow-md' : 'p-3.5 rounded-2xl bg-slate-900/60 border border-white/10'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <div className="w-1.5 self-stretch rounded-full shrink-0" style={{ backgroundColor: accent }} />
                      <h2
                        className={`font-black tracking-tight text-base sm:text-lg leading-snug ${
                          style === 'EDITORIAL' || style === 'POLICY' ? 'font-serif' : 'font-sans'
                        }`}
                        style={{ color: textPrimary }}
                      >
                        {cleanTakeaway || `Pembahasan Mendalam`}
                      </h2>
                    </div>

                    {slide.supportingText && (
                      <p className="text-xs sm:text-sm font-medium leading-relaxed" style={{ color: textSecondary }}>
                        {slide.supportingText}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* VARIAN 3: TEXT_CENTER */}
              {activeVariant === 'TEXT_CENTER' && (
                <div className="relative z-10 flex-1 flex flex-col justify-center p-5 sm:p-7 overflow-hidden">
                  <div
                    className={`p-6 sm:p-8 rounded-3xl border shadow-2xl space-y-4 text-center relative overflow-hidden ${
                      isLight
                        ? 'bg-white border-slate-200 shadow-lg'
                        : 'bg-slate-900/90 border-white/15 backdrop-blur-xl'
                    }`}
                  >
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider mx-auto" style={{ backgroundColor: `${accent}20`, color: accent }}>
                      <Sparkles className="size-3" />
                      <span>{slide.tag || 'POIN PENTING'}</span>
                    </div>

                    <h2
                      className={`font-black text-lg sm:text-xl leading-tight ${
                        style === 'EDITORIAL' || style === 'POLICY' ? 'font-serif' : 'font-sans'
                      }`}
                      style={{ color: textPrimary }}
                    >
                      {cleanTakeaway}
                    </h2>

                    <div className="h-0.5 w-12 mx-auto rounded-full" style={{ backgroundColor: accent }} />

                    {slide.supportingText && (
                      <p className="text-xs sm:text-sm font-medium leading-relaxed" style={{ color: textSecondary }}>
                        {slide.supportingText}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* VARIAN 4: TEXT_BOTTOM */}
              {activeVariant === 'TEXT_BOTTOM' && (
                <div className="relative z-10 flex-1 flex flex-col justify-between p-4 sm:p-6 space-y-3 overflow-hidden">
                  {slide.imageUrl && (
                    <div className="relative w-full h-32 sm:h-40 rounded-2xl overflow-hidden shadow-md shrink-0 border border-white/15">
                      <img src={slide.imageUrl} alt="Visual" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                      <div className="absolute bottom-2 left-3">
                        <span className="text-[10px] font-mono font-bold text-white bg-black/60 px-2 py-0.5 rounded">
                          0{slide.index + 1} / {totalSlides}
                        </span>
                      </div>
                    </div>
                  )}

                  <div
                    className={`p-4 sm:p-5 rounded-2xl border space-y-2.5 shadow-xl flex-1 flex flex-col justify-center ${
                      isLight ? 'bg-white border-slate-200 shadow-md' : 'bg-slate-900/80 border-white/10 backdrop-blur-md'
                    }`}
                  >
                    <h2
                      className={`font-black text-base sm:text-lg tracking-tight leading-snug ${
                        style === 'EDITORIAL' || style === 'POLICY' ? 'font-serif' : 'font-sans'
                      }`}
                      style={{ color: textPrimary }}
                    >
                      {cleanTakeaway}
                    </h2>

                    {slide.supportingText && (
                      <p className="text-xs sm:text-sm font-medium leading-relaxed" style={{ color: textSecondary }}>
                        {slide.supportingText}
                      </p>
                    )}

                    <div className="pt-1.5 flex items-center justify-between text-[10px] font-mono font-bold" style={{ color: textMuted }}>
                      <span>GESER KE SLIDE BERIKUTNYA</span>
                      <span>➔</span>
                    </div>
                  </div>
                </div>
              )}

              {/* VARIAN 5: QUOTE_CARD */}
              {activeVariant === 'QUOTE_CARD' && (
                <div className="relative z-10 flex-1 flex flex-col justify-center p-5 sm:p-7 space-y-4 overflow-hidden">
                  <div
                    className={`p-6 rounded-3xl border shadow-xl relative overflow-hidden space-y-3.5 ${
                      isLight
                        ? 'bg-gradient-to-br from-white via-slate-50 to-slate-100 border-slate-200 shadow-md'
                        : 'bg-gradient-to-br from-slate-900/95 to-slate-950/95 border-white/15'
                    }`}
                  >
                    <Quote className="absolute -bottom-4 -right-4 size-28 opacity-10 pointer-events-none" style={{ color: accent }} />

                    <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider" style={{ color: accent }}>
                      <Lightbulb className="size-3.5" />
                      <span>{slide.tag || 'WAWASAN & INSIGHT KUNCI'}</span>
                    </div>

                    <div
                      className={`text-sm sm:text-base italic leading-relaxed font-serif font-semibold pl-3 border-l-4`}
                      style={{
                        borderColor: accent,
                        color: textPrimary,
                      }}
                    >
                      "{slide.sourceQuote ? slide.sourceQuote.replace(/^["']|["']$/g, '') : cleanTakeaway}"
                    </div>

                    {slide.supportingText && (
                      <p className="text-xs font-medium leading-relaxed pt-1" style={{ color: textSecondary }}>
                        {slide.supportingText}
                      </p>
                    )}

                    <div className="pt-2 flex items-center justify-between text-[10px] font-mono font-bold" style={{ color: textMuted }}>
                      <span>— {slide.author || brandName}</span>
                      <span>#INSIGHT</span>
                    </div>
                  </div>
                </div>
              )}

              {/* VARIAN 6: SPLIT_TWO_COL */}
              {activeVariant === 'SPLIT_TWO_COL' && (
                <div className="relative z-10 flex-1 flex flex-col justify-center p-4 sm:p-6 space-y-3 overflow-hidden">
                  {/* Card 1: Main Takeaway */}
                  <div
                    className={`p-4 rounded-2xl border space-y-1.5 shadow-md ${
                      isLight ? 'bg-white border-slate-200' : 'bg-slate-900/70 border-white/10'
                    }`}
                  >
                    <span className="text-[9px] font-black uppercase tracking-wider block" style={{ color: accent }}>
                      {slide.tag || `POIN UTAMA #0${slide.index + 1}`}
                    </span>
                    <h3 className="font-bold text-sm sm:text-base tracking-tight leading-snug" style={{ color: textPrimary }}>
                      {cleanTakeaway}
                    </h3>
                  </div>

                  {/* Card 2: Explanation */}
                  <div
                    className={`p-4 rounded-2xl border space-y-1.5 shadow-md ${
                      isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/80 border-white/10'
                    }`}
                  >
                    <span className="text-[9px] font-black uppercase tracking-wider block" style={{ color: accent }}>
                      {slide.statHighlight ? `SOROTAN: ${slide.statHighlight}` : 'PENJELASAN & DETAIL'}
                    </span>
                    <p className="text-xs sm:text-sm font-medium leading-relaxed" style={{ color: textSecondary }}>
                      {slide.supportingText || 'Memberikan dampak nyata dan pemahaman mendalam bagi audiens.'}
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* ─── E. SLIDE 5: OUTRO / SUMMARY & CALL TO ACTION ─── */}
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
              {cleanTakeaway || (
                style === 'SHOPEE_PROMO' || style === 'RACUN_SHOPEE' || style === 'PRODUCT_CATALOG' || style === 'BRUTALIST_SALE'
                  ? 'Promo Terbatas — Pesan Sekarang!'
                  : style === 'TWITTER_THREAD'
                  ? 'Utas Selesai / Thread End'
                  : style === 'STEP_BY_STEP_GUIDE'
                  ? 'Panduan Selesai!'
                  : 'Rangkuman & Wawasan'
              )}
            </h2>
            <p
              className="text-xs sm:text-sm font-medium leading-relaxed"
              style={{ color: textSecondary }}
            >
              {slide.supportingText || (
                style === 'SHOPEE_PROMO' || style === 'RACUN_SHOPEE' || style === 'PRODUCT_CATALOG' || style === 'BRUTALIST_SALE'
                  ? 'Klaim voucher diskon spesial dan gratis ongkir sebelum stok habis!'
                  : style === 'TWITTER_THREAD'
                  ? 'Suka dengan utas ini? Follow akun dan bagikan retweet ke teman-temanmu!'
                  : style === 'STEP_BY_STEP_GUIDE'
                  ? 'Simpan panduan praktis ini agar mudah dilihat saat mempraktikkannya!'
                  : 'Semoga ringkasan informasi ini bermanfaat untuk wawasan dan strategi Anda.'
              )}
            </p>
          </div>

          {/* Social Action Grid */}
          <div className="w-full max-w-xs grid grid-cols-2 gap-2 pt-2 text-[10px] font-bold">
            <div
              className={`rounded-xl p-2.5 flex items-center justify-center gap-1.5 border shadow-sm ${
                isLight ? 'bg-white border-slate-200 text-slate-900 font-bold' : 'bg-white/5 border-white/10 text-slate-100'
              }`}
            >
              {style === 'SHOPEE_PROMO' || style === 'RACUN_SHOPEE' || style === 'PRODUCT_CATALOG' || style === 'BRUTALIST_SALE' ? (
                <span>🛒 Checkout Sekarang</span>
              ) : style === 'TWITTER_THREAD' ? (
                <span>🔁 Retweet Utas</span>
              ) : style === 'STEP_BY_STEP_GUIDE' ? (
                <span>📌 Simpan Panduan</span>
              ) : (
                <span>📌 Simpan Postingan</span>
              )}
            </div>
            <div
              className={`rounded-xl p-2.5 flex items-center justify-center gap-1.5 border shadow-sm ${
                isLight ? 'bg-white border-slate-200 text-slate-900 font-bold' : 'bg-white/5 border-white/10 text-slate-100'
              }`}
            >
              {style === 'SHOPEE_PROMO' || style === 'RACUN_SHOPEE' || style === 'PRODUCT_CATALOG' || style === 'BRUTALIST_SALE' ? (
                <span>🎟️ Klaim Voucher</span>
              ) : style === 'TWITTER_THREAD' ? (
                <span>🔔 Follow Akun</span>
              ) : style === 'STEP_BY_STEP_GUIDE' ? (
                <span>🚀 Bagikan ke Teman</span>
              ) : (
                <span>🚀 Bagikan ke Tim</span>
              )}
            </div>
          </div>

          {/* CTA Button Badge */}
          <div
            className="w-full max-w-xs py-3 px-4 rounded-2xl font-black text-xs shadow-xl flex items-center justify-center gap-2"
            style={{
              backgroundColor: accent,
              color: style === 'STREETWEAR' || style === 'MINIMAL' || style === 'BOLD' || style === 'BRUTALIST_SALE' ? '#000000' : '#FFFFFF',
            }}
          >
            {style === 'SHOPEE_PROMO' ? (
              <>
                <ShoppingBag className="size-3.5" />
                <span>{slide.ctaText || 'Beli Sekarang di Shopee / Link Bio'}</span>
              </>
            ) : style === 'RACUN_SHOPEE' ? (
              <>
                <Sparkles className="size-3.5" />
                <span>{slide.ctaText || 'Komentar "MAU" / Cek Link di Bio'}</span>
              </>
            ) : style === 'PRODUCT_CATALOG' ? (
              <>
                <Award className="size-3.5" />
                <span>{slide.ctaText || 'Dapatkan Koleksi Eksklusif di Toko'}</span>
              </>
            ) : style === 'TESTIMONIAL_CHAT' ? (
              <>
                <MessageSquare className="size-3.5" />
                <span>{slide.ctaText || 'Pesan Langsung via WhatsApp'}</span>
              </>
            ) : style === 'TWITTER_THREAD' ? (
              <>
                <Repeat className="size-3.5" />
                <span>{slide.ctaText || 'Follow Akun untuk Thread Menarik'}</span>
              </>
            ) : style === 'EVENT_WEBINAR' ? (
              <>
                <Ticket className="size-3.5" />
                <span>{slide.ctaText || 'Amankan Slot / Tiket Sekarang'}</span>
              </>
            ) : (
              <>
                <span>{slide.ctaText || 'Ikuti untuk analisis harian'}</span>
                <ArrowRight className="size-3.5" />
              </>
            )}
          </div>
        </div>
      )}

      {/* ─── 4. FOOTER BAR ─── */}
      <div
        className={`relative z-20 px-5 sm:px-6 py-3 flex items-center justify-between text-[10px] font-semibold shrink-0 ${
          isLight ? 'border-t border-slate-200 bg-white/40' : 'border-t border-white/10'
        }`}
      >
        <div className="flex items-center gap-1.5 min-w-0">
          {logoUrl && (
            <img src={logoUrl} alt="Brand Logo" className="size-4 object-contain shrink-0 rounded-sm" />
          )}
          <span className="font-bold tracking-wide truncate" style={{ color: textMuted }}>
            {handle}
          </span>
        </div>

        {!hideNewslyWatermark && (
          <span className="uppercase tracking-widest text-[9px] font-bold shrink-0 ml-2" style={{ color: textMuted }}>
            {slide.source || 'Newsly AI'}
          </span>
        )}
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
