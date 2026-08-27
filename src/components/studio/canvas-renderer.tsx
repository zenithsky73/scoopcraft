'use client';

import * as React from 'react';
import type { DesignStyle, OutputFormat } from '@prisma/client';
import type { SlideCopy } from '@/server/ai/schemas';
import { STYLES } from '@/config/styles';

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
  className?: string;
};

export function CanvasRenderer({
  slide,
  style,
  format = 'FEED_PORTRAIT',
  handle = '@scoopcraft.id',
  brandName = 'Scoopcraft Media',
  totalSlides = 5,
  scale = 1,
  className = '',
}: CanvasRendererProps) {
  const styleDef = STYLES.find((s) => s.id === style) || STYLES[0];
  const accent = styleDef.accentColor;

  // Aspect ratio dimensions based on standard Instagram sizes
  const aspectClass =
    format === 'FEED_PORTRAIT'
      ? 'aspect-[4/5] max-w-[480px]'
      : format === 'STORY'
      ? 'aspect-[9/16] max-w-[400px]'
      : 'aspect-square max-w-[480px]';

  const isCover = slide.type === 'COVER' || slide.index === 0;
  const isOutro = slide.type === 'OUTRO' || slide.index === totalSlides - 1;

  // Render Theme Styles
  return (
    <div
      id={`slide-canvas-${slide.index}`}
      className={`relative w-full overflow-hidden rounded-2xl shadow-2xl flex flex-col justify-between select-none transition-all duration-300 font-sans ${aspectClass} ${className}`}
      style={{
        backgroundColor: styleDef.bgColor,
        color: styleDef.textColor,
        transform: scale !== 1 ? `scale(${scale})` : undefined,
        transformOrigin: 'top center',
      }}
    >
      {/* Background Image / Overlay */}
      {slide.imageUrl && isCover && (
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img
            src={slide.imageUrl}
            alt="Visual"
            className="w-full h-full object-cover opacity-35 filter contrast-125 brightness-90"
          />
          <div
            className="absolute inset-0 bg-gradient-to-t"
            style={{
              backgroundImage: `linear-gradient(to top, ${styleDef.bgColor} 20%, transparent 80%, ${styleDef.bgColor} 95%)`,
            }}
          />
        </div>
      )}

      {/* Decorative Grid / Accent Elements for Tech / Finance / Bold */}
      {style === 'TECH' && (
        <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#1f293715_1px,transparent_1px),linear-gradient(to_bottom,#1f293715_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
      )}
      {style === 'FINANCE' && (
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      )}
      {style === 'BREAKING_NEWS' && (
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-red-600 z-20" />
      )}

      {/* Header Bar */}
      <div className="relative z-10 p-6 pb-2 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-2">
          {/* Style Category Badge */}
          <span
            className="px-2.5 py-1 text-xs font-black tracking-wider uppercase rounded-md shadow-sm"
            style={{
              backgroundColor: accent,
              color: style === 'LIFESTYLE' ? '#FFFFFF' : '#FFFFFF',
            }}
          >
            {slide.tag || (isCover ? 'HEADLINE' : isOutro ? 'PENUTUP' : `POIN ${slide.pointNumber || slide.index}`)}
          </span>
          <span className="text-xs font-semibold tracking-wide opacity-80 uppercase">
            {brandName}
          </span>
        </div>

        {/* Slide Counter Indicator */}
        <div className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-white/10 backdrop-blur-md opacity-80">
          {slide.index + 1} / {totalSlides}
        </div>
      </div>

      {/* Main Slide Content */}
      <div className="relative z-10 px-7 py-4 flex-1 flex flex-col justify-center gap-4">
        {/* Cover Slide */}
        {isCover && (
          <>
            <div className="space-y-3">
              <h1
                className={`font-black tracking-tight leading-tight ${
                  style === 'EDITORIAL'
                    ? 'font-serif text-3xl sm:text-4xl'
                    : style === 'BOLD'
                    ? 'italic font-black text-3xl sm:text-4xl uppercase'
                    : 'text-2xl sm:text-3xl'
                }`}
                style={{ color: style === 'LIFESTYLE' ? '#831843' : '#FFFFFF' }}
              >
                {slide.headline || 'Headline Utama Berita'}
              </h1>
              {slide.lead && (
                <p className="text-sm sm:text-base leading-relaxed opacity-90 font-medium">
                  {slide.lead}
                </p>
              )}
            </div>

            {/* Swipe Callout Indicator */}
            <div className="pt-2 flex items-center gap-2 text-xs font-bold tracking-wider uppercase opacity-75">
              <span className="w-6 h-0.5" style={{ backgroundColor: accent }} />
              Geser untuk info lengkap ➔
            </div>
          </>
        )}

        {/* Content Point Slide */}
        {!isCover && !isOutro && (
          <div className="space-y-4">
            <div className="flex items-baseline gap-3">
              <span
                className="text-4xl font-black italic tracking-tighter"
                style={{ color: accent }}
              >
                0{slide.pointNumber || slide.index}
              </span>
              <h2
                className={`font-bold leading-snug ${
                  style === 'EDITORIAL' ? 'font-serif text-2xl' : 'text-xl sm:text-2xl'
                }`}
                style={{ color: style === 'LIFESTYLE' ? '#831843' : '#FFFFFF' }}
              >
                {slide.takeaway || 'Inti Poin Informasi'}
              </h2>
            </div>

            {slide.supportingText && (
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <p className="text-sm sm:text-base leading-relaxed opacity-90">
                  {slide.supportingText}
                </p>
              </div>
            )}

            {slide.sourceQuote && (
              <blockquote className="border-l-4 pl-3 py-1 italic text-xs sm:text-sm opacity-80 border-amber-400">
                &ldquo;{slide.sourceQuote}&rdquo;
              </blockquote>
            )}
          </div>
        )}

        {/* Outro Slide */}
        {isOutro && (
          <div className="text-center space-y-5 py-4">
            <div
              className="inline-flex p-3 rounded-full bg-white/10 mx-auto"
              style={{ color: accent }}
            >
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black tracking-tight" style={{ color: accent }}>
                {slide.ctaText || 'Bagikan Informasi Ini!'}
              </h2>
              <p className="text-sm opacity-85 max-w-xs mx-auto">
                {slide.secondaryCta || 'Follow kami untuk update berita & analisis harian terpercaya.'}
              </p>
            </div>

            <div className="inline-block px-4 py-2 rounded-xl bg-white/10 font-mono font-bold text-sm">
              {handle}
            </div>
          </div>
        )}
      </div>

      {/* Footer Bar */}
      <div className="relative z-10 px-6 py-4 flex items-center justify-between border-t border-white/10 text-xs opacity-75 font-medium">
        <div className="flex items-center gap-1.5">
          <span className="font-semibold">{handle}</span>
        </div>
        <div className="flex items-center gap-2">
          <span>{slide.source || 'Sumber: Detik/Kompas'}</span>
        </div>
      </div>
    </div>
  );
}
