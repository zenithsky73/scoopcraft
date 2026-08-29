'use client';

import * as React from 'react';
import { Layers, Check, Lock, Search, Sparkles, SlidersHorizontal, LayoutGrid } from 'lucide-react';
import type { DesignStyle, OutputFormat } from '@prisma/client';
import { STYLES, isProStyle, type StyleDef } from '@/config/styles';
import { cn } from '@/lib/utils';

export interface VisualTemplatePickerProps {
  selectedStyle: DesignStyle;
  onSelectStyle: (styleId: DesignStyle) => void;
  selectedFormat: OutputFormat;
  onSelectFormat: (format: OutputFormat) => void;
  isProUser?: boolean;
  onRequireUpgrade?: (style: StyleDef) => void;
}

type CategoryFilter = 'ALL' | 'BREAKING' | 'BIZ' | 'EDITORIAL' | 'URBAN';

const CATEGORIES: { id: CategoryFilter; label: string; icon: string; count: number }[] = [
  { id: 'ALL', label: 'Semua', icon: '🌟', count: 20 },
  { id: 'BREAKING', label: 'Breaking', icon: '⚡', count: 6 },
  { id: 'BIZ', label: 'Bisnis & Cuan', icon: '💼', count: 5 },
  { id: 'EDITORIAL', label: 'Editorial', icon: '📰', count: 4 },
  { id: 'URBAN', label: 'Urban & Pop', icon: '🎨', count: 5 },
];

