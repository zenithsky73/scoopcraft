'use client';

import * as React from 'react';
import {
  Layers,
  Check,
  Lock,
  Search,
  Sparkles,
  SlidersHorizontal,
  ChevronDown,
  X,
  Eye,
  LayoutGrid,
  ArrowRight,
} from 'lucide-react';
import type { DesignStyle, OutputFormat } from '@prisma/client';
import { STYLES, isProStyle, type StyleDef } from '@/config/styles';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export interface VisualTemplatePickerProps {
  selectedStyle: DesignStyle;
  onSelectStyle: (styleId: DesignStyle) => void;
  selectedFormat: OutputFormat;
  onSelectFormat: (format: OutputFormat) => void;
  isProUser?: boolean;
  onRequireUpgrade?: (style: StyleDef) => void;
}

type CategoryFilter = 'ALL' | 'MINIMALIST' | 'BOLD' | 'DARK_MODE' | 'EDITORIAL' | 'SOCIAL';

const CATEGORIES: { id: CategoryFilter; label: string; icon: string; count: number }[] = [
  { id: 'ALL', label: 'Semua Gaya', icon: '🌟', count: 32 },
  { id: 'MINIMALIST', label: 'Minimalist & Clean', icon: '✨', count: 8 },
  { id: 'BOLD', label: 'Bold & High Contrast', icon: '⚡', count: 7 },
  { id: 'DARK_MODE', label: 'Dark Mode & Sleek', icon: '🌙', count: 6 },
  { id: 'EDITORIAL', label: 'Editorial & Classic', icon: '📰', count: 6 },
  { id: 'SOCIAL', label: 'Social & Interactive', icon: '💬', count: 5 },
];

