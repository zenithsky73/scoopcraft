'use client';

import * as React from 'react';
import { Search, X, Image as ImageIcon, Loader2, Sparkles, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

export type StockPhoto = {
  url: string;
  alt: string;
  photographer: string;
};

export type StockPhotoModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSelectPhoto: (url: string) => void;
  slideIndex: number;
  initialQuery?: string;
};

const SUGGESTED_TAGS = [
  'Bisnis & Kantor',
  'Teknologi & AI',
  'Keuangan & Saham',
  'Berita & Media',
  'Kopi & Lifestyle',
  'Kota Modern',
];

export function StockPhotoModal({
  isOpen,
  onClose,
  onSelectPhoto,
  slideIndex,
  initialQuery = 'bisnis',
}: StockPhotoModalProps) {
  const [query, setQuery] = React.useState(initialQuery);
  const [loading, setLoading] = React.useState(false);
  const [photos, setPhotos] = React.useState<StockPhoto[]>([]);
  const [selectedUrl, setSelectedUrl] = React.useState<string | null>(null);

  const fetchPhotos = React.useCallback(async (searchTag: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/stock-photos?query=${encodeURIComponent(searchTag)}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.photos)) {
        setPhotos(data.photos);
      }
    } catch (err) {
      console.error('Error fetching stock photos:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (isOpen) {
      fetchPhotos(query || initialQuery || 'bisnis');
    }
  }, [isOpen, fetchPhotos, initialQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      fetchPhotos(query.trim());
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
              <ImageIcon className="size-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                Cari Foto Bebas Royalti (Slide #{slideIndex + 1})
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Pilih foto berkualitas tinggi Unsplash untuk latar slide
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Search Bar & Suggested Tags */}
        <div className="p-4 sm:p-5 space-y-3 border-b border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ketik kata kunci foto (misal: teknologi, saham, kantor)..."
                className="w-full h-10 pl-10 pr-4 text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="h-10 px-4 text-xs font-bold bg-primary hover:bg-primary/90 text-white rounded-xl shrink-0"
            >
              {loading ? <Loader2 className="size-4 animate-spin" /> : 'Cari'}
            </Button>
          </form>

          {/* Quick Tag Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {SUGGESTED_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => {
                  setQuery(tag);
                  fetchPhotos(tag);
                }}
                className="shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-primary hover:border-primary/40 transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="p-4 sm:p-5 flex-1 overflow-y-auto">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center space-y-2 text-slate-400">
              <Loader2 className="size-7 animate-spin text-primary" />
              <p className="text-xs font-medium">Mencari foto terbaik...</p>
            </div>
          ) : photos.length === 0 ? (
            <div className="py-16 text-center space-y-2 text-slate-400">
              <ImageIcon className="size-8 mx-auto opacity-40" />
              <p className="text-xs">Tidak ada foto ditemukan untuk kata kunci ini.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {photos.map((photo, pIdx) => {
                const isSelected = selectedUrl === photo.url;
                return (
                  <div
                    key={pIdx}
                    onClick={() => setSelectedUrl(photo.url)}
                    className={`group relative aspect-[4/3] rounded-2xl overflow-hidden border-2 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-primary ring-2 ring-primary/50 shadow-xl'
                        : 'border-transparent hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <img
                      src={photo.url}
                      alt={photo.alt}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2.5">
                      <p className="text-[10px] text-white font-medium truncate drop-shadow">
                        Foto: {photo.photographer}
                      </p>
                    </div>
                    {isSelected && (
                      <div className="absolute top-2 right-2 size-6 rounded-full bg-primary text-white flex items-center justify-center shadow-lg">
                        <Check className="size-3.5 stroke-[3]" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/40">
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Sumber: Unsplash (Bebas royalti)
          </span>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={onClose} className="text-xs">
              Batal
            </Button>
            <Button
              size="sm"
              disabled={!selectedUrl}
              onClick={() => {
                if (selectedUrl) {
                  onSelectPhoto(selectedUrl);
                  onClose();
                }
              }}
              className="text-xs font-bold bg-primary hover:bg-primary/90 text-white rounded-xl px-4"
            >
              Pasang ke Slide #{slideIndex + 1}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
