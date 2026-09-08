'use client';

import * as React from 'react';
import { Sparkles, ChevronDown, Check, Search, Palette, Wand2 } from 'lucide-react';
import {
  AI_IMAGE_THEMES,
  getAIThemeDef,
  type AIImageThemeId,
  type AIImageThemeCategory,
} from '@/config/ai-image-themes';
import { cn } from '@/lib/utils';

export interface AIVisualThemePickerProps {
  value: AIImageThemeId;
  onChange: (themeId: AIImageThemeId) => void;
  className?: string;
}

const CATEGORIES: { id: AIImageThemeCategory; label: string }[] = [
  { id: 'ALL', label: 'Semua' },
  { id: '3D', label: '3D & Render' },
  { id: 'ILLUSTRATION', label: 'Ilustrasi' },
  { id: 'ARTISTIC', label: 'Artistik' },
  { id: 'CRAFT', label: 'Craft & Tekstur' },
  { id: 'RETRO', label: 'Retro' },
  { id: 'MODERN', label: 'Modern' },
];

export function AIVisualThemePicker({
  value = 'AUTO',
  onChange,
  className,
}: AIVisualThemePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [activeCategory, setActiveCategory] = React.useState<AIImageThemeCategory>('ALL');
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const selectedTheme = React.useMemo(() => getAIThemeDef(value), [value]);

  // Close dropdown on click outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const filteredThemes = React.useMemo(() => {
    return AI_IMAGE_THEMES.filter((theme) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchLabel = theme.label.toLowerCase().includes(q);
        const matchSub = (theme.subLabel || '').toLowerCase().includes(q);
        const matchDesc = theme.description.toLowerCase().includes(q);
        if (!matchLabel && !matchSub && !matchDesc) return false;
      }

      // 2. Category
      if (activeCategory !== 'ALL' && theme.category !== activeCategory && theme.id !== 'AUTO') {
        return false;
      }

      return true;
    });
  }, [searchQuery, activeCategory]);

  return (
    <div className={cn('relative space-y-2', className)} ref={dropdownRef}>
      <div className="flex items-center justify-between">
        <label className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5 uppercase tracking-wider">
          <Palette className="size-3.5 text-primary" />
          <span>Tema Visual Gambar AI</span>
        </label>
        <span className="text-[10px] font-mono text-primary font-bold bg-primary/10 dark:bg-primary/20 px-2 py-0.5 rounded-full border border-primary/20">
          27 Art Styles
        </span>
      </div>

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 sm:p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/90 border border-slate-200 dark:border-slate-800 text-left hover:border-primary/60 dark:hover:border-primary/60 transition-all shadow-sm group"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="size-9 rounded-xl bg-primary/10 dark:bg-primary/20 text-primary flex items-center justify-center text-lg shrink-0 border border-primary/20 shadow-sm group-hover:scale-105 transition-transform">
            {selectedTheme.icon}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate">
                {selectedTheme.label}
              </span>
              {selectedTheme.badge && (
                <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider bg-primary/15 text-primary border border-primary/25">
                  {selectedTheme.badge}
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
              {selectedTheme.subLabel || selectedTheme.description}
            </p>
          </div>
        </div>

        <ChevronDown
          className={cn(
            'size-4 text-slate-400 shrink-0 transition-transform duration-200 ml-2',
            isOpen && 'rotate-180 text-primary'
          )}
        />
      </button>

      {/* Dropdown Menu Modal */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-2 z-50 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl backdrop-blur-2xl p-3 space-y-3 animate-in fade-in-50 zoom-in-95 duration-150">
          {/* Search Box */}
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari tema (Pixar, Ghibli, Clay, Vector...)"
              className="w-full h-9 pl-9 pr-3 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-primary"
              autoFocus
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  'shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all',
                  activeCategory === cat.id
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Options List */}
          <div className="max-h-64 sm:max-h-72 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
            {filteredThemes.map((theme) => {
              const isSelected = value === theme.id;
              return (
                <div
                  key={theme.id}
                  onClick={() => {
                    onChange(theme.id);
                    setIsOpen(false);
                  }}
                  className={cn(
                    'flex items-center justify-between p-2 sm:p-2.5 rounded-xl cursor-pointer transition-all',
                    isSelected
                      ? 'bg-primary/10 dark:bg-primary/20 text-primary border border-primary/30'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-base shrink-0">{theme.icon}</span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={cn(
                            'text-xs font-bold truncate',
                            isSelected ? 'text-primary dark:text-white font-black' : 'text-slate-900 dark:text-slate-100'
                          )}
                        >
                          {theme.label}
                        </span>
                        {theme.badge && (
                          <span className="px-1.5 py-0.2 rounded text-[8px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                            {theme.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {theme.subLabel || theme.description}
                      </p>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="size-5 rounded-full bg-primary text-white flex items-center justify-center shrink-0 ml-2 shadow-sm">
                      <Check className="size-3 stroke-[3]" />
                    </div>
                  )}
                </div>
              );
            })}

            {filteredThemes.length === 0 && (
              <div className="p-4 text-center text-xs text-slate-400">
                Tidak ada tema visual yang cocok dengan kata kunci.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
