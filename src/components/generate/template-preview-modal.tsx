'use client';

import * as React from 'react';
import { STYLES, type StyleDef } from '@/config/styles';
import { CanvasRenderer, type SlideData } from '@/components/studio/canvas-renderer';
import { X, ChevronLeft, ChevronRight, Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export type TemplatePreviewModalProps = {
  isOpen: boolean;
  onClose: () => void;
  styleDef: StyleDef | null;
  onSelectStyle?: (styleId: any) => void;
};

export function TemplatePreviewModal({
  isOpen,
  onClose,
  styleDef,
  onSelectStyle,
}: TemplatePreviewModalProps) {
  const [slideIndex, setSlideIndex] = React.useState(0);

  React.useEffect(() => {
    if (isOpen) setSlideIndex(0);
  }, [isOpen, styleDef]);

  if (!isOpen || !styleDef) return null;

  // Mock 5 slide realistis untuk preview template
  const mockSlides: SlideData[] = [
    {
      index: 0,
      type: 'COVER',
      tag: 'SOROTAN UTAMA',
      headline: 'Revolusi Kendaraan Listrik & Transformasi Energi Hijau',
      lead: 'Pelajari analisis komprehensif perkembangan industri masa depan dalam 5 slide ringkas ini.',
      imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1080&auto=format&fit=crop&q=80',
      source: 'Newsly Media',
    },
    {
      index: 1,
      type: 'POINT',
      tag: 'POIN 01',
      takeaway: 'Adopsi Teknologi Baterai Generasi Baru',
      supportingText: 'Inovasi baterai solid-state dan LFP memberikan efisiensi daya 40% lebih tinggi dengan biaya produksi yang kian terjangkau.',
      statHighlight: 'Efisiensi: +40%',
      imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1080&auto=format&fit=crop&q=80',
      sourceQuote: 'Teknologi ini menjadi standar baru efisiensi industri global.',
      source: 'Newsly Media',
    },
    {
      index: 2,
      type: 'POINT',
      tag: 'POIN 02',
      takeaway: 'Infrastruktur Pengisian Daya yang Terintegrasi',
      supportingText: 'Perluasan jaringan stasiun fast-charging di berbagai kota besar menekan kecemasan jarak tempuh pengendara secara drastis.',
      statHighlight: 'Cakupan: 2.500+ Titik',
      imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1080&auto=format&fit=crop&q=80',
      sourceQuote: 'Kemudahan akses mempercepat transisi masyarakat ke energi bersih.',
      source: 'Newsly Media',
    },
    {
      index: 3,
      type: 'POINT',
      tag: 'POIN 03',
      takeaway: 'Insentif Fiskal & Dukungan Regulasi Pemerintah',
      supportingText: 'Kebijakan subsidi pembelian serta pembebasan pajak kendaraan ramah lingkungan menjadi katalis pertumbuhan pasar domestik.',
      statHighlight: 'Pertumbuhan: 85%',
      imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1080&auto=format&fit=crop&q=80',
      source: 'Newsly Media',
    },
    {
      index: 4,
      type: 'OUTRO',
      tag: 'KESIMPULAN',
      takeaway: 'Masa Depan Mobilitas Berkelanjutan',
      supportingText: 'Transisi energi bukan sekadar tren teknologi, melainkan keputusan strategis demi keberlanjutan masa depan.',
      ctaText: 'Simpan & Bagikan ke Rekan Anda!',
      source: 'Newsly Media',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl flex flex-col items-center space-y-5 max-h-[95vh] overflow-y-auto">
        {/* Header Modal */}
        <div className="w-full flex items-center justify-between border-b border-slate-800 pb-3.5">
          <div className="flex items-center gap-2.5">
            <span
              className="size-3.5 rounded-full inline-block"
              style={{ backgroundColor: styleDef.accentColor }}
            />
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                {styleDef.label}
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30 font-bold">
                  {styleDef.badge || 'PRO'}
                </span>
              </h3>
              <p className="text-xs text-slate-400">{styleDef.description}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="size-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Live Canvas Preview */}
        <div className="w-full flex flex-col items-center justify-center py-2">
          <div className="w-full max-w-[340px] sm:max-w-[360px] relative">
            <CanvasRenderer
              slide={mockSlides[slideIndex]}
              style={styleDef.id}
              format="FEED_PORTRAIT"
              totalSlides={5}
              showPhoneFrame={true}
            />
          </div>
        </div>

        {/* Navigation Slider Bar */}
        <div className="w-full flex items-center justify-between gap-3 pt-1 border-t border-slate-800">
          <div className="flex items-center gap-1.5">
            <Button
              variant="secondary"
              size="sm"
              disabled={slideIndex === 0}
              onClick={() => setSlideIndex((prev) => Math.max(0, prev - 1))}
              className="h-8 px-3 text-xs bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700"
            >
              <ChevronLeft className="size-3.5 mr-1" /> Prev
            </Button>

            <span className="text-xs font-mono font-bold text-slate-400 px-2">
              Slide {slideIndex + 1} / 5
            </span>

            <Button
              variant="secondary"
              size="sm"
              disabled={slideIndex === 4}
              onClick={() => setSlideIndex((prev) => Math.min(4, prev + 1))}
              className="h-8 px-3 text-xs bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700"
            >
              Next <ChevronRight className="size-3.5 ml-1" />
            </Button>
          </div>

          <Button
            size="sm"
            onClick={() => {
              onSelectStyle?.(styleDef.id);
              onClose();
            }}
            className="h-9 px-5 text-xs font-bold bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25"
          >
            <Check className="size-3.5 mr-1.5" /> Gunakan Template Ini
          </Button>
        </div>
      </div>
    </div>
  );
}
