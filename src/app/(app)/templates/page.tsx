'use client';

import * as React from 'react';
import Link from 'next/link';
import { Palette, Sparkles, ArrowRight, Layers, Lock, Crown, Check, Filter } from 'lucide-react';
import { STYLES, isProStyle, type StyleDef } from '@/config/styles';
import { Button } from '@/components/ui/button';
import { TemplatePreviewModal } from '@/components/generate/template-preview-modal';

type CategoryFilter = 'ALL' | 'FREE' | 'PRO' | 'NEWS' | 'BIZ' | 'MODERN';

const CATEGORIES: { id: CategoryFilter; label: string; count: number }[] = [
  { id: 'ALL', label: '⭐ Semua', count: 20 },
  { id: 'FREE', label: '🆓 Gratis', count: 5 },
  { id: 'PRO', label: '👑 PRO Exclusive', count: 15 },
  { id: 'NEWS', label: '📰 Media Berita', count: 6 },
  { id: 'BIZ', label: '💼 Finansial & Bisnis', count: 5 },
  { id: 'MODERN', label: '⚡ Tech & Gen-Z', count: 9 },
];

export default function TemplatesPage() {
  const [activeCategory, setActiveCategory] = React.useState<CategoryFilter>('ALL');
  const [selectedPreviewStyle, setSelectedPreviewStyle] = React.useState<StyleDef | null>(null);

  const filteredStyles = React.useMemo(() => {
    return STYLES.filter((style) => {
      if (activeCategory === 'FREE') return style.tier === 'FREE';
      if (activeCategory === 'PRO') return style.tier === 'PRO';
      if (activeCategory === 'NEWS') {
        return ['EDITORIAL', 'BOLD', 'CORPORATE', 'POLICY', 'SPOTLIGHT', 'RED_COLLAGE'].includes(style.id);
      }
      if (activeCategory === 'BIZ') {
        return ['FINANCE', 'BLOOMBERG', 'CORPORATE', 'MINIMAL'].includes(style.id);
      }
      if (activeCategory === 'MODERN') {
        return ['STREETWEAR', 'ATHLETIC', 'TERMINAL', 'TECH', 'COSMIC', 'PODCAST', 'CULINARY', 'LIFESTYLE', 'MODERN'].includes(style.id);
      }
      return true;
    });
  }, [activeCategory]);

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16 px-1 sm:px-0">
      {/* ─── HEADER ─── */}
      <div className="text-center sm:text-left space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 dark:bg-primary/20 text-primary border border-primary/20 dark:border-primary/30 text-xs font-bold uppercase tracking-wider shadow-sm">
          <Palette className="size-3.5" /> 20 Preset Desain Media Indonesia
        </div>
        <h1 className="text-xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
          Katalog Gaya Visual Media Indonesia
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
          Eksplorasi 20 gaya visual carousel kelas dunia. Klik pada salah satu template untuk melihat preview 5-slide lengkap!
        </p>
      </div>

      {/* ─── HORIZONTAL SCROLLABLE CATEGORY PILLS (MOBILE OPTIMIZED) ─── */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 -mx-2 px-2 sm:mx-0 sm:px-0">
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`shrink-0 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm ${
                isActive
                  ? 'bg-primary text-white shadow-primary/25 shadow-md scale-[1.02]'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* ─── COMPACT RESPONSIVE GRID (2 COLS ON MOBILE, 3 ON DESKTOP) ─── */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-6">
        {filteredStyles.map((style) => {
          const isPro = style.tier === 'PRO';

          return (
            <div
              key={style.id}
              onClick={() => setSelectedPreviewStyle(style)}
              className="flex flex-col justify-between rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800/90 bg-white dark:bg-slate-900/70 p-3 sm:p-6 shadow-sm hover:shadow-xl hover:border-primary/50 dark:hover:border-primary/50 transition-all cursor-pointer group select-none"
            >
              <div className="space-y-2 sm:space-y-3">
                {/* Header Badge */}
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
                    <span
                      className="size-3 sm:size-4 rounded-full shadow-sm shrink-0"
                      style={{ backgroundColor: style.accentColor }}
                    />
                    <h2 className="font-black text-xs sm:text-base text-slate-900 dark:text-white truncate">
                      {style.label}
                    </h2>
                  </div>

                  {isPro ? (
                    <span className="inline-flex items-center gap-0.5 text-[9px] sm:text-[10px] font-black px-1.5 sm:px-2 py-0.5 rounded-full bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/30 shrink-0">
                      <Lock className="size-2 sm:size-2.5" /> PRO
                    </span>
                  ) : (
                    <span className="text-[9px] sm:text-[10px] font-black px-1.5 sm:px-2 py-0.5 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30 shrink-0">
                      GRATIS
                    </span>
                  )}
                </div>

                {/* Sub-label */}
                <p className="text-[10px] sm:text-xs font-semibold text-primary truncate">
                  {style.subLabel || '@media.id'}
                </p>

                {/* Visual Card Mockup Snippet */}
                <div
                  className="p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border text-xs space-y-1.5 select-none shadow-sm transition-transform group-hover:scale-[1.02]"
                  style={{
                    backgroundColor: style.bgColor,
                    color: style.textColor,
                    borderColor: 'rgba(255,255,255,0.1)',
                  }}
                >
                  <div className="flex items-center justify-between border-b border-white/10 pb-1 text-[9px] opacity-75">
                    <span
                      className="px-1 py-0.2 rounded font-black text-[8px] sm:text-[9px] uppercase"
                      style={{ backgroundColor: style.accentColor, color: '#FFF' }}
                    >
                      SLIDE 1
                    </span>
                    <span className="font-mono text-[8px] sm:text-[10px]">1 / 5</span>
                  </div>

                  <p
                    className={`font-black text-xs sm:text-sm line-clamp-2 leading-tight ${
                      style.id === 'EDITORIAL' ? 'font-serif' : ''
                    }`}
                    style={{
                      color: style.isLight ? '#0F172A' : '#FFFFFF',
                    }}
                  >
                    {style.label}
                  </p>

                  <p className="text-[9px] sm:text-[11px] opacity-75 line-clamp-1 leading-tight" style={{ color: style.isLight ? '#475569' : '#CBD5E1' }}>
                    {style.description}
                  </p>
                </div>
              </div>

              {/* Action Preview Hint */}
              <div className="mt-2.5 sm:mt-4 pt-2 sm:pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 group-hover:text-primary transition-colors">
                <span className="flex items-center gap-1">
                  <Sparkles className="size-3 text-primary" /> Preview 5 Slide
                </span>
                <ArrowRight className="size-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>

      {/* ─── 5-SLIDE PREVIEW MODAL ─── */}
      <TemplatePreviewModal
        isOpen={!!selectedPreviewStyle}
        onClose={() => setSelectedPreviewStyle(null)}
        styleDef={selectedPreviewStyle}
        onSelectStyle={() => {
          setSelectedPreviewStyle(null);
          window.location.href = '/dashboard';
        }}
      />
    </div>
  );
}
