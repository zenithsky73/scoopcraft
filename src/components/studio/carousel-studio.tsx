'use client';

import * as React from 'react';
import Link from 'next/link';
import type { DesignStyle, OutputFormat } from '@prisma/client';
import {
  Sparkles,
  Download,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  Palette,
  FileText,
  Sliders,
  Smartphone,
  Maximize2,
  Plus,
  Trash2,
  ArrowLeft,
  Share2,
  FileDown,
  Layers,
  Lock,
  Crown,
} from 'lucide-react';
import { STYLES, isProStyle, type StyleDef } from '@/config/styles';
import { CanvasRenderer, type SlideData } from '@/components/studio/canvas-renderer';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/input';
import { downloadSlideAsPng, exportSlidesToPdf } from '@/lib/export-client';
import { UpgradeDialog } from '@/components/billing/upgrade-dialog';

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
  isProUser?: boolean;
};

export function CarouselStudio({
  initialContent,
  article,
  initialStyle = 'BREAKING_NEWS',
  initialFormat = 'FEED_PORTRAIT',
  isProUser = false,
}: CarouselStudioProps) {
  const [currentStyle, setCurrentStyle] = React.useState<DesignStyle>(initialStyle);
  const [currentFormat, setCurrentFormat] = React.useState<OutputFormat>(initialFormat);
  const [activeSlideIndex, setActiveSlideIndex] = React.useState(0);
  const [showPhoneFrame, setShowPhoneFrame] = React.useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = React.useState(false);
  const [upgradeReason, setUpgradeReason] = React.useState<'PRO_STYLE' | 'PDF_EXPORT'>('PRO_STYLE');
  const [upgradeTitle, setUpgradeTitle] = React.useState('Buka Template Eksklusif Pro');
  const [handle, setHandle] = React.useState('@newsly.ai');
  const [brandName, setBrandName] = React.useState('NEWSLY AI');
  const [copiedCaption, setCopiedCaption] = React.useState(false);
  const [isExportingPdf, setIsExportingPdf] = React.useState(false);
  const [isExportingPng, setIsExportingPng] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<'styles' | 'editor' | 'caption'>('styles');

  // Parse slides
  const [slides, setSlides] = React.useState<SlideData[]>(() => {
    if (Array.isArray(initialContent.slides) && initialContent.slides.length > 0) {
      return initialContent.slides.map((s, idx) => ({
        index: idx,
        type: s.type || (idx === 0 ? 'COVER' : idx === initialContent.slides.length - 1 ? 'OUTRO' : 'POINT'),
        tag: s.tag,
        headline: s.headline || (idx === 0 ? initialContent.headline : s.title),
        lead: s.lead || s.body,
        pointNumber: s.pointNumber || (idx === 0 ? undefined : idx),
        takeaway: s.takeaway || s.title || s.headline,
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

  function handleAddSlide() {
    const newIndex = slides.length;
    const newSlide: SlideData = {
      index: newIndex,
      type: 'POINT',
      pointNumber: newIndex,
      takeaway: `Poin Informasi Tambahan #${newIndex}`,
      supportingText: 'Tulis penjelasan rinci untuk poin slide ini...',
      source: article.source,
    };
    setSlides((prev) => [...prev, newSlide]);
    setActiveSlideIndex(newIndex);
  }

  function handleRemoveSlide(indexToRemove: number) {
    if (slides.length <= 2) {
      alert('Carousel minimal membutuhkan 2 slide (Cover & Poin/Outro).');
      return;
    }
    const updated = slides
      .filter((_, idx) => idx !== indexToRemove)
      .map((s, idx) => ({ ...s, index: idx, pointNumber: s.type === 'POINT' ? idx : s.pointNumber }));
    setSlides(updated);
    setActiveSlideIndex((prev) => Math.min(prev, updated.length - 1));
  }

  function handleCopyCaption() {
    const hashtagsFormatted = initialContent.hashtags.map((h) => (h.startsWith('#') ? h : `#${h}`)).join(' ');
    const fullText = `${initialContent.headline}\n\n${initialContent.caption}\n\n👉 ${initialContent.cta}\n\n${hashtagsFormatted}`;
    navigator.clipboard.writeText(fullText);
    setCopiedCaption(true);
    setTimeout(() => setCopiedCaption(false), 2000);
  }

  async function handleDownloadCurrentPng() {
    setIsExportingPng(true);
    try {
      await downloadSlideAsPng(activeSlideIndex, initialContent.headline || 'scoopcraft');
    } finally {
      setIsExportingPng(false);
    }
  }

  async function handleExportPdf() {
    if (!isProUser) {
      setUpgradeTitle('Ekspor Carousel LinkedIn PDF Terkunci 🔒');
      setUpgradeReason('PDF_EXPORT');
      setShowUpgradeModal(true);
      return;
    }

    setIsExportingPdf(true);
    try {
      await exportSlidesToPdf(slides.length, initialContent.headline || 'newsly-carousel');
    } finally {
      setIsExportingPdf(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* ─── 1. TOP APP BAR ─── */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/80 px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Button asChild variant="ghost" size="sm" className="text-slate-400 hover:text-white shrink-0">
              <Link href="/dashboard" className="flex items-center gap-1.5 text-xs font-semibold">
                <ArrowLeft className="size-4" /> Kembali
              </Link>
            </Button>
            <div className="h-5 w-px bg-slate-800 shrink-0" />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-primary/20 text-primary border border-primary/30 uppercase tracking-wider">
                  Studio Editor
                </span>
                <span className="text-xs text-slate-400 truncate hidden sm:inline">
                  {article.source || 'Scoopcraft AI'}
                </span>
              </div>
              <h1 className="text-sm sm:text-base font-bold text-white truncate max-w-md lg:max-w-xl">
                {initialContent.headline || article.title}
              </h1>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleCopyCaption}
              className="flex items-center gap-1.5 text-xs font-bold bg-slate-900 border-slate-800 text-slate-200 hover:bg-slate-800"
            >
              {copiedCaption ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
              {copiedCaption ? 'Tersalin!' : 'Salin Caption'}
            </Button>

            <Button
              variant="secondary"
              size="sm"
              disabled={isExportingPng}
              onClick={handleDownloadCurrentPng}
              className="flex items-center gap-1.5 text-xs font-bold bg-slate-900 border-slate-800 text-slate-200 hover:bg-slate-800"
            >
              <Download className="size-3.5 text-cyan-400" />
              PNG Slide {activeSlideIndex + 1}
            </Button>

            <Button
              size="sm"
              disabled={isExportingPdf}
              onClick={handleExportPdf}
              className="flex items-center gap-1.5 text-xs font-bold bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-500 text-white shadow-lg shadow-primary/25"
            >
              <FileDown className="size-3.5" />
              {isExportingPdf ? 'Mengekspor PDF...' : 'Ekspor PDF'}
            </Button>
          </div>
        </div>
      </header>

      {/* ─── 2. SPLIT-SCREEN WORKSPACE ─── */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ─── LEFT/CENTER COLUMN: CANVAS PREVIEW & CONTROLS ─── */}
        <div className="lg:col-span-7 flex flex-col items-center space-y-5 bg-slate-900/40 p-5 sm:p-8 rounded-3xl border border-slate-800/80 shadow-2xl backdrop-blur-sm">
          {/* Format & View Mode Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 w-full border-b border-slate-800/80 pb-4">
            {/* Format Pills */}
            <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-2xl border border-slate-800">
              <button
                type="button"
                onClick={() => setCurrentFormat('FEED_PORTRAIT')}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                  currentFormat === 'FEED_PORTRAIT'
                    ? 'bg-primary text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Feed 4:5 (IG)
              </button>
              <button
                type="button"
                onClick={() => setCurrentFormat('FEED_SQUARE')}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                  currentFormat === 'FEED_SQUARE'
                    ? 'bg-primary text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Square 1:1
              </button>
              <button
                type="button"
                onClick={() => setCurrentFormat('STORY')}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                  currentFormat === 'STORY'
                    ? 'bg-primary text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Story 9:16
              </button>
            </div>

            {/* Smartphone Frame Toggle */}
            <button
              type="button"
              onClick={() => setShowPhoneFrame((v) => !v)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                showPhoneFrame
                  ? 'bg-primary/10 border-primary/40 text-primary'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="size-3.5" />
              <span>{showPhoneFrame ? 'Bingkai HP Aktif' : 'Tampilan Bersih'}</span>
            </button>
          </div>

          {/* Active Canvas Viewport */}
          <div className="w-full flex justify-center py-2 transition-all duration-300">
            <CanvasRenderer
              slide={currentSlide}
              style={currentStyle}
              format={currentFormat}
              handle={handle}
              brandName={brandName}
              totalSlides={slides.length}
              showPhoneFrame={showPhoneFrame}
            />
          </div>

          {/* Carousel Slide Navigator */}
          <div className="flex items-center justify-between w-full max-w-md pt-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={activeSlideIndex === 0}
              onClick={() => setActiveSlideIndex((prev) => Math.max(0, prev - 1))}
              className="flex items-center gap-1.5 text-xs font-bold bg-slate-900 border-slate-800 hover:bg-slate-800"
            >
              <ChevronLeft className="size-4" /> Sebelumnya
            </Button>

            {/* Slide Pagination Dots */}
            <div className="flex items-center gap-1.5">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveSlideIndex(idx)}
                  className={`h-2.5 rounded-full transition-all ${
                    idx === activeSlideIndex
                      ? 'bg-primary w-6'
                      : 'bg-slate-700 hover:bg-slate-500 w-2.5'
                  }`}
                  aria-label={`Pindah ke slide ${idx + 1}`}
                />
              ))}
            </div>

            <Button
              variant="secondary"
              size="sm"
              disabled={activeSlideIndex === slides.length - 1}
              onClick={() => setActiveSlideIndex((prev) => Math.min(slides.length - 1, prev + 1))}
              className="flex items-center gap-1.5 text-xs font-bold bg-slate-900 border-slate-800 hover:bg-slate-800"
            >
              Lanjut <ChevronRight className="size-4" />
            </Button>
          </div>

          {/* Slide Thumbnail Strip */}
          <div className="w-full pt-4 border-t border-slate-800/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Daftar Slide ({slides.length}):
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleAddSlide}
                className="h-7 px-2 text-[11px] font-bold text-primary hover:bg-primary/10"
              >
                <Plus className="size-3 mr-1" /> Tambah Slide
              </Button>
            </div>

            <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-thin">
              {slides.map((s, idx) => {
                const isActive = idx === activeSlideIndex;
                return (
                  <div
                    key={idx}
                    onClick={() => setActiveSlideIndex(idx)}
                    className={`relative p-2.5 rounded-xl cursor-pointer border transition-all shrink-0 w-24 text-left ${
                      isActive
                        ? 'bg-primary/15 border-primary ring-2 ring-primary/40 shadow-lg'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono font-bold text-slate-400">
                        #{idx + 1}
                      </span>
                      <span className="text-[9px] font-black uppercase text-primary">
                        {s.type}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-300 font-medium line-clamp-2 leading-tight">
                      {s.headline || s.takeaway || s.ctaText || `Slide ${idx + 1}`}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ─── RIGHT COLUMN: INSPECTOR DOCK (STYLES, LIVE EDIT, CAPTION) ─── */}
        <div className="lg:col-span-5 space-y-6">
          {/* Tabs Navigation */}
          <div className="flex items-center bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800 shadow-xl">
            <button
              type="button"
              onClick={() => setActiveTab('styles')}
              className={`flex-1 py-2.5 px-3 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'styles'
                  ? 'bg-primary text-white shadow-lg shadow-primary/25'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <Palette className="size-3.5" /> 1-Klik Gaya ({STYLES.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('editor')}
              className={`flex-1 py-2.5 px-3 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'editor'
                  ? 'bg-primary text-white shadow-lg shadow-primary/25'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <Sliders className="size-3.5" /> Edit Slide {activeSlideIndex + 1}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('caption')}
              className={`flex-1 py-2.5 px-3 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'caption'
                  ? 'bg-primary text-white shadow-lg shadow-primary/25'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <FileText className="size-3.5" /> Caption
            </button>
          </div>

          {/* TAB 1: 1-Click Multi-Template Switcher */}
          {activeTab === 'styles' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="size-4 text-primary" /> 10 Preset Desain Media Indonesia:
                </p>
                <span className="text-[11px] font-mono text-primary font-bold">1-Klik Ganti</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[480px] overflow-y-auto pr-1">
                {STYLES.map((style) => {
                  const isSelected = currentStyle === style.id;
                  const isLocked = isProStyle(style.id) && !isProUser;

                  return (
                    <div
                      key={style.id}
                      onClick={() => {
                        if (isLocked) {
                          setUpgradeTitle(`Template ${style.label} Terkunci 🔒`);
                          setUpgradeReason('PRO_STYLE');
                          setShowUpgradeModal(true);
                          return;
                        }
                        setCurrentStyle(style.id);
                      }}
                      className={`p-3.5 rounded-2xl cursor-pointer border transition-all duration-200 flex flex-col justify-between ${
                        isSelected
                          ? 'bg-primary/10 border-primary shadow-xl ring-2 ring-primary/40'
                          : isLocked
                          ? 'bg-slate-950/40 border-slate-800/60 opacity-80 hover:opacity-100 hover:border-amber-500/40'
                          : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <span
                              className="size-3 rounded-full shrink-0"
                              style={{ backgroundColor: style.accentColor }}
                            />
                            <span className="font-bold text-xs text-white truncate">
                              {style.label}
                            </span>
                          </div>
                          {isSelected ? (
                            <div className="size-4 rounded-full bg-primary flex items-center justify-center text-white shrink-0">
                              <Check className="size-2.5 stroke-[3]" />
                            </div>
                          ) : isLocked ? (
                            <span className="inline-flex items-center gap-0.5 text-[9px] font-black px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
                              <Lock className="size-2.5" /> PRO
                            </span>
                          ) : style.badge ? (
                            <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
                              GRATIS
                            </span>
                          ) : null}
                        </div>

                        {style.subLabel && (
                          <p className="text-[11px] font-semibold text-primary/90 mb-1">
                            {style.subLabel}
                          </p>
                        )}

                        <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                          {style.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Watermark & Branding Customizer */}
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Watermark & Identitas Media:
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-[11px] text-slate-400 font-semibold mb-1 block">
                      Instagram Handle
                    </Label>
                    <Input
                      value={handle}
                      onChange={(e) => setHandle(e.target.value)}
                      placeholder="@namamedia"
                      className="h-9 text-xs bg-slate-950 border-slate-800"
                    />
                  </div>
                  <div>
                    <Label className="text-[11px] text-slate-400 font-semibold mb-1 block">
                      Nama Brand / Redaksi
                    </Label>
                    <Input
                      value={brandName}
                      onChange={(e) => setBrandName(e.target.value)}
                      placeholder="MEDIA UPDATE"
                      className="h-9 text-xs bg-slate-950 border-slate-800"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Live Slide Text & Visual Editor */}
          {activeTab === 'editor' && (
            <div className="space-y-4 bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-bold text-primary uppercase">
                  Mengedit Slide #{activeSlideIndex + 1} ({currentSlide.type})
                </span>
                {slides.length > 2 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveSlide(activeSlideIndex)}
                    className="h-7 px-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-950/40"
                  >
                    <Trash2 className="size-3.5 mr-1" /> Hapus Slide
                  </Button>
                )}
              </div>

              {/* Tag / Category Badge */}
              <div>
                <Label className="text-xs text-slate-400 font-semibold mb-1 block">
                  Kategori Badge Slide (Opsional)
                </Label>
                <Input
                  value={currentSlide.tag || ''}
                  onChange={(e) => updateActiveSlide({ tag: e.target.value })}
                  placeholder="Contoh: BREAKING, TIPS, POIN 1..."
                  className="h-9 text-xs bg-slate-950 border-slate-800"
                />
              </div>

              {/* Slide Cover Fields */}
              {currentSlide.type === 'COVER' && (
                <>
                  <div>
                    <Label className="text-xs text-slate-400 font-semibold mb-1 block">
                      Headline Cover
                    </Label>
                    <Input
                      value={currentSlide.headline || ''}
                      onChange={(e) => updateActiveSlide({ headline: e.target.value })}
                      placeholder="Headline yang memikat..."
                      className="text-sm font-bold bg-slate-950 border-slate-800"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-slate-400 font-semibold mb-1 block">
                      Sub-headline / Lead Text
                    </Label>
                    <textarea
                      value={currentSlide.lead || ''}
                      onChange={(e) => updateActiveSlide({ lead: e.target.value })}
                      rows={3}
                      className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3 text-xs text-slate-200 focus:ring-2 focus:ring-primary outline-none"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-slate-400 font-semibold mb-1 block">
                      URL Gambar Latar Cover (Opsional)
                    </Label>
                    <Input
                      value={currentSlide.imageUrl || ''}
                      onChange={(e) => updateActiveSlide({ imageUrl: e.target.value })}
                      placeholder="https://..."
                      className="h-9 text-xs bg-slate-950 border-slate-800"
                    />
                  </div>
                </>
              )}

              {/* Slide Point Fields */}
              {currentSlide.type === 'POINT' && (
                <>
                  <div>
                    <Label className="text-xs text-slate-400 font-semibold mb-1 block">
                      Inti Poin (Takeaway)
                    </Label>
                    <Input
                      value={currentSlide.takeaway || ''}
                      onChange={(e) => updateActiveSlide({ takeaway: e.target.value })}
                      placeholder="Poin utama..."
                      className="text-sm font-bold bg-slate-950 border-slate-800"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-slate-400 font-semibold mb-1 block">
                      Penjelasan Lengkap
                    </Label>
                    <textarea
                      value={currentSlide.supportingText || ''}
                      onChange={(e) => updateActiveSlide({ supportingText: e.target.value })}
                      rows={3}
                      className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3 text-xs text-slate-200 focus:ring-2 focus:ring-primary outline-none"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-slate-400 font-semibold mb-1 block">
                      URL Foto Ilustrasi Slide Ini
                    </Label>
                    <Input
                      value={currentSlide.imageUrl || ''}
                      onChange={(e) => updateActiveSlide({ imageUrl: e.target.value })}
                      placeholder="https://images.unsplash.com/..."
                      className="h-9 text-xs bg-slate-950 border-slate-800"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-slate-400 font-semibold mb-1 block">
                      Highlight Data / Angka Kunci (Opsional)
                    </Label>
                    <Input
                      value={currentSlide.statHighlight || ''}
                      onChange={(e) => updateActiveSlide({ statHighlight: e.target.value })}
                      placeholder="Contoh: Pertumbuhan: +24% atau Nilai: Rp 15 Triliun..."
                      className="h-9 text-xs bg-slate-950 border-slate-800"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-slate-400 font-semibold mb-1 block">
                      Kutipan Narasumber (Opsional)
                    </Label>
                    <Input
                      value={currentSlide.sourceQuote || ''}
                      onChange={(e) => updateActiveSlide({ sourceQuote: e.target.value })}
                      placeholder="Kutipan..."
                      className="h-9 text-xs bg-slate-950 border-slate-800"
                    />
                  </div>
                </>
              )}

              {/* Slide Outro Fields */}
              {currentSlide.type === 'OUTRO' && (
                <>
                  <div>
                    <Label className="text-xs text-slate-400 font-semibold mb-1 block">
                      Kalimat CTA Utama
                    </Label>
                    <Input
                      value={currentSlide.ctaText || ''}
                      onChange={(e) => updateActiveSlide({ ctaText: e.target.value })}
                      placeholder="Bagikan sekarang..."
                      className="text-sm font-bold bg-slate-950 border-slate-800"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-slate-400 font-semibold mb-1 block">
                      Pesan Ajakan Lanjutan
                    </Label>
                    <Input
                      value={currentSlide.secondaryCta || ''}
                      onChange={(e) => updateActiveSlide({ secondaryCta: e.target.value })}
                      placeholder="Follow @namamedia kami..."
                      className="h-9 text-xs bg-slate-950 border-slate-800"
                    />
                  </div>
                </>
              )}

              {/* Source Attribution */}
              <div>
                <Label className="text-xs text-slate-400 font-semibold mb-1 block">
                  Label Sumber (Footer)
                </Label>
                <Input
                  value={currentSlide.source || ''}
                  onChange={(e) => updateActiveSlide({ source: e.target.value })}
                  placeholder="Sumber: Detik / Kompas..."
                  className="h-9 text-xs bg-slate-950 border-slate-800"
                />
              </div>
            </div>
          )}

          {/* TAB 3: Caption & Viral Hashtags */}
          {activeTab === 'caption' && (
            <div className="space-y-4 bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Caption Postingan Instagram:
                </span>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleCopyCaption}
                  className="text-xs font-bold bg-slate-800 text-slate-200 hover:bg-slate-700"
                >
                  {copiedCaption ? <Check className="size-3.5 text-emerald-400 mr-1" /> : <Copy className="size-3.5 mr-1" />}
                  {copiedCaption ? 'Tersalin!' : 'Salin Semua'}
                </Button>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed font-sans space-y-3 max-h-[380px] overflow-y-auto">
                <p className="font-bold text-white text-sm">{initialContent.headline}</p>
                <p className="whitespace-pre-line">{initialContent.caption}</p>
                <p className="font-semibold text-primary">👉 {initialContent.cta}</p>
                <div className="flex flex-wrap gap-1.5 pt-3 border-t border-slate-800">
                  {initialContent.hashtags.map((tag, i) => (
                    <span key={i} className="text-cyan-400 font-mono text-[11px] bg-cyan-950/40 px-2 py-0.5 rounded-md border border-cyan-800/40">
                      {tag.startsWith('#') ? tag : `#${tag}`}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modal Upgrade Pop-up when clicking locked Pro templates / features */}
      <UpgradeDialog
        open={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        title={upgradeTitle}
        reason={upgradeReason}
      />
    </div>
  );
}
