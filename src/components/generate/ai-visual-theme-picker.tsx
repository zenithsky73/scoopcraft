'use client';

import * as React from 'react';
import {
  Sparkles,
  Check,
  Search,
  Palette,
  ChevronDown,
  X,
  Layers,
  SlidersHorizontal,
} from 'lucide-react';
import {
  AI_IMAGE_THEMES,
  getAIThemeDef,
  type AIImageThemeId,
  type AIImageThemeCategory,
} from '@/config/ai-image-themes';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

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

const POPULAR_THEME_IDS: AIImageThemeId[] = [
  'AUTO',
  'PIXAR_3D',
  'GHIBLI_ANIME',
  'CYBERPUNK_NEON',
  'FLAT_VECTOR',
  'WATERCOLOR_AQUARELLE',
  'CLAYMORPHISM',
];

export function AIVisualThemePicker({
  value = 'AUTO',
  onChange,
  className,
  compact = false,
}: AIVisualThemePickerProps) {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [activeCategory, setActiveCategory] = React.useState<AIImageThemeCategory>('ALL');
  const [searchQuery, setSearchQuery] = React.useState('');

  const selectedTheme = React.useMemo(() => getAIThemeDef(value) || AI_IMAGE_THEMES[0], [value]);

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

  const handleSelectTheme = (themeId: AIImageThemeId) => {
    onChange(themeId);
    setIsModalOpen(false);
  };

  return (
    <div className={cn('space-y-2.5 select-none', className)}>
      {/* ─── COMPACT INLINE BAR ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <div className="size-7 rounded-lg bg-gradient-to-tr from-amber-500 to-primary text-white font-black text-xs flex items-center justify-center shrink-0 shadow-sm">
            <Palette className="size-3.5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                Gaya Seni Visual AI
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal hidden sm:inline">
                • Gambar Ilustrasi Slide
              </span>
            </div>
          </div>
        </div>

        {/* Selected Theme Trigger Button (Opens Modal) */}
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-between sm:justify-start gap-2 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 transition-all text-left shadow-sm group"
        >
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-xs shrink-0">{selectedTheme.icon}</span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-[170px]">
              {selectedTheme.label.split('(')[0].trim()}
            </span>
            {selectedTheme.id !== 'AUTO' && (
              <span className="px-1.5 py-0.2 rounded text-[8px] font-black uppercase tracking-wider bg-primary/15 text-primary border border-primary/20 shrink-0">
                Aktif
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 text-[10px] font-semibold text-primary pl-1 border-l border-slate-300 dark:border-slate-700 shrink-0">
            <SlidersHorizontal className="size-3" />
            <span>27 Gaya</span>
            <ChevronDown className="size-3 text-slate-400 group-hover:text-primary transition-colors" />
          </div>
        </button>
      </div>

      {/* ─── QUICK SELECT PILLS (HORIZONTAL STRIP) ─── */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 -mx-0.5 px-0.5">
        {POPULAR_THEME_IDS.map((themeId) => {
          const theme = getAIThemeDef(themeId);
          if (!theme) return null;
          const isSelected = value === theme.id;

          return (
            <button
              key={theme.id}
              type="button"
              onClick={() => onChange(theme.id)}
              className={cn(
                'shrink-0 px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1.5 border',
                isSelected
                  ? 'bg-primary text-white border-primary shadow-sm ring-1 ring-primary/40'
                  : 'bg-white dark:bg-slate-950/80 border-slate-200 dark:border-slate-800/80 text-slate-700 dark:text-slate-300 hover:border-slate-400 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900'
              )}
            >
              <span>{theme.icon}</span>
              <span>{theme.label.split('(')[0].trim()}</span>
              {isSelected && <Check className="size-2.5 stroke-[3] ml-0.5" />}
            </button>
          );
        })}

        {/* If currently selected theme is custom / not in top list, show it */}
        {!POPULAR_THEME_IDS.includes(value) && selectedTheme && (
          <button
            type="button"
            className="shrink-0 px-2.5 py-1 rounded-xl text-[11px] font-bold bg-primary text-white border border-primary shadow-sm flex items-center gap-1.5"
          >
            <span>{selectedTheme.icon}</span>
            <span>{selectedTheme.label.split('(')[0].trim()}</span>
            <Check className="size-2.5 stroke-[3] ml-0.5" />
          </button>
        )}

        {/* "Lihat Semua" Pill */}
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="shrink-0 px-2.5 py-1 rounded-xl text-[11px] font-bold bg-slate-100 dark:bg-slate-900/90 border border-dashed border-slate-300 dark:border-slate-700 text-primary hover:bg-primary/10 hover:border-primary transition-all flex items-center gap-1"
        >
          <Search className="size-2.5" />
          <span>+20 Lainnya...</span>
        </button>
      </div>

      {/* ─── FULL THEMES MODAL DIALOG (27 ART STYLES) ─── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="size-9 rounded-xl bg-primary/10 dark:bg-primary/20 text-primary flex items-center justify-center shrink-0">
                  <Palette className="size-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white truncate">
                      Pilih Gaya Seni Visual AI
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-primary/10 text-primary border border-primary/20 shrink-0">
                      27 Pilihan
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    Klik salah satu gaya untuk diterapkan pada ilustrasi slide carousel Anda.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="size-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors shrink-0"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Filter Bar & Search Bar */}
            <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-slate-100 dark:border-slate-800/80">
              {/* Category Pills */}
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
                          : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                      )}
                    >
                      <span>{cat.icon}</span>
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Search Box */}
              <div className="relative w-full sm:w-56 shrink-0">
                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-3 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari gaya seni..."
                  className="w-full h-8 pl-8 pr-7 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-primary"
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

            {/* Themes Grid */}
            <div className="flex-1 overflow-y-auto py-3 pr-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-3">
              {filteredThemes.map((theme) => {
                const isSelected = value === theme.id;
                const previewImage = theme.curatedPhotos?.[0];

                return (
                  <div
                    key={theme.id}
                    onClick={() => handleSelectTheme(theme.id)}
                    className={cn(
                      'group relative flex flex-col rounded-2xl cursor-pointer transition-all duration-150 p-2 border overflow-hidden',
                      isSelected
                        ? 'border-primary bg-primary/10 dark:bg-primary/15 ring-2 ring-primary/60 shadow-md scale-[1.01]'
                        : 'border-slate-200 dark:border-slate-800/80 bg-slate-50/80 dark:bg-slate-950/60 hover:border-primary/50 dark:hover:border-primary/50 hover:bg-slate-100/80 dark:hover:bg-slate-900/60 shadow-xs'
                    )}
                  >
                    {/* Visual Preview Box */}
                    <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden bg-slate-900 shadow-inner">
                      {previewImage ? (
                        <img
                          src={previewImage}
                          alt={theme.label}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-tr from-slate-900 via-slate-800 to-slate-950 flex items-center justify-center text-xl">
                          {theme.icon}
                        </div>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                      {/* Top Left Emoji */}
                      <div className="absolute top-1.5 left-1.5 size-6 rounded-md bg-black/60 backdrop-blur-xs flex items-center justify-center text-xs shadow-xs border border-white/20">
                        {theme.icon}
                      </div>

                      {/* Selected Checkmark Badge */}
                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5 size-5 rounded-full bg-primary text-white flex items-center justify-center shadow-md">
                          <Check className="size-3 stroke-[3]" />
                        </div>
                      )}

                      {/* Bottom SubLabel */}
                      <div className="absolute bottom-1 left-1.5 right-1.5 text-[8.5px] font-bold text-white/90 truncate drop-shadow">
                        {theme.subLabel || theme.category}
                      </div>
                    </div>

                    {/* Meta */}
                    <div className="pt-1.5 px-0.5 space-y-0.5">
                      <p
                        className={cn(
                          'font-bold text-xs truncate',
                          isSelected ? 'text-primary font-black' : 'text-slate-900 dark:text-white'
                        )}
                      >
                        {theme.label}
                      </p>
                      <p className="text-[9.5px] text-slate-500 dark:text-slate-400 line-clamp-1 leading-snug">
                        {theme.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Gaya Terpilih: <strong className="text-slate-900 dark:text-white">{selectedTheme.icon} {selectedTheme.label}</strong>
              </span>
              <Button
                size="sm"
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="h-8 px-4 rounded-xl text-xs font-bold bg-primary text-white hover:opacity-90"
              >
                Selesai
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
