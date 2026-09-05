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
  Upload,
  Image as ImageIcon,
  Eye,
  Search,
  Wand2,
  Type,
  LayoutGrid,
  ArrowRight,
} from 'lucide-react';
import { STYLES, isProStyle, type StyleDef } from '@/config/styles';
import { CanvasRenderer, type SlideData, type SlideLayoutVariant } from '@/components/studio/canvas-renderer';
import { StockPhotoModal } from '@/components/studio/stock-photo-modal';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/input';
import { downloadSlideAsPng, exportSlidesToPdf, exportSlidesToZip } from '@/lib/export-client';
import { UpgradeDialog } from '@/components/billing/upgrade-dialog';
import { TemplatePreviewModal } from '@/components/generate/template-preview-modal';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { cn } from '@/lib/utils';

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
  initialBrandKit?: {
    handle?: string | null;
    brandName?: string | null;
    logoUrl?: string | null;
    hideNewslyWatermark?: boolean;
  };
};

export function CarouselStudio({
  initialContent,
  article,
  initialStyle = 'BREAKING_NEWS',
  initialFormat = 'FEED_PORTRAIT',
  isProUser = false,
  initialBrandKit,
}: CarouselStudioProps) {
  const [currentStyle, setCurrentStyle] = React.useState<DesignStyle>(initialStyle);
  const [currentFormat, setCurrentFormat] = React.useState<OutputFormat>(initialFormat);
  const [activeSlideIndex, setActiveSlideIndex] = React.useState(0);
  const [showPhoneFrame, setShowPhoneFrame] = React.useState(true);
  const [mobileView, setMobileView] = React.useState<'preview' | 'edit'>('preview');
  const [showUpgradeModal, setShowUpgradeModal] = React.useState(false);
  const [upgradeReason, setUpgradeReason] = React.useState<'PRO_STYLE' | 'PDF_EXPORT'>('PRO_STYLE');
  const [upgradeTitle, setUpgradeTitle] = React.useState('Buka Template Eksklusif Pro');
  const [selectedPreviewStyle, setSelectedPreviewStyle] = React.useState<StyleDef | null>(null);
  const [handle, setHandle] = React.useState(initialBrandKit?.handle || '@newsly.ai');
  const [brandName, setBrandName] = React.useState(initialBrandKit?.brandName || 'NEWSLY AI');
  const [logoUrl, setLogoUrl] = React.useState<string | null>(initialBrandKit?.logoUrl || null);
  const [hideNewslyWatermark, setHideNewslyWatermark] = React.useState<boolean>(
    initialBrandKit?.hideNewslyWatermark ?? false
  );
  const [copiedCaption, setCopiedCaption] = React.useState(false);
  const [isExportingPdf, setIsExportingPdf] = React.useState(false);
  const [isExportingPng, setIsExportingPng] = React.useState(false);
  const [isExportingZip, setIsExportingZip] = React.useState(false);
  const [viralHooks, setViralHooks] = React.useState<string[]>([]);
  const [activeTab, setActiveTab] = React.useState<'styles' | 'editor' | 'caption'>('styles');
  const [styleCategory, setStyleCategory] = React.useState<'ALL' | 'FREE' | 'PRO' | 'NEWS' | 'BIZ' | 'MODERN'>('ALL');
  const [customAccentColor, setCustomAccentColor] = React.useState<string | undefined>(undefined);
  const [fontFamily, setFontFamily] = React.useState<string>('font-sans');
  const [isStockModalOpen, setIsStockModalOpen] = React.useState(false);
  const [isPolishing, setIsPolishing] = React.useState(false);
  const [polishField, setPolishField] = React.useState<'headline' | 'takeaway' | 'lead' | 'supportingText' | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const filteredStudioStyles = React.useMemo(() => {
    return STYLES.filter((style) => {
      if (styleCategory === 'FREE') return style.tier === 'FREE';
      if (styleCategory === 'PRO') return style.tier === 'PRO';
      if (styleCategory === 'NEWS') {
        return ['EDITORIAL', 'BOLD', 'CORPORATE', 'POLICY', 'SPOTLIGHT', 'RED_COLLAGE'].includes(style.id);
      }
      if (styleCategory === 'BIZ') {
        return ['FINANCE', 'BLOOMBERG', 'CORPORATE', 'MINIMAL'].includes(style.id);
      }
      if (styleCategory === 'MODERN') {
        return ['STREETWEAR', 'ATHLETIC', 'TERMINAL', 'TECH', 'COSMIC', 'PODCAST', 'CULINARY', 'LIFESTYLE', 'MODERN'].includes(style.id);
      }
      return true;
    });
  }, [styleCategory]);

  // Parse slides
  const [slides, setSlides] = React.useState<SlideData[]>(() => {
    if (Array.isArray(initialContent.slides) && initialContent.slides.length > 0) {
      return initialContent.slides.map((s, idx) => ({
        index: idx,
        type: s.type || (idx === 0 ? 'COVER' : idx === initialContent.slides.length - 1 ? 'OUTRO' : 'POINT'),
        layoutVariant: s.layoutVariant,
        tag: s.tag,
        headline: s.headline || (idx === 0 ? initialContent.headline : s.title),
        lead: s.lead || s.body,
        pointNumber: s.pointNumber || (idx === 0 ? undefined : idx),
        takeaway: s.takeaway || s.title || s.headline,
        supportingText: s.supportingText || s.body,
        statHighlight: s.statHighlight,
        sourceQuote: s.sourceQuote,
        ctaText: s.ctaText || initialContent.cta,
        secondaryCta: s.secondaryCta,
        imageUrl: s.imageUrl || article.imageUrl,
        author: article.author,
        source: article.source,
      }));
    }

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
        takeaway: 'Latar Belakang & Kejadian Utama',
        supportingText: 'Pihak terkait telah mengonfirmasi langkah-langkah strategis yang sedang diambil untuk menangani situasi terkini.',
        source: article.source,
      },
      {
        index: 2,
        type: 'POINT',
        takeaway: 'Dampak & Fakta Kunci',
        supportingText: 'Analisis menunjukkan adanya pengaruh langsung terhadap sektor terkait serta masyarakat luas.',
        source: article.source,
      },
      {
        index: 3,
        type: 'POINT',
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

  const updateActiveSlide = (patch: Partial<SlideData>) => {
    setSlides((prev) =>
      prev.map((s, idx) => (idx === activeSlideIndex ? { ...s, ...patch } : s))
    );
  };

  const handleCustomPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        updateActiveSlide({ imageUrl: dataUrl });
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleAddSlide = () => {
    if (slides.length >= 10) return;
    const newIdx = slides.length;
    const newSlide: SlideData = {
      index: newIdx,
      type: 'POINT',
      takeaway: `Poin Pembahasan Baru #${newIdx}`,
      supportingText: 'Tuliskan rincian penjelasan dan fakta penting untuk slide ini di sini.',
      source: article.source,
      imageUrl: currentSlide.imageUrl || article.imageUrl,
    };
    setSlides([...slides, newSlide]);
    setActiveSlideIndex(newIdx);
  };

  const handleRemoveSlide = (indexToRemove: number) => {
    if (slides.length <= 2) return;
    const filtered = slides.filter((_, idx) => idx !== indexToRemove);
    const reindexed = filtered.map((s, idx) => ({
      ...s,
      index: idx,
      type: (idx === 0 ? 'COVER' : idx === filtered.length - 1 ? 'OUTRO' : 'POINT') as any,
    }));
    setSlides(reindexed);
    setActiveSlideIndex(Math.max(0, Math.min(activeSlideIndex, reindexed.length - 1)));
  };

  const handleMoveSlide = (direction: 'left' | 'right') => {
    const fromIndex = activeSlideIndex;
    const toIndex = direction === 'left' ? fromIndex - 1 : fromIndex + 1;
    if (toIndex < 0 || toIndex >= slides.length) return;

    setSlides((prev) => {
      const next = [...prev];
      const temp = next[fromIndex];
      next[fromIndex] = next[toIndex];
      next[toIndex] = temp;
      return next.map((s, i) => ({
        ...s,
        index: i,
        type: (i === 0 ? 'COVER' : i === next.length - 1 ? 'OUTRO' : 'POINT') as any,
      }));
    });
    setActiveSlideIndex(toIndex);
  };

  const handleAiPolish = async (
    field: 'headline' | 'takeaway' | 'lead' | 'supportingText',
    mode: 'SHORTEN' | 'HOOK' | 'FORMAL' | 'CASUAL'
  ) => {
    const currentText = currentSlide[field];
    if (!currentText) return;

    setIsPolishing(true);
    setPolishField(field);
    try {
      const res = await fetch('/api/ai-polish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: currentText, mode }),
      });
      const data = await res.json();
      if (data.success && data.polishedText) {
        updateActiveSlide({ [field]: data.polishedText });
      }
    } catch (err) {
      console.error('AI polish error:', err);
    } finally {
      setIsPolishing(false);
      setPolishField(null);
    }
  };

  const handleCopyCaption = async () => {
    const fullCaption = `${initialContent.caption}\n\n${(initialContent.hashtags || []).join(' ')}`;
    try {
      await navigator.clipboard.writeText(fullCaption);
      setCopiedCaption(true);
      setTimeout(() => setCopiedCaption(false), 2000);
    } catch {
      setCopiedCaption(false);
    }
  };

  const handleDownloadCurrentPng = async () => {
    setIsExportingPng(true);
    try {
      await downloadSlideAsPng(activeSlideIndex, initialContent.headline || 'slide');
    } finally {
      setIsExportingPng(false);
    }
  };

  const handleDownloadZip = async () => {
    setIsExportingZip(true);
    try {
      await exportSlidesToZip(slides.length, initialContent.headline || 'newsly-carousel');
    } finally {
      setIsExportingZip(false);
    }
  };

  const handleExportPdf = async () => {
    if (!isProUser && isProStyle(currentStyle)) {
      setUpgradeTitle('Ekspor PDF Carousel Berkualitas Tinggi 📄');
      setUpgradeReason('PDF_EXPORT');
      setShowUpgradeModal(true);
      return;
    }

    setIsExportingPdf(true);
    try {
      await exportSlidesToPdf(slides.length, initialContent.headline || 'carousel');
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col pb-24 lg:pb-12 transition-colors duration-200">
      {/* Hidden File Input for Custom Image Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleCustomPhotoUpload}
        accept="image/*"
        className="hidden"
      />

      {/* ─── 1. TOP APP BAR ─── */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800/80 px-4 sm:px-6 py-3 transition-colors duration-200">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Button asChild variant="ghost" size="sm" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white shrink-0">
              <Link href="/dashboard" className="flex items-center gap-1.5 text-xs font-semibold">
                <ArrowLeft className="size-4" /> Kembali
              </Link>
            </Button>
            <div className="h-5 w-px bg-slate-200 dark:bg-slate-800 shrink-0" />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-primary/10 dark:bg-primary/20 text-primary border border-primary/20 uppercase tracking-wider">
                  Studio Editor
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 truncate hidden sm:inline">
                  {article.source || 'Newsly AI'}
                </span>
              </div>
              <h1 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate max-w-md lg:max-w-xl">
                {initialContent.headline || article.title}
              </h1>
            </div>
          </div>

          {/* Quick Actions & Theme Switcher */}
          <div className="flex flex-wrap items-center gap-2 shrink-0 w-full md:w-auto justify-between md:justify-end">
            <ThemeToggle />

            <div className="flex items-center gap-1.5">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleCopyCaption}
                className="flex items-center gap-1 text-xs font-bold bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800"
              >
                {copiedCaption ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
                <span className="hidden sm:inline">{copiedCaption ? 'Tersalin!' : 'Salin Caption'}</span>
                <span className="sm:hidden">{copiedCaption ? 'Tersalin' : 'Caption'}</span>
              </Button>

              <Button
                variant="secondary"
                size="sm"
                disabled={isExportingPng}
                onClick={handleDownloadCurrentPng}
                className="flex items-center gap-1 text-xs font-bold bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800"
              >
                <Download className="size-3.5 text-slate-600 dark:text-slate-400" />
                <span className="hidden sm:inline">PNG Slide {activeSlideIndex + 1}</span>
                <span className="sm:hidden">Slide {activeSlideIndex + 1}</span>
              </Button>

              <Button
                variant="secondary"
                size="sm"
                disabled={isExportingZip}
                onClick={handleDownloadZip}
                className="flex items-center gap-1 text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900 shadow-sm"
              >
                <Download className="size-3.5 text-indigo-600 dark:text-indigo-400" />
                <span className="hidden sm:inline">{isExportingZip ? 'Mengemas...' : 'Semua PNG (.ZIP)'}</span>
                <span className="sm:hidden">{isExportingZip ? 'ZIP...' : '.ZIP'}</span>
              </Button>

              <Button
                size="sm"
                disabled={isExportingPdf}
                onClick={handleExportPdf}
                className="flex items-center gap-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/25"
              >
                <FileDown className="size-3.5" />
                <span>{isExportingPdf ? 'PDF...' : 'PDF'}</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* ─── 2. SPLIT-SCREEN WORKSPACE ─── */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 items-start">
        {/* Mobile View Mode Switcher */}
        <div className="col-span-1 lg:hidden w-full bg-white dark:bg-slate-900/90 p-1 rounded-2xl border border-slate-200 dark:border-slate-800 flex gap-1 shadow-lg">
          <button
            type="button"
            onClick={() => setMobileView('preview')}
            className={cn(
              'flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all',
              mobileView === 'preview'
                ? 'bg-primary text-white shadow-md'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            )}
          >
            <Smartphone className="size-3.5" />
            <span>Preview ({activeSlideIndex + 1}/{slides.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileView('edit')}
            className={cn(
              'flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all',
              mobileView === 'edit'
                ? 'bg-primary text-white shadow-md'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            )}
          >
            <Sliders className="size-3.5" />
            <span>Edit Konten & Desain</span>
          </button>
        </div>

        {/* ─── LEFT/CENTER COLUMN: CANVAS PREVIEW & CONTROLS ─── */}
        <div
          className={cn(
            'lg:col-span-7 flex flex-col items-center space-y-5 bg-white/80 dark:bg-slate-900/40 p-3 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800/80 shadow-xl backdrop-blur-sm transition-colors duration-200',
            mobileView !== 'preview' && 'hidden lg:flex'
          )}
        >
          {/* Format & View Mode Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 w-full border-b border-slate-200 dark:border-slate-800/80 pb-4">
            {/* Format Pills */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setCurrentFormat('FEED_PORTRAIT')}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                  currentFormat === 'FEED_PORTRAIT'
                    ? 'bg-primary text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
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
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
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
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Story 9:16
              </button>
            </div>

            {/* Quick Upload Photo Button */}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="h-8 px-3 text-xs font-bold bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-cyan-700 dark:text-cyan-300 hover:bg-slate-200 dark:hover:bg-slate-800 flex items-center gap-1.5 shadow-sm"
            >
              <Upload className="size-3.5" />
              <span>Ganti Foto Slide Ini</span>
            </Button>
          </div>

          {/* Canvas Render Area */}
          <div className="w-full flex items-center justify-center py-2 sm:py-4">
            <div className="w-full max-w-[340px] sm:max-w-[440px] relative">
              <CanvasRenderer
                slide={currentSlide}
                style={currentStyle}
                format={currentFormat}
                handle={handle}
                brandName={brandName}
                logoUrl={logoUrl}
                hideNewslyWatermark={hideNewslyWatermark}
                totalSlides={slides.length}
                showPhoneFrame={showPhoneFrame}
                customAccent={customAccentColor}
                fontFamily={fontFamily}
              />
            </div>
          </div>

          {/* Slide Navigation Strip */}
          <div className="w-full flex flex-col items-center space-y-3 pt-2">
            <div className="flex items-center justify-between w-full max-w-sm px-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={activeSlideIndex === 0}
                onClick={() => setActiveSlideIndex((prev) => Math.max(0, prev - 1))}
                className="h-8 px-3 text-xs bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:text-white disabled:opacity-30"
              >
                <ChevronLeft className="size-4 mr-1" /> Prev
              </Button>

              <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
                Poin {activeSlideIndex + 1} dari {slides.length}
              </span>

              <Button
                variant="secondary"
                size="sm"
                disabled={activeSlideIndex === slides.length - 1}
                onClick={() => setActiveSlideIndex((prev) => Math.min(slides.length - 1, prev + 1))}
                className="h-8 px-3 text-xs bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:text-white disabled:opacity-30"
              >
                Next <ChevronRight className="size-4 ml-1" />
              </Button>
            </div>

            {/* Thumbnail Strip */}
            <div className="flex items-center gap-2 overflow-x-auto w-full p-2 max-w-lg justify-start sm:justify-center">
              {slides.map((s, idx) => (
                <div
                  key={idx}
                  onClick={() => setActiveSlideIndex(idx)}
                  className={`size-12 rounded-xl border flex flex-col items-center justify-center cursor-pointer transition-all shrink-0 ${
                    activeSlideIndex === idx
                      ? 'border-primary bg-primary/10 dark:bg-primary/20 text-primary dark:text-white shadow-lg ring-2 ring-primary/40'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60 text-slate-500 dark:text-slate-400 hover:border-slate-400 dark:hover:border-slate-700'
                  }`}
                >
                  <span className="text-[10px] font-mono font-bold">#{idx + 1}</span>
                  <span className="text-[8px] uppercase font-semibold text-slate-400 truncate max-w-[40px]">
                    {s.type === 'COVER' ? 'Cover' : s.type === 'OUTRO' ? 'CTA' : `P${idx}`}
                  </span>
                </div>
              ))}

              {slides.length < 10 && (
                <button
                  type="button"
                  onClick={handleAddSlide}
                  className="size-12 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950/40 text-slate-400 hover:border-primary hover:text-primary flex items-center justify-center transition-colors shrink-0"
                  title="Tambah Slide Baru"
                >
                  <Plus className="size-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ─── RIGHT COLUMN: INSPECTOR DOCK (20 STYLES, LIVE EDIT, CAPTION) ─── */}
        <div
          className={cn(
            'lg:col-span-5 space-y-6',
            mobileView !== 'edit' && 'hidden lg:block'
          )}
        >
          {/* Tabs Navigation */}
          <div className="flex items-center bg-white dark:bg-slate-900/80 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md">
            <button
              type="button"
              onClick={() => setActiveTab('styles')}
              className={`flex-1 py-2.5 px-3 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'styles'
                  ? 'bg-primary text-white shadow-lg shadow-primary/25'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/40'
              }`}
            >
              <Palette className="size-3.5" /> 20 Template
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('editor')}
              className={`flex-1 py-2.5 px-3 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'editor'
                  ? 'bg-primary text-white shadow-lg shadow-primary/25'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/40'
              }`}
            >
              <Sliders className="size-3.5" /> Edit Teks & Foto
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('caption')}
              className={`flex-1 py-2.5 px-3 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'caption'
                  ? 'bg-primary text-white shadow-lg shadow-primary/25'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/40'
              }`}
            >
              <FileText className="size-3.5" /> Caption
            </button>
          </div>

          {/* TAB 1: 20 Multi-Template Switcher with Preview Button */}
          {activeTab === 'styles' && (
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="size-4 text-primary" /> 20 Preset Desain:
                </p>
                <span className="text-[11px] font-mono text-primary font-bold">1-Klik Ganti</span>
              </div>

              {/* Horizontal Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5 -mx-1 px-1">
                {[
                  { id: 'ALL', label: '⭐ Semua' },
                  { id: 'FREE', label: '🆓 Gratis' },
                  { id: 'PRO', label: '👑 PRO' },
                  { id: 'NEWS', label: '📰 Berita' },
                  { id: 'BIZ', label: '💼 Bisnis' },
                  { id: 'MODERN', label: '⚡ Gen-Z' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setStyleCategory(cat.id as any)}
                    className={`shrink-0 px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all ${
                      styleCategory === cat.id
                        ? 'bg-primary text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Compact 2-Column Responsive Grid (No Long Vertical Scroll on Mobile) */}
              <div className="grid grid-cols-2 gap-2 sm:gap-3 max-h-[360px] sm:max-h-[460px] overflow-y-auto pr-1">
                {filteredStudioStyles.map((style) => {
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
                      className={`p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl cursor-pointer border transition-all duration-200 flex flex-col justify-between ${
                        isSelected
                          ? 'bg-primary/10 border-primary shadow-lg ring-2 ring-primary/40'
                          : isLocked
                          ? 'bg-slate-100/60 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800/60 opacity-80 hover:opacity-100 hover:border-amber-500/40'
                          : 'bg-white dark:bg-slate-900/70 border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 shadow-sm'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span
                              className="size-2.5 sm:size-3 rounded-full shrink-0"
                              style={{ backgroundColor: style.accentColor }}
                            />
                            <span className="font-bold text-[11px] sm:text-xs text-slate-900 dark:text-white truncate">
                              {style.label}
                            </span>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            {/* Preview Eye Button */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedPreviewStyle(style);
                              }}
                              className="p-1 rounded-md text-slate-400 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                              title="Lihat Pratinjau 5 Slide"
                            >
                              <Eye className="size-3 sm:size-3.5" />
                            </button>

                            {isSelected ? (
                              <div className="size-3.5 sm:size-4 rounded-full bg-primary flex items-center justify-center text-white shrink-0">
                                <Check className="size-2 sm:size-2.5 stroke-[3]" />
                              </div>
                            ) : isLocked ? (
                              <span className="inline-flex items-center gap-0.5 text-[8px] sm:text-[9px] font-black px-1.5 py-0.2 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-300 border border-amber-500/30 shrink-0">
                                <Lock className="size-2" /> PRO
                              </span>
                            ) : null}
                          </div>
                        </div>

                        {style.subLabel && (
                          <p className="text-[10px] sm:text-[11px] font-semibold text-primary/90 mb-1 truncate">
                            {style.subLabel}
                          </p>
                        )}

                        <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 sm:line-clamp-2 leading-tight">
                          {style.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Custom Color Palette & Typography Switcher */}
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3.5">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Palette className="size-3.5 text-primary" /> Warna Aksen Brand:
                    </p>
                    {customAccentColor && (
                      <button
                        type="button"
                        onClick={() => setCustomAccentColor(undefined)}
                        className="text-[10px] font-bold text-red-500 hover:underline"
                      >
                        Reset Default
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {[
                      { color: '#EF4444', label: 'Merah' },
                      { color: '#10B981', label: 'Emerald' },
                      { color: '#F59E0B', label: 'Gold' },
                      { color: '#06B6D4', label: 'Cyan' },
                      { color: '#8B5CF6', label: 'Ungu' },
                      { color: '#F97316', label: 'Sunset' },
                      { color: '#6366F1', label: 'Indigo' },
                      { color: '#EC4899', label: 'Pink' },
                    ].map((p) => (
                      <button
                        key={p.color}
                        type="button"
                        onClick={() => setCustomAccentColor(p.color)}
                        className={`size-7 rounded-xl border-2 transition-transform hover:scale-110 shadow-sm ${
                          (customAccentColor || (STYLES.find((s) => s.id === currentStyle)?.accentColor)) === p.color
                            ? 'border-white ring-2 ring-primary scale-110'
                            : 'border-transparent'
                        }`}
                        style={{ backgroundColor: p.color }}
                        title={p.label}
                      />
                    ))}

                    {/* Native Hex Color Input */}
                    <div className="flex items-center gap-1.5 pl-1">
                      <input
                        type="color"
                        value={customAccentColor || (STYLES.find((s) => s.id === currentStyle)?.accentColor) || '#EF4444'}
                        onChange={(e) => setCustomAccentColor(e.target.value)}
                        className="size-7 rounded-xl border border-slate-300 dark:border-slate-700 cursor-pointer bg-transparent p-0.5"
                        title="Pilih warna heksadesimal bebas"
                      />
                      <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400">
                        {customAccentColor || (STYLES.find((s) => s.id === currentStyle)?.accentColor)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Typography Switcher */}
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Type className="size-3.5 text-primary" /> Gaya Tipografi Font:
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    {[
                      { id: 'font-sans', label: 'Modern Sans' },
                      { id: 'font-serif', label: 'Serif Koran' },
                      { id: 'font-bold-impact', label: 'Bold Impact' },
                      { id: 'font-mono', label: 'Tech Mono' },
                    ].map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setFontFamily(f.id)}
                        className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition-all text-center ${
                          fontFamily === f.id
                            ? 'bg-primary text-white border-primary shadow-sm'
                            : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-400'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Watermark & Branding Customizer */}
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Watermark & Identitas Media:
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold mb-1 block">
                      Instagram Handle
                    </Label>
                    <Input
                      value={handle}
                      onChange={(e) => setHandle(e.target.value)}
                      placeholder="@namamedia"
                      className="h-9 text-xs bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                    />
                  </div>
                  <div>
                    <Label className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold mb-1 block">
                      Nama Brand / Redaksi
                    </Label>
                    <Input
                      value={brandName}
                      onChange={(e) => setBrandName(e.target.value)}
                      placeholder="MEDIA UPDATE"
                      className="h-9 text-xs bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Live Slide Text & Custom Photo Editor */}
          {activeTab === 'editor' && (
            <div className="space-y-4 bg-white dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-primary uppercase">
                    Slide #{activeSlideIndex + 1} ({currentSlide.type})
                  </span>
                  {/* Reorder Slide Buttons */}
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={activeSlideIndex === 0}
                      onClick={() => handleMoveSlide('left')}
                      className="h-6 px-1.5 text-[10px] font-bold text-slate-500 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                      title="Tukar urutan ke kiri"
                    >
                      <ChevronLeft className="size-3 mr-0.5" /> Geser
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={activeSlideIndex === slides.length - 1}
                      onClick={() => handleMoveSlide('right')}
                      className="h-6 px-1.5 text-[10px] font-bold text-slate-500 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                      title="Tukar urutan ke kanan"
                    >
                      Geser <ChevronRight className="size-3 ml-0.5" />
                    </Button>
                  </div>
                </div>
                {slides.length > 2 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveSlide(activeSlideIndex)}
                    className="h-7 px-2 text-xs text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                  >
                    <Trash2 className="size-3.5 mr-1" /> Hapus Slide
                  </Button>
                )}
              </div>

              {/* Photo Replacement: Unsplash Search & Manual Upload */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <ImageIcon className="size-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">Foto Latar Slide #{activeSlideIndex + 1}</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">Cari Unsplash atau unggah manual</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Button
                    size="sm"
                    type="button"
                    onClick={() => setIsStockModalOpen(true)}
                    className="h-8 px-2.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm flex items-center gap-1 rounded-xl"
                  >
                    <Search className="size-3" /> Cari Foto
                  </Button>
                  <Button
                    size="sm"
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="h-8 px-2.5 text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl shadow-sm"
                  >
                    <Upload className="size-3 mr-1" /> Unggah
                  </Button>
                </div>
              </div>

              {/* 1-KLIK GANTI TATA LETAK SLIDE INI (SLIDE 2 KE ATAS) */}
              {currentSlide.type === 'POINT' && (
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <LayoutGrid className="size-3.5 text-primary" /> Tata Letak Slide #{activeSlideIndex + 1}:
                    </Label>
                    <span className="text-[10px] font-mono text-primary font-bold">1-Klik Ganti Bentuk</span>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: 'STAT_HERO', label: '⚡ Metrik Data' },
                      { id: 'IMAGE_TOP_TEXT_BOTTOM', label: '📸 Foto di Atas' },
                      { id: 'TEXT_CENTER', label: '🎯 Teks Tengah' },
                      { id: 'TEXT_BOTTOM', label: '📄 Teks Bawah' },
                      { id: 'QUOTE_CARD', label: '💬 Kutipan' },
                      { id: 'SPLIT_TWO_COL', label: '📊 2 Kolom' },
                    ].map((variant) => {
                      const isActive =
                        (currentSlide.layoutVariant ||
                          (activeSlideIndex === 1
                            ? 'STAT_HERO'
                            : activeSlideIndex === 2
                            ? 'IMAGE_TOP_TEXT_BOTTOM'
                            : activeSlideIndex === 3
                            ? 'QUOTE_CARD'
                            : 'TEXT_CENTER')) === variant.id;
                      return (
                        <button
                          key={variant.id}
                          type="button"
                          onClick={() => updateActiveSlide({ layoutVariant: variant.id as any })}
                          className={`py-1.5 px-2 rounded-xl text-[10px] sm:text-[11px] font-bold border transition-all truncate ${
                            isActive
                              ? 'bg-primary text-white border-primary shadow-sm ring-1 ring-primary/50'
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-400'
                          }`}
                        >
                          {variant.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Tag / Category Badge */}
              <div>
                <Label className="text-xs text-slate-500 dark:text-slate-400 font-semibold mb-1 block">
                  Kategori Badge Slide (Opsional)
                </Label>
                <Input
                  value={currentSlide.tag || ''}
                  onChange={(e) => updateActiveSlide({ tag: e.target.value })}
                  placeholder="Contoh: BREAKING, TIPS, INSIGHT..."
                  className="h-9 text-xs bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                />
              </div>

              {/* Slide Cover Fields */}
              {currentSlide.type === 'COVER' && (
                <>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">
                        Headline Cover
                      </Label>
                      {/* AI Polish Buttons for Headline */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={isPolishing}
                          onClick={() => handleAiPolish('headline', 'SHORTEN')}
                          className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 flex items-center gap-1 transition-all disabled:opacity-50"
                          title="Persingkat kalimat agar lebih padat"
                        >
                          <Wand2 className="size-2.5" /> ⚡ Singkat
                        </button>
                        <button
                          type="button"
                          disabled={isPolishing}
                          onClick={() => handleAiPolish('headline', 'HOOK')}
                          className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 flex items-center gap-1 transition-all disabled:opacity-50"
                          title="Ubah jadi hook viral penasaran"
                        >
                          🔥 Hook
                        </button>
                      </div>
                    </div>
                    <Input
                      value={currentSlide.headline || ''}
                      onChange={(e) => updateActiveSlide({ headline: e.target.value })}
                      placeholder="Headline yang memikat..."
                      className="text-sm font-bold bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                    />

                    {/* Viral Hook Suggestion Cards */}
                    {viralHooks.length > 0 && (
                      <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 space-y-1.5 animate-fade-in">
                        <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider block">
                          Pilih Variasi Judul (1-Klik untuk Terapkan):
                        </span>
                        {viralHooks.map((hook, hIdx) => (
                          <button
                            key={hIdx}
                            type="button"
                            onClick={() => {
                              updateActiveSlide({ headline: hook });
                              setViralHooks([]);
                            }}
                            className="w-full text-left p-2 rounded-lg text-xs font-semibold bg-white dark:bg-slate-900 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 transition-all truncate block"
                          >
                            {hook}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <Label className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">
                        Sub-headline / Lead Text
                      </Label>
                      <button
                        type="button"
                        disabled={isPolishing}
                        onClick={() => handleAiPolish('lead', 'SHORTEN')}
                        className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 flex items-center gap-1 transition-all disabled:opacity-50"
                      >
                        <Wand2 className="size-2.5" /> ⚡ Singkat
                      </button>
                    </div>
                    <textarea
                      value={currentSlide.lead || ''}
                      onChange={(e) => updateActiveSlide({ lead: e.target.value })}
                      rows={3}
                      className="w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 text-xs text-slate-900 dark:text-slate-200 focus:ring-2 focus:ring-primary outline-none"
                    />
                  </div>
                </>
              )}

              {/* Slide Point Fields */}
              {currentSlide.type === 'POINT' && (
                <>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <Label className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">
                        Poin Pembahasan / Takeaway
                      </Label>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={isPolishing}
                          onClick={() => handleAiPolish('takeaway', 'SHORTEN')}
                          className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 flex items-center gap-1 transition-all disabled:opacity-50"
                        >
                          <Wand2 className="size-2.5" /> ⚡ Singkat
                        </button>
                        <button
                          type="button"
                          disabled={isPolishing}
                          onClick={() => handleAiPolish('takeaway', 'HOOK')}
                          className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 flex items-center gap-1 transition-all disabled:opacity-50"
                        >
                          🔥 Hook
                        </button>
                      </div>
                    </div>
                    <Input
                      value={currentSlide.takeaway || ''}
                      onChange={(e) => updateActiveSlide({ takeaway: e.target.value })}
                      placeholder="Judul poin pembahasan..."
                      className="text-sm font-bold bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <Label className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">
                        Penjelasan Mendalam
                      </Label>
                      <button
                        type="button"
                        disabled={isPolishing}
                        onClick={() => handleAiPolish('supportingText', 'SHORTEN')}
                        className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 flex items-center gap-1 transition-all disabled:opacity-50"
                      >
                        <Wand2 className="size-2.5" /> ⚡ Singkat
                      </button>
                    </div>
                    <textarea
                      value={currentSlide.supportingText || ''}
                      onChange={(e) => updateActiveSlide({ supportingText: e.target.value })}
                      rows={3}
                      className="w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 text-xs text-slate-900 dark:text-slate-200 focus:ring-2 focus:ring-primary outline-none"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-slate-500 dark:text-slate-400 font-semibold mb-1 block">
                      Highlight Data / Angka Kunci (Opsional)
                    </Label>
                    <Input
                      value={currentSlide.statHighlight || ''}
                      onChange={(e) => updateActiveSlide({ statHighlight: e.target.value })}
                      placeholder="Contoh: Pertumbuhan: +24% atau Nilai: Rp 15 Triliun..."
                      className="h-9 text-xs bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-slate-500 dark:text-slate-400 font-semibold mb-1 block">
                      Kutipan Narasumber (Opsional)
                    </Label>
                    <Input
                      value={currentSlide.sourceQuote || ''}
                      onChange={(e) => updateActiveSlide({ sourceQuote: e.target.value })}
                      placeholder="Kutipan..."
                      className="h-9 text-xs bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                    />
                  </div>
                </>
              )}

              {/* Slide Outro Fields */}
              {currentSlide.type === 'OUTRO' && (
                <>
                  <div>
                    <Label className="text-xs text-slate-500 dark:text-slate-400 font-semibold mb-1 block">
                      Judul Kesimpulan
                    </Label>
                    <Input
                      value={currentSlide.takeaway || ''}
                      onChange={(e) => updateActiveSlide({ takeaway: e.target.value })}
                      placeholder="Kesimpulan..."
                      className="text-sm font-bold bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-slate-500 dark:text-slate-400 font-semibold mb-1 block">
                      Teks Ajakan (Call to Action)
                    </Label>
                    <Input
                      value={currentSlide.ctaText || ''}
                      onChange={(e) => updateActiveSlide({ ctaText: e.target.value })}
                      placeholder="Simpan postingan ini & bagikan ke tim Anda!"
                      className="text-xs bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                    />
                  </div>
                </>
              )}
            </div>
          )}

          {/* TAB 3: Auto-Generated Instagram Caption */}
          {activeTab === 'caption' && (
            <div className="space-y-4 bg-white dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Naskah Caption Instagram & LinkedIn
                </span>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleCopyCaption}
                  className="h-7 text-xs bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                >
                  {copiedCaption ? <Check className="size-3.5 text-emerald-500 mr-1" /> : <Copy className="size-3.5 mr-1" />}
                  {copiedCaption ? 'Tersalin!' : 'Salin Semua'}
                </Button>
              </div>

              <textarea
                readOnly
                value={`${initialContent.caption}\n\n${(initialContent.hashtags || []).join(' ')}`}
                rows={12}
                className="w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3.5 text-xs text-slate-800 dark:text-slate-300 leading-relaxed font-sans focus:ring-1 focus:ring-primary outline-none"
              />
            </div>
          )}
        </div>
      </main>

      {/* ─── UPGRADE PRO MODAL ─── */}
      <UpgradeDialog
        open={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        title={upgradeTitle}
        reason={upgradeReason}
      />

      {/* ─── 5-SLIDE PREVIEW MODAL ─── */}
      <TemplatePreviewModal
        isOpen={!!selectedPreviewStyle}
        onClose={() => setSelectedPreviewStyle(null)}
        styleDef={selectedPreviewStyle}
        onSelectStyle={(styleId) => {
          if (isProStyle(styleId) && !isProUser) {
            setShowUpgradeModal(true);
            return;
          }
          setCurrentStyle(styleId);
        }}
      />

      {/* ─── STOCK PHOTO SEARCH MODAL (UNSPLASH) ─── */}
      <StockPhotoModal
        isOpen={isStockModalOpen}
        onClose={() => setIsStockModalOpen(false)}
        slideIndex={activeSlideIndex}
        initialQuery={article.title || 'bisnis'}
        onSelectPhoto={(photoUrl) => {
          updateActiveSlide({ imageUrl: photoUrl });
        }}
      />

      {/* ─── HIDDEN OFFSCREEN RENDER CONTAINER FOR 100% RELIABLE EXPORTS ─── */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          left: '-9999px',
          top: 0,
          width: '440px',
          opacity: 1,
          pointerEvents: 'none',
          zIndex: -9999,
        }}
      >
        {slides.map((s, idx) => (
          <div key={idx} style={{ width: '440px', marginBottom: '24px' }}>
            <CanvasRenderer
              slide={s}
              style={currentStyle}
              format={currentFormat}
              handle={handle}
              brandName={brandName}
              logoUrl={logoUrl}
              hideNewslyWatermark={hideNewslyWatermark}
              totalSlides={slides.length}
              showPhoneFrame={false}
              customAccent={customAccentColor}
              fontFamily={fontFamily}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
