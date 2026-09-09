'use client';

import * as React from 'react';
import {
  Sparkles,
  Check,
  Search,
  Palette,
  ChevronDown,
  ChevronUp,
  X,
  Info,
  Layers,
} from 'lucide-react';
import {
  AI_IMAGE_THEMES,
  getAIThemeDef,
  type AIImageThemeId,
  type AIImageThemeCategory,
  type AIImageThemeDef,
} from '@/config/ai-image-themes';
import { cn } from '@/lib/utils';

export interface AIVisualThemePickerProps {
  value: AIImageThemeId;
  onChange: (themeId: AIImageThemeId) => void;
  className?: string;
  compact?: boolean;
}

const CATEGORIES: { id: AIImageThemeCategory; label: string; icon: string }[] = [
  { id: 'ALL', label: 'Semua', icon: '🌟' },
  { id: '3D', label: '3D & Render', icon: '🧸' },
  { id: 'ILLUSTRATION', label: 'Ilustrasi & Anime', icon: '🎨' },
  { id: 'ARTISTIC', label: 'Artistik & Lukisan', icon: '🖌️' },
  { id: 'CRAFT', label: 'Craft & Tekstur', icon: '🧶' },
  { id: 'RETRO', label: 'Retro & Vintage', icon: '👾' },
  { id: 'MODERN', label: 'Modern & Lux', icon: '🔮' },
];

