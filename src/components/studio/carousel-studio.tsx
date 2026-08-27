'use client';

import * as React from 'react';
import type { DesignStyle, OutputFormat } from '@prisma/client';
import {
  Sparkles,
  Download,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  Layout,
  Palette,
  FileText,
  Share2,
  RefreshCw,
  Sliders,
  Maximize2,
} from 'lucide-react';
import { STYLES, type StyleDef } from '@/config/styles';
import { CanvasRenderer, type SlideData } from '@/components/studio/canvas-renderer';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/input';

export type CarouselStudioProps = {
  initialContent: {
    headline: string;
    caption: string;
    hashtags: string[];
    cta: string;
    angle?: string;
    slides: any[];
  };
  article: {
    title: string;
    source?: string;
    url?: string;
    imageUrl?: string | null;
    author?: string;
  };
  initialStyle?: DesignStyle;
  initialFormat?: OutputFormat;
};

export function CarouselStudio({
  initialContent,
  article,
  initialStyle = 'BREAKING_NEWS',
  initialFormat = 'FEED_PORTRAIT',
}: CarouselStudioProps) {
  const [currentStyle, setCurrentStyle] = React.useState<DesignStyle>(initialStyle);
  const [currentFormat, setCurrentFormat] = React.useState<OutputFormat>(initialFormat);
  const [activeSlideIndex, setActiveSlideIndex] = React.useState(0);
  const [handle, setHandle] = React.useState('@redaksimedia');
  const [brandName, setBrandName] = React.useState('MEDIA UPDATE');
  const [copiedCaption, setCopiedCaption] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<'styles' | 'editor' | 'caption'>('styles');

  // Parse slides
  const [slides, setSlides] = React.useState<SlideData[]>(() => {
    if (Array.isArray(initialContent.slides) && initialContent.slides.length > 0) {
      return initialContent.slides.map((s, idx) => ({
        index: idx,
        type: s.type || (idx === 0 ? 'COVER' : idx === initialContent.slides.length - 1 ? 'OUTRO' : 'POINT'),
        tag: s.tag,
        headline: s.headline || initialContent.headline,
        lead: s.lead,
        pointNumber: s.pointNumber || idx,
        takeaway: s.takeaway || s.headline,
        supportingText: s.supportingText || s.body,
        sourceQuote: s.sourceQuote,
        ctaText: s.ctaText || initialContent.cta,
        secondaryCta: s.secondaryCta,
        imageUrl: s.imageUrl || article.imageUrl,
        author: article.author,
        source: article.source,
      }));
    }

    // Default Fallback 5 Slides
    return [
      {
        index: 0,
        type: 'COVER',
        headline: initialContent.headline || article.title,
        lead: 'Simak rangkuman lengkap dan fakta pentingnya dalam slide berikut.',
        imageUrl: article.imageUrl,
        source: article.source,
      },
      {
        index: 1,
        type: 'POINT',
        pointNumber: 1,
        takeaway: 'Latar Belakang & Kejadian Utama',
        supportingText: 'Pihak terkait telah mengonfirmasi langkah-langkah strategis yang sedang diambil untuk menangani situasi terkini.',
        source: article.source,
      },
      {
        index: 2,
        type: 'POINT',
        pointNumber: 2,
        takeaway: 'Dampak & Fakta Kunci',
        supportingText: 'Analisis menunjukkan adanya pengaruh langsung terhadap sektor terkait serta masyarakat luas.',
        source: article.source,
      },
      {
        index: 3,
        type: 'POINT',
        pointNumber: 3,
        takeaway: 'Rencana Tindak Lanjut',
        supportingText: 'Evaluasi menyeluruh sedang dilakukan bersama para ahli guna memastikan solusi jangka panjang.',
        source: article.source,
      },
      {
        index: 4,
        type: 'OUTRO',
        ctaText: initialContent.cta || 'Bagikan ke Teman & Kolega!',
        secondaryCta: 'Ikuti kami untuk analisis berita mendalam setiap hari.',
        source: article.source,
      },
    ];
  });

  const currentSlide = slides[activeSlideIndex] || slides[0];

  function updateActiveSlide(updates: Partial<SlideData>) {
    setSlides((prev) =>
      prev.map((s, idx) => (idx === activeSlideIndex ? { ...s, ...updates } : s))
    );
  }

  function handleCopyCaption() {
    const fullText = `${initialContent.headline}\n\n${initialContent.caption}\n\n${initialContent.cta}\n\n${initialContent.hashtags.map((h) => (h.startsWith('#') ? h : `#${h}`)).join(' ')}`;
    navigator.clipboard.writeText(fullText);
    setCopiedCaption(true);
    setTimeout(() => setCopiedCaption(false), 2000);
  }

  // Simple HTML5 Canvas client-side download
  async function downloadCurrentSlide() {
    const canvasElement = document.getElementById(`slide-canvas-${activeSlideIndex}`);
    if (!canvasElement) return;

    // Use modern SVG foreignObject capture or print
    alert(`Slide ${activeSlideIndex + 1} siap diunduh! Klik kanan pada gambar lalu pilih "Save Image As..." atau gunakan tombol ZIP untuk paket lengkap.`);
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8">
      {/* Header Bar */}
      <div className="max-w-7xl mx-auto mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/20 text-primary border border-primary/30">
              ✨ Studio Editor
            </span>
            <span className="text-xs text-slate-400">Siap Posting ke Instagram & LinkedIn</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white mt-1">
            {initialContent.headline || article.title}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            onClick={handleCopyCaption}
            className="flex items-center gap-1.5 text-xs font-bold"
          >
            {copiedCaption ? <Check className="size-4 text-emerald-400" /> : <Copy className="size-4" />}
            {copiedCaption ? 'Tersalin!' : 'Salin Caption'}
          </Button>

          <Button
            onClick={downloadCurrentSlide}
            className="flex items-center gap-1.5 text-xs font-bold bg-primary hover:bg-primary/90 text-white"
          >
            <Download className="size-4" />
            Download Slide {activeSlideIndex + 1}
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Interactive Live Carousel Preview */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center space-y-4 bg-slate-900/50 p-6 rounded-3xl border border-slate-800/80 shadow-2xl">
          {/* Format Selector Pills */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-800">
            <button
              onClick={() => setCurrentFormat('FEED_PORTRAIT')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                currentFormat === 'FEED_PORTRAIT'
                  ? 'bg-primary text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Feed 4:5 (Standard IG)
            </button>
            <button
              onClick={() => setCurrentFormat('FEED_SQUARE')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                currentFormat === 'FEED_SQUARE'
                  ? 'bg-primary text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Square 1:1
            </button>
            <button
              onClick={() => setCurrentFormat('STORY')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                currentFormat === 'STORY'
                  ? 'bg-primary text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Story 9:16
            </button>
          </div>

          {/* Active Canvas Renderer */}
          <div className="w-full flex justify-center py-2">
            <CanvasRenderer
              slide={currentSlide}
              style={currentStyle}
              format={currentFormat}
              handle={handle}
              brandName={brandName}
              totalSlides={slides.length}
            />
          </div>

          {/* Carousel Slide Navigator */}
          <div className="flex items-center justify-between w-full max-w-md pt-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={activeSlideIndex === 0}
              onClick={() => setActiveSlideIndex((prev) => Math.max(0, prev - 1))}
              className="flex items-center gap-1"
            >
              <ChevronLeft className="size-4" /> Sebelumnya
            </Button>

            {/* Slide Pagination Dots */}
            <div className="flex items-center gap-1.5">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveSlideIndex(idx)}
                  className={`size-3 rounded-full transition-all ${
                    idx === activeSlideIndex
                      ? 'bg-primary w-6'
                      : 'bg-slate-700 hover:bg-slate-500'
                  }`}
                  aria-label={`Slide ${idx + 1}`}
                />
              ))}
            </div>

            <Button
              variant="secondary"
              size="sm"
              disabled={activeSlideIndex === slides.length - 1}
              onClick={() => setActiveSlideIndex((prev) => Math.min(slides.length - 1, prev + 1))}
              className="flex items-center gap-1"
            >
              Lanjut <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>

        {/* Right Column: Customization Tabs (Styles, Live Edit, Caption) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Tabs Navigation */}
          <div className="flex items-center border-b border-slate-800">
            <button
              onClick={() => setActiveTab('styles')}
              className={`flex-1 py-3 text-xs sm:text-sm font-bold border-b-2 flex items-center justify-center gap-2 transition-all ${
                activeTab === 'styles'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Palette className="size-4" /> 1-Click Styles ({STYLES.length})
            </button>

            <button
              onClick={() => setActiveTab('editor')}
              className={`flex-1 py-3 text-xs sm:text-sm font-bold border-b-2 flex items-center justify-center gap-2 transition-all ${
                activeTab === 'editor'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sliders className="size-4" /> Edit Slide {activeSlideIndex + 1}
            </button>

            <button
              onClick={() => setActiveTab('caption')}
              className={`flex-1 py-3 text-xs sm:text-sm font-bold border-b-2 flex items-center justify-center gap-2 transition-all ${
                activeTab === 'caption'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="size-4" /> Caption
            </button>
          </div>

          {/* TAB 1: 1-Click Multi-Template Switcher */}
          {activeTab === 'styles' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Pilih Preset Desain Instagram:
                </p>
                <span className="text-xs font-mono text-primary font-bold">1-Klik Ganti</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[520px] overflow-y-auto pr-1">
                {STYLES.map((style) => {
                  const isSelected = currentStyle === style.id;
                  return (
                    <div
                      key={style.id}
                      onClick={() => setCurrentStyle(style.id)}
                      className={`p-3.5 rounded-2xl cursor-pointer border transition-all duration-200 flex flex-col justify-between ${
                        isSelected
                          ? 'bg-primary/10 border-primary shadow-lg ring-2 ring-primary/40'
                          : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span
                            className="size-3 rounded-full"
                            style={{ backgroundColor: style.accentColor }}
                          />
                          <span className="font-bold text-xs text-white">
                            {style.label}
                          </span>
                        </div>
                        {style.badge && (
                          <span
                            className="text-[10px] font-black px-1.5 py-0.5 rounded text-white"
                            style={{ backgroundColor: style.accentColor }}
                          >
                            {style.badge}
                          </span>
                        )}
                      </div>

                      {style.subLabel && (
                        <p className="text-[11px] font-medium text-primary/90 mb-1">
                          {style.subLabel}
                        </p>
                      )}

                      <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                        {style.description}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Watermark & Handle Settings */}
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                <p className="text-xs font-bold text-slate-300">Identitas Media / Watermark:</p>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-[11px] text-slate-400">Instagram Handle</Label>
                    <Input
                      value={handle}
                      onChange={(e) => setHandle(e.target.value)}
                      placeholder="@namamedia"
                      className="h-9 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-[11px] text-slate-400">Nama Brand / Media</Label>
                    <Input
                      value={brandName}
                      onChange={(e) => setBrandName(e.target.value)}
                      placeholder="MEDIA KITA"
                      className="h-9 text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Live Slide Text & Visual Editor */}
          {activeTab === 'editor' && (
            <div className="space-y-4 bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-primary uppercase">
                  Mengedit Slide #{activeSlideIndex + 1} ({currentSlide.type})
                </span>
              </div>

              {currentSlide.type === 'COVER' && (
                <>
                  <div>
                    <Label className="text-xs text-slate-400">Headline Cover</Label>
                    <Input
                      value={currentSlide.headline || ''}
                      onChange={(e) => updateActiveSlide({ headline: e.target.value })}
                      placeholder="Tulis headline yang memikat..."
                      className="text-sm font-bold"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-slate-400">Sub-headline / Lead Text</Label>
                    <textarea
                      value={currentSlide.lead || ''}
                      onChange={(e) => updateActiveSlide({ lead: e.target.value })}
                      rows={3}
                      className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-xs text-slate-200 focus:ring-1 focus:ring-primary outline-none"
                    />
                  </div>
                </>
              )}

              {currentSlide.type === 'POINT' && (
                <>
                  <div>
                    <Label className="text-xs text-slate-400">Inti Poin (Takeaway)</Label>
                    <Input
                      value={currentSlide.takeaway || ''}
                      onChange={(e) => updateActiveSlide({ takeaway: e.target.value })}
                      placeholder="Poin utama..."
                      className="text-sm font-bold"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-slate-400">Penjelasan Lengkap</Label>
                    <textarea
                      value={currentSlide.supportingText || ''}
                      onChange={(e) => updateActiveSlide({ supportingText: e.target.value })}
                      rows={4}
                      className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-xs text-slate-200 focus:ring-1 focus:ring-primary outline-none"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-slate-400">Kutipan Narasumber (Opsional)</Label>
                    <Input
                      value={currentSlide.sourceQuote || ''}
                      onChange={(e) => updateActiveSlide({ sourceQuote: e.target.value })}
                      placeholder="Kutipan..."
                      className="text-xs"
                    />
                  </div>
                </>
              )}

              {currentSlide.type === 'OUTRO' && (
                <>
                  <div>
                    <Label className="text-xs text-slate-400">Kalimat CTA Utama</Label>
                    <Input
                      value={currentSlide.ctaText || ''}
                      onChange={(e) => updateActiveSlide({ ctaText: e.target.value })}
                      placeholder="Bagikan sekarang..."
                      className="text-sm font-bold"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-slate-400">Pesan Ajakan Lanjutan</Label>
                    <Input
                      value={currentSlide.secondaryCta || ''}
                      onChange={(e) => updateActiveSlide({ secondaryCta: e.target.value })}
                      placeholder="Follow @akun kami..."
                      className="text-xs"
                    />
                  </div>
                </>
              )}
            </div>
          )}

          {/* TAB 3: Caption & Viral Hashtags */}
          {activeTab === 'caption' && (
            <div className="space-y-4 bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300">Caption Instagram Siap Pakai:</span>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleCopyCaption}
                  className="text-xs font-bold"
                >
                  {copiedCaption ? <Check className="size-3.5 text-emerald-400 mr-1" /> : <Copy className="size-3.5 mr-1" />}
                  {copiedCaption ? 'Tersalin!' : 'Salin Semua'}
                </Button>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed font-sans space-y-3 max-h-[380px] overflow-y-auto">
                <p className="font-bold text-white text-sm">{initialContent.headline}</p>
                <p className="whitespace-pre-line">{initialContent.caption}</p>
                <p className="font-semibold text-primary">{initialContent.cta}</p>
                <div className="flex flex-wrap gap-1 pt-2 border-t border-slate-800/80">
                  {initialContent.hashtags.map((tag, i) => (
                    <span key={i} className="text-cyan-400 font-mono text-[11px]">
                      {tag.startsWith('#') ? tag : `#${tag}`}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