export function VisualTemplatePicker({
  selectedStyle,
  onSelectStyle,
  selectedFormat,
  onSelectFormat,
  isProUser = false,
  onRequireUpgrade,
}: VisualTemplatePickerProps) {
  const [activeCategory, setActiveCategory] = React.useState<CategoryFilter>('ALL');
  const [searchQuery, setSearchQuery] = React.useState('');

  const selectedDef = React.useMemo(() => {
    return STYLES.find((s) => s.id === selectedStyle) || STYLES[0];
  }, [selectedStyle]);

  const filteredStyles = React.useMemo(() => {
    return STYLES.filter((style) => {
      // 1. Search Query Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchLabel = style.label.toLowerCase().includes(q);
        const matchSub = (style.subLabel || '').toLowerCase().includes(q);
        const matchDesc = style.description.toLowerCase().includes(q);
        if (!matchLabel && !matchSub && !matchDesc) return false;
      }

      // 2. Category Filter
      if (activeCategory === 'BREAKING') {
        return ['BREAKING_NEWS', 'BOLD', 'SPOTLIGHT', 'POLICY', 'RED_COLLAGE', 'PODCAST'].includes(style.id);
      }
      if (activeCategory === 'BIZ') {
        return ['FINANCE', 'BLOOMBERG', 'CORPORATE', 'TECH', 'MINIMAL'].includes(style.id);
      }
      if (activeCategory === 'EDITORIAL') {
        return ['EDITORIAL', 'MINIMAL', 'CORPORATE', 'POLICY'].includes(style.id);
      }
      if (activeCategory === 'URBAN') {
        return ['STREETWEAR', 'ATHLETIC', 'TERMINAL', 'COSMIC', 'CULINARY', 'LIFESTYLE', 'MODERN'].includes(style.id);
      }

      return true;
    });
  }, [activeCategory, searchQuery]);

  return (
    <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800/90 bg-white/95 dark:bg-slate-900/90 p-4 sm:p-7 shadow-xl backdrop-blur-2xl space-y-5">
      {/* ─── 1. SECTION HEADER ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800/80">
        <div className="flex items-start gap-3 min-w-0">
          <div className="size-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-md shadow-indigo-600/30">
            2
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white">
                Pilihan Template Desain Visual
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-primary/10 dark:bg-primary/20 text-primary border border-primary/20 dark:border-primary/30">
                {selectedDef.label}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Pilih sampul layout visual yang sesuai dengan nuansa konten Anda.
            </p>
          </div>
        </div>

        {/* Format Switcher (4:5 Feed vs 9:16 Story) */}
        <div className="flex items-center gap-1.5 self-start md:self-auto bg-slate-100 dark:bg-slate-950 p-1 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-inner">
          <button
            type="button"
            onClick={() => onSelectFormat('FEED_PORTRAIT')}
            className={cn(
              'px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5',
              selectedFormat === 'FEED_PORTRAIT'
                ? 'bg-primary text-white shadow-md shadow-primary/25'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            )}
          >
            <span>🖼️ 4:5 Feed</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectFormat('STORY')}
            className={cn(
              'px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5',
              selectedFormat === 'STORY'
                ? 'bg-primary text-white shadow-md shadow-primary/25'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            )}
          >
            <span>📱 9:16 Story</span>
          </button>
        </div>
      </div>

      {/* ─── 2. CATEGORY PILLS & LIVE SEARCH BAR ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Horizontal Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 -mx-1 px-1">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  'shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm',
                  isActive
                    ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-900 dark:text-amber-300 border border-amber-500/40 ring-1 ring-amber-500/30'
                    : 'bg-slate-100/80 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800'
                )}
              >
                <span>{cat.icon}</span>
                <span>{cat.label} ({cat.count})</span>
              </button>
            );
          })}
        </div>

        {/* Search Input Box */}
        <div className="relative w-full sm:w-56 shrink-0">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari template..."
            className="w-full h-9 pl-9 pr-3 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* ─── 3. 5-COLUMN COMPACT TEMPLATE CARDS GRID ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
        {filteredStyles.map((style, idx) => {
          const isSelected = selectedStyle === style.id;
          const isLocked = isProStyle(style.id) && !isProUser;

          return (
            <div
              key={style.id}
              onClick={() => {
                if (isLocked) {
                  onRequireUpgrade?.(style);
                  return;
                }
                onSelectStyle(style.id);
              }}
              className={cn(
                'group relative flex flex-col rounded-2xl cursor-pointer transition-all duration-200 select-none p-1.5 sm:p-2 border',
                isSelected
                  ? 'border-primary bg-primary/10 dark:bg-primary/15 ring-2 ring-primary/60 shadow-xl shadow-primary/20 scale-[1.02]'
                  : isLocked
                  ? 'border-slate-200 dark:border-slate-800/80 bg-slate-100/50 dark:bg-slate-950/40 opacity-85 hover:opacity-100 hover:border-amber-500/40'
                  : 'border-slate-200 dark:border-slate-800/80 bg-slate-50/80 dark:bg-slate-950/60 hover:border-slate-400 dark:hover:border-slate-700 shadow-sm'
              )}
            >
              {/* 4:5 Mini Card Mockup Preview */}
              <div
                className="relative aspect-[4/4.8] w-full rounded-xl overflow-hidden p-2.5 flex flex-col justify-between shadow-md transition-transform group-hover:scale-[1.01]"
                style={{
                  backgroundColor: style.bgColor,
                  color: style.textColor,
                }}
              >
                {/* Background Ambient Tint */}
                <div
                  className="absolute inset-0 opacity-15 pointer-events-none"
                  style={{
                    background: `radial-gradient(circle at top right, ${style.accentColor}, transparent 70%)`,
                  }}
                />

                {/* Mockup Top Header */}
                <div className="relative z-10 flex items-center justify-between text-[8px] font-bold opacity-80">
                  <span className="px-1.5 py-0.2 rounded font-mono uppercase truncate max-w-[65%]" style={{ backgroundColor: `${style.accentColor}25`, color: style.isLight ? '#0f172a' : '#ffffff' }}>
                    {style.instagramRef || '@kreator'}
                  </span>
                  <span className="font-mono text-[8px]">01/05</span>
                </div>

                {/* Center Checkmark Overlay if Selected */}
                {isSelected && (
                  <div className="absolute inset-0 z-20 flex items-center justify-center bg-primary/30 backdrop-blur-[1px]">
                    <div className="size-8 rounded-full bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/50 animate-scale-in">
                      <Check className="size-4 stroke-[3.5]" />
                    </div>
                  </div>
                )}

                {/* Center Lock Badge if PRO */}
                {isLocked && !isSelected && (
                  <div className="absolute top-2 right-2 z-10">
                    <span className="inline-flex items-center gap-0.5 text-[8px] font-black px-1.5 py-0.5 rounded-full bg-amber-500 text-slate-950 shadow-md">
                      <Lock className="size-2" /> PRO
                    </span>
                  </div>
                )}

                {/* Mockup Body Content */}
                <div className="relative z-10 space-y-1 my-auto">
                  {/* Category Pill */}
                  <span
                    className="inline-block px-1.5 py-0.5 rounded text-[7px] font-black uppercase tracking-wider"
                    style={{
                      backgroundColor: style.accentColor,
                      color: '#FFFFFF',
                    }}
                  >
                    {style.id === 'BREAKING_NEWS' ? 'BREAKING' : style.id.replace('_', ' ').slice(0, 10)}
                  </span>

                  {/* Mockup Headline Box */}
                  <div
                    className={cn(
                      'p-1.5 rounded-lg text-[9px] font-black leading-tight truncate shadow-sm',
                      style.isLight
                        ? 'bg-white/90 text-slate-900 border border-slate-200'
                        : 'bg-slate-900/90 text-white border border-white/10'
                    )}
                  >
                    {style.label.slice(0, 16)}
                  </div>
                </div>

                {/* Mockup Footer Line */}
                <div className="relative z-10 pt-1 border-t border-white/10 flex items-center justify-between text-[7px] opacity-75 font-mono">
                  <span>HEADLINE UTAMA</span>
                  <span>GESER ➔</span>
                </div>
              </div>

              {/* Card Label & Reference Tag Below Preview */}
              <div className="pt-2 px-1 pb-0.5 space-y-0.5">
                <p className="font-bold text-xs text-slate-900 dark:text-white truncate">
                  {style.label}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate flex items-center gap-1 font-medium">
                  <span className="text-primary font-bold">⚡ Ref {idx + 1}:</span>
                  <span>{style.subLabel?.replace(/^ala /, '') || style.instagramRef || 'Visual'}</span>
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