export function AIVisualThemePicker({
  value = 'AUTO',
  onChange,
  className,
  compact = false,
}: AIVisualThemePickerProps) {
  const [activeCategory, setActiveCategory] = React.useState<AIImageThemeCategory>('ALL');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isExpanded, setIsExpanded] = React.useState(false);

  const selectedTheme = React.useMemo(() => getAIThemeDef(value) || AI_IMAGE_THEMES[0], [value]);

  // Compute category counts dynamically
  const categoryCounts = React.useMemo(() => {
    const counts: Record<string, number> = { ALL: AI_IMAGE_THEMES.length };
    for (const t of AI_IMAGE_THEMES) {
      if (t.category !== 'ALL') {
        counts[t.category] = (counts[t.category] || 0) + 1;
      }
    }
    return counts;
  }, []);

  const filteredThemes = React.useMemo(() => {
    return AI_IMAGE_THEMES.filter((theme) => {
      // 1. Search Query Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchLabel = theme.label.toLowerCase().includes(q);
        const matchSub = (theme.subLabel || '').toLowerCase().includes(q);
        const matchDesc = theme.description.toLowerCase().includes(q);
        if (!matchLabel && !matchSub && !matchDesc) return false;
      }

      // 2. Category Filter
      if (activeCategory !== 'ALL' && theme.category !== activeCategory && theme.id !== 'AUTO') {
        return false;
      }

      return true;
    });
  }, [searchQuery, activeCategory]);

  // If search or category is active, automatically show all matching items
  const isFiltering = Boolean(searchQuery.trim() || activeCategory !== 'ALL');
  const displayedThemes = isFiltering || isExpanded ? filteredThemes : filteredThemes.slice(0, 8);

  return (
    <div className={cn('space-y-4 select-none', className)}>
      {/* ─── 1. SECTION HEADER ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-slate-200 dark:border-slate-800/80">
        <div className="flex items-start gap-2.5 min-w-0">
          <div className="size-8 rounded-full bg-gradient-to-tr from-amber-500 to-primary text-white font-black text-xs flex items-center justify-center shrink-0 shadow-md shadow-primary/25">
            <Palette className="size-4" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm sm:text-base font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>Tema Visual Gambar AI</span>
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-primary/10 dark:bg-primary/20 text-primary border border-primary/20">
                27 Art Styles
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Pilih gaya visual seni AI untuk gambar/ilustrasi di setiap slide carousel Anda.
            </p>
          </div>
        </div>

        {/* Selected Theme Badge Highlight */}
        <div className="flex items-center gap-2 self-start sm:self-auto bg-slate-100 dark:bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-inner">
          <span className="text-xs">{selectedTheme.icon}</span>
          <span className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[150px]">
            {selectedTheme.label.split('(')[0].trim()}
          </span>
          {selectedTheme.badge && (
            <span className="px-1.5 py-0.2 rounded text-[8px] font-black uppercase tracking-wider bg-primary/15 text-primary border border-primary/20">
              {selectedTheme.badge}
            </span>
          )}
        </div>
      </div>

      {/* ─── 2. ACTIVE SELECTION DETAILS & SAMPLE PREVIEW BANNER ─── */}
      <div className="p-3 sm:p-4 rounded-2xl bg-gradient-to-r from-primary/5 via-amber-500/5 to-transparent border border-primary/20 dark:border-primary/20 space-y-2.5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="size-8 rounded-xl bg-primary/15 dark:bg-primary/25 text-primary flex items-center justify-center text-lg shrink-0 border border-primary/30 shadow-sm">
              {selectedTheme.icon}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate">
                  {selectedTheme.label}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-primary text-white shadow-sm">
                  Aktif Dipilih ✓
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-1 mt-0.5 font-medium">
                {selectedTheme.subLabel || selectedTheme.description}
              </p>
            </div>
          </div>

          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono shrink-0 hidden md:block">
            {selectedTheme.curatedPhotos?.length || 0} Contoh Visual HD
          </div>
        </div>

        {/* Mini Curated Visual Preview Strip */}
        {selectedTheme.curatedPhotos && selectedTheme.curatedPhotos.length > 0 && (
          <div className="pt-2 border-t border-primary/10 flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 shrink-0 uppercase tracking-wider">
              Contoh Gambar:
            </span>
            <div className="flex items-center gap-2">
              {selectedTheme.curatedPhotos.slice(0, 5).map((photoUrl, pIdx) => (
                <div
                  key={pIdx}
                  className="size-12 sm:size-14 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700/80 shrink-0 shadow-sm relative group"
                >
                  <img
                    src={photoUrl}
                    alt={`Preview ${selectedTheme.label} ${pIdx + 1}`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ─── 3. CATEGORY FILTER TABS & SEARCH BAR ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        {/* Horizontal Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 -mx-1 px-1">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            const count = categoryCounts[cat.id] || 0;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  'shrink-0 px-2.5 sm:px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1.5 shadow-sm',
                  isActive
                    ? 'bg-primary text-white shadow-md shadow-primary/25 border border-primary'
                    : 'bg-slate-100/80 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800'
                )}
              >
                <span>{cat.icon}</span>
                <span>
                  {cat.label} {count > 0 ? `(${count})` : ''}
                </span>
              </button>
            );
          })}
        </div>

        {/* Live Search Input */}
        <div className="relative w-full sm:w-56 shrink-0">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari gaya visual..."
            className="w-full h-8 sm:h-9 pl-9 pr-7 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-primary"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="size-3" />
            </button>
          )}
        </div>
      </div>

      {/* ─── 4. THEME CARDS GRID ─── */}
      <div
        className={cn(
          'grid gap-2.5 sm:gap-3.5',
          compact
            ? 'grid-cols-2'
            : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4'
        )}
      >
        {displayedThemes.map((theme) => {
          const isSelected = value === theme.id;
          const previewImage = theme.curatedPhotos?.[0];

          return (
            <div
              key={theme.id}
              onClick={() => onChange(theme.id)}
              className={cn(
                'group relative flex flex-col rounded-2xl cursor-pointer transition-all duration-200 p-2 sm:p-2.5 border overflow-hidden',
                isSelected
                  ? 'border-primary bg-primary/10 dark:bg-primary/15 ring-2 ring-primary/60 shadow-lg shadow-primary/20 scale-[1.01]'
                  : 'border-slate-200 dark:border-slate-800/80 bg-slate-50/80 dark:bg-slate-950/60 hover:border-slate-400 dark:hover:border-slate-700 shadow-sm'
              )}
            >
              {/* Card Image / Visual Preview Box */}
              <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden bg-slate-900 shadow-inner">
                {previewImage ? (
                  <img
                    src={previewImage}
                    alt={theme.label}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-tr from-slate-900 via-slate-800 to-slate-950 flex items-center justify-center text-2xl">
                    {theme.icon}
                  </div>
                )}

                {/* Dark Gradient Overlay for Badges & Emoji */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                {/* Top Left Emoji Icon */}
                <div className="absolute top-2 left-2 size-7 rounded-lg bg-black/50 backdrop-blur-md flex items-center justify-center text-sm shadow-md border border-white/20">
                  {theme.icon}
                </div>

                {/* Top Right Tag Badge */}
                {theme.badge && (
                  <div className="absolute top-2 right-2">
                    <span className="px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider bg-primary text-white shadow-md shadow-primary/30">
                      {theme.badge}
                    </span>
                  </div>
                )}

                {/* Active Checkmark Overlay */}
                {isSelected && (
                  <div className="absolute inset-0 z-20 flex items-center justify-center bg-primary/30 backdrop-blur-[1px]">
                    <div className="size-8 rounded-full bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/50 animate-scale-in">
                      <Check className="size-4 stroke-[3.5]" />
                    </div>
                  </div>
                )}

                {/* Bottom Style Mini SubLabel */}
                <div className="absolute bottom-1.5 left-2 right-2 text-[9px] font-bold text-white/90 truncate drop-shadow">
                  {theme.subLabel || theme.category}
                </div>
              </div>

              {/* Card Meta & Title Below Preview */}
              <div className="pt-2 px-0.5 space-y-0.5">
                <div className="flex items-center justify-between gap-1">
                  <p
                    className={cn(
                      'font-bold text-xs truncate',
                      isSelected ? 'text-primary font-black' : 'text-slate-900 dark:text-white'
                    )}
                  >
                    {theme.label}
                  </p>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {theme.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty Search State */}
      {filteredThemes.length === 0 && (
        <div className="p-8 text-center rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
          <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Tidak ada gaya visual yang cocok dengan &quot;{searchQuery}&quot;
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setActiveCategory('ALL');
            }}
            className="text-xs text-primary font-bold hover:underline"
          >
            Reset Pencarian & Kategori
          </button>
        </div>
      )}

      {/* ─── 5. EXPAND / COLLAPSE TOGGLE BUTTON ─── */}
      {!isFiltering && filteredThemes.length > 8 && (
        <div className="pt-1 flex justify-center">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 transition-all flex items-center gap-1.5 shadow-sm group"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="size-3.5 text-primary group-hover:-translate-y-0.5 transition-transform" />
                <span>Ringkas Tampilan (Tampilkan 8 Gaya Populer)</span>
              </>
            ) : (
              <>
                <ChevronDown className="size-3.5 text-primary group-hover:translate-y-0.5 transition-transform" />
                <span>Lihat Semua 27 Gaya Seni Visual AI</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