const POPULAR_STYLE_IDS: DesignStyle[] = [
  'MODERN',
  'BREAKING_NEWS',
  'SHOPEE_PROMO',
  'TWITTER_THREAD',
  'MINIMAL',
  'CORPORATE',
  'TERMINAL',
  'BEFORE_AFTER',
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
  const [isMobileModalOpen, setIsMobileModalOpen] = React.useState(false);
  const [mobileViewMode, setMobileViewMode] = React.useState<'compact' | 'expanded'>('compact');

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
      if (activeCategory !== 'ALL' && style.category !== activeCategory) {
        return false;
      }

      return true;
    });
  }, [activeCategory, searchQuery]);

  const handleSelect = (style: StyleDef) => {
    const isLocked = isProStyle(style.id) && !isProUser;
    if (isLocked) {
      onRequireUpgrade?.(style);
      return;
    }
    onSelectStyle(style.id);
    setIsMobileModalOpen(false);
  };

  // Helper render for single mini card preview
  const renderTemplateCard = (style: StyleDef, isSelected: boolean, isLocked: boolean, isSmall = false) => (
    <div
      key={style.id}
      onClick={() => handleSelect(style)}
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
        className={cn(
          'relative aspect-[4/4.8] w-full rounded-xl overflow-hidden p-2 sm:p-2.5 flex flex-col justify-between shadow-md transition-transform group-hover:scale-[1.01]',
          isSmall && 'p-2'
        )}
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
        <div className="relative z-10 flex items-center justify-between text-[7px] sm:text-[8px] font-bold opacity-80">
          <span
            className="px-1.5 py-0.2 rounded font-mono uppercase truncate max-w-[65%]"
            style={{ backgroundColor: `${style.accentColor}25`, color: style.isLight ? '#0f172a' : '#ffffff' }}
          >
            {style.instagramRef || '@instadeck'}
          </span>
          <span className="font-mono text-[7px] sm:text-[8px]">01/05</span>
        </div>

        {/* Center Checkmark Overlay if Selected */}
        {isSelected && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-primary/30 backdrop-blur-[1px]">
            <div className="size-7 sm:size-8 rounded-full bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/50 animate-scale-in">
              <Check className="size-3.5 sm:size-4 stroke-[3.5]" />
            </div>
          </div>
        )}

        {/* Center Lock Badge if PRO */}
        {isLocked && !isSelected && (
          <div className="absolute top-1.5 right-1.5 z-10">
            <span className="inline-flex items-center gap-0.5 text-[7px] sm:text-[8px] font-black px-1.5 py-0.5 rounded-full bg-amber-500 text-slate-950 shadow-md">
              <Lock className="size-2" /> PRO
            </span>
          </div>
        )}

        {/* Mockup Body Content */}
        <div className="relative z-10 space-y-0.5 sm:space-y-1 my-auto">
          {/* Category Pill */}
          <span
            className="inline-block px-1.5 py-0.5 rounded text-[6px] sm:text-[7px] font-black uppercase tracking-wider"
            style={{
              backgroundColor: style.accentColor,
              color: '#FFFFFF',
            }}
          >
            {style.category || 'LAYOUT'}
          </span>

          {/* Mockup Headline Box */}
          <div
            className={cn(
              'p-1 sm:p-1.5 rounded-lg text-[8px] sm:text-[9px] font-black leading-tight truncate shadow-sm',
              style.isLight
                ? 'bg-white/90 text-slate-900 border border-slate-200'
                : 'bg-slate-900/90 text-white border border-white/10'
            )}
          >
            {style.label.slice(0, 16)}
          </div>
        </div>

        {/* Mockup Footer Line */}
        <div className="relative z-10 pt-0.5 sm:pt-1 border-t border-white/10 flex items-center justify-between text-[6px] sm:text-[7px] opacity-75 font-mono">
          <span className="truncate max-w-[60%]">HEADLINE</span>
          <span className="shrink-0">GESER ➔</span>
        </div>
      </div>

      {/* Card Label & Reference Tag Below Preview */}
      <div className="pt-1.5 px-0.5 pb-0.5 space-y-0.5">
        <p className="font-bold text-[11px] sm:text-xs text-slate-900 dark:text-white truncate">
          {style.label}
        </p>
        <div className="flex items-center justify-between text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400 truncate font-medium">
          <span className="text-primary font-bold">{style.platformBadge || '⚡ Layout'}</span>
          <span className="truncate max-w-[50%]">{style.subLabel || 'Universal'}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800/90 bg-white/95 dark:bg-slate-900/90 p-3.5 sm:p-7 shadow-xl backdrop-blur-2xl space-y-4 sm:space-y-5">
      {/* ─── 1. SECTION HEADER ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 sm:pb-4 border-b border-slate-200 dark:border-slate-800/80">
        <div className="flex items-start gap-2.5 sm:gap-3 min-w-0">
          <div className="size-7 sm:size-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-md shadow-indigo-600/30">
            2
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <h2 className="text-sm sm:text-lg font-black tracking-tight text-slate-900 dark:text-white">
                Pilihan Template Desain Visual
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold bg-primary/10 dark:bg-primary/20 text-primary border border-primary/20 dark:border-primary/30 shrink-0">
                {selectedDef.label}
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1 sm:line-clamp-none">
              Template tata letak universal untuk segala jenis materi konten Anda.
            </p>
          </div>
        </div>

        {/* Format Switcher (4:5 Feed vs 9:16 Story) */}
        <div className="flex items-center gap-1 self-start sm:self-auto bg-slate-100 dark:bg-slate-950 p-1 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-inner shrink-0">
          <button
            type="button"
            onClick={() => onSelectFormat('FEED_PORTRAIT')}
            className={cn(
              'px-2.5 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all flex items-center gap-1 sm:gap-1.5',
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
              'px-2.5 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all flex items-center gap-1 sm:gap-1.5',
              selectedFormat === 'STORY'
                ? 'bg-primary text-white shadow-md shadow-primary/25'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            )}
          >
            <span>📱 9:16 Story</span>
          </button>
        </div>
      </div>

      {/* ─── MOBILE VIEW (< md): COMPACT HERO CARD + QUICK HORIZONTAL SWIPER + MODAL ─── */}
      <div className="block md:hidden space-y-3.5">
        {/* Active Selected Card Preview Box */}
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/90 dark:border-slate-800 flex items-center justify-between gap-3 shadow-inner">
          <div className="flex items-center gap-3 min-w-0">
            {/* Tiny Mockup Square */}
            <div
              className="size-14 rounded-xl border flex flex-col justify-between p-1 shadow-sm shrink-0"
              style={{ backgroundColor: selectedDef.bgColor, color: selectedDef.textColor }}
            >
              <div className="flex justify-between text-[6px] font-bold opacity-80 font-mono">
                <span>01</span>
                <span>4:5</span>
              </div>
              <div
                className="text-[7px] font-black truncate px-1 py-0.5 rounded text-center"
                style={{ backgroundColor: `${selectedDef.accentColor}30` }}
              >
                {selectedDef.label.slice(0, 10)}
              </div>
              <div className="text-[5px] text-right font-mono opacity-70">➔</div>
            </div>

            {/* Label & Details */}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-slate-900 dark:text-white truncate">
                  {selectedDef.label}
                </span>
                {isProStyle(selectedDef.id) ? (
                  <span className="px-1.5 py-0.2 rounded text-[8px] font-black uppercase bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 shrink-0">
                    PRO
                  </span>
                ) : (
                  <span className="px-1.5 py-0.2 rounded text-[8px] font-black uppercase bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shrink-0">
                    GRATIS
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                {selectedDef.subLabel || 'Universal Layout'} • {selectedDef.category}
              </p>
            </div>
          </div>

          {/* Trigger Button: Open 32-Template Catalog Modal */}
          <Button
            type="button"
            size="sm"
            onClick={() => setIsMobileModalOpen(true)}
            className="h-9 px-3 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs shrink-0 shadow-md shadow-primary/20 flex items-center gap-1.5"
          >
            <SlidersHorizontal className="size-3.5" />
            <span>Ganti</span>
            <span className="text-[10px] opacity-80">(32)</span>
          </Button>
        </div>

        {/* Quick-Pick Horizontal Swiper Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] px-0.5 font-bold text-slate-600 dark:text-slate-400">
            <span>⚡ Pilihan Cepat Populer:</span>
            <button
              type="button"
              onClick={() => setIsMobileModalOpen(true)}
              className="text-primary hover:underline text-[10px] font-semibold flex items-center gap-0.5"
            >
              Lihat 32 Desain <ArrowRight className="size-2.5" />
            </button>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 -mx-1 px-1">
            {POPULAR_STYLE_IDS.map((styleId) => {
              const style = STYLES.find((s) => s.id === styleId);
              if (!style) return null;
              const isSelected = selectedStyle === style.id;
              const isLocked = isProStyle(style.id) && !isProUser;

              return (
                <button
                  key={style.id}
                  type="button"
                  onClick={() => handleSelect(style)}
                  className={cn(
                    'shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all border shadow-sm',
                    isSelected
                      ? 'bg-primary text-white border-primary shadow-primary/20 ring-2 ring-primary/40'
                      : isLocked
                      ? 'bg-slate-100/70 dark:bg-slate-950/70 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                      : 'bg-white dark:bg-slate-950/80 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-400'
                  )}
                >
                  <span
                    className="size-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: style.accentColor }}
                  />
                  <span className="truncate max-w-[110px]">{style.label}</span>
                  {isSelected && <Check className="size-3 stroke-[3]" />}
                  {isLocked && !isSelected && <Lock className="size-2.5 text-amber-500" />}
                </button>
              );
            })}

            {/* "+24 Lainnya" Pill */}
            <button
              type="button"
              onClick={() => setIsMobileModalOpen(true)}
              className="shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 text-primary hover:bg-primary/10 transition-all flex items-center gap-1"
            >
              <Sparkles className="size-3" />
              <span>+24 Lainnya...</span>
            </button>
          </div>
        </div>

        {/* Optional Toggle to Expand Full 32 Cards Grid on Mobile */}
        <div className="pt-1 text-center">
          <button
            type="button"
            onClick={() => setMobileViewMode((prev) => (prev === 'compact' ? 'expanded' : 'compact'))}
            className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 inline-flex items-center gap-1 py-1"
          >
            <LayoutGrid className="size-3" />
            <span>{mobileViewMode === 'compact' ? 'Buka Grid Semua 32 Template Langsung' : 'Sembunyikan Grid (Gunakan Mode Ringkas)'}</span>
          </button>
        </div>

        {/* Expanded Grid on Mobile (Only if user chooses to expand) */}
        {mobileViewMode === 'expanded' && (
          <div className="grid grid-cols-2 gap-2 pt-2 animate-in fade-in duration-200">
            {filteredStyles.map((style) => {
              const isSelected = selectedStyle === style.id;
              const isLocked = isProStyle(style.id) && !isProUser;
              return renderTemplateCard(style, isSelected, isLocked, true);
            })}
          </div>
        )}
      </div>

      {/* ─── DESKTOP VIEW (>= md): CATEGORY PILLS, LIVE SEARCH & 5-COL GRID ─── */}
      <div className="hidden md:block space-y-4">
        {/* Category Pills & Live Search Bar */}
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
          <div className="relative w-56 shrink-0">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari gaya layout..."
              className="w-full h-9 pl-9 pr-3 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        {/* 5-Column Grid on Desktop */}
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
          {filteredStyles.map((style) => {
            const isSelected = selectedStyle === style.id;
            const isLocked = isProStyle(style.id) && !isProUser;
            return renderTemplateCard(style, isSelected, isLocked, false);
          })}
        </div>
      </div>

      {/* ─── 4. FULL TEMPLATES CATALOG MODAL (32 DESIGNS) ─── */}
      {isMobileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 border-t sm:border border-slate-200 dark:border-slate-800 rounded-t-3xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col max-h-[90vh] sm:max-h-[85vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="size-8 sm:size-9 rounded-xl bg-primary/10 dark:bg-primary/20 text-primary flex items-center justify-center shrink-0">
                  <Layers className="size-4 sm:size-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white truncate">
                      Pilih Dari 32 Template Visual
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-primary/10 text-primary border border-primary/20 shrink-0">
                      32 Pilihan
                    </span>
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    Tap untuk memilih template yang sesuai dengan branding Anda
                  </p>
                </div>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsMobileModalOpen(false)}
                className="size-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors shrink-0"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Modal Search Bar & Category Filters */}
            <div className="py-3 space-y-2.5 border-b border-slate-100 dark:border-slate-800/80">
              {/* Search Bar */}
              <div className="relative w-full">
                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari gaya: Shopee, Minimal, News, Dark..."
                  className="w-full h-9 pl-9 pr-3 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Category Pills Strip */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 -mx-1 px-1">
                {CATEGORIES.map((cat) => {
                  const isActive = activeCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setActiveCategory(cat.id)}
                      className={cn(
                        'shrink-0 px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1',
                        isActive
                          ? 'bg-primary text-white shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                      )}
                    >
                      <span>{cat.icon}</span>
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Modal Scrollable 2/3-Column Cards Grid */}
            <div className="flex-1 overflow-y-auto py-3 pr-1">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-3">
                {filteredStyles.map((style) => {
                  const isSelected = selectedStyle === style.id;
                  const isLocked = isProStyle(style.id) && !isProUser;
                  return renderTemplateCard(style, isSelected, isLocked, true);
                })}
              </div>
            </div>

            {/* Modal Bottom Footer Action */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
              <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 truncate">
                Terpilih: <strong className="text-primary">{selectedDef.label}</strong> ({selectedFormat === 'FEED_PORTRAIT' ? '4:5 Feed' : '9:16 Story'})
              </div>
              <Button
                type="button"
                size="sm"
                onClick={() => setIsMobileModalOpen(false)}
                className="bg-primary hover:bg-primary/90 text-white text-xs font-bold rounded-xl px-4 shrink-0"
              >
                Gunakan Template Ini
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
