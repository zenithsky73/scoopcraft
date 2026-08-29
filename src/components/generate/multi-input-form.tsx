'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  Link2,
  FileText,
  Sparkles,
  Layers,
  ArrowRight,
  Check,
  Zap,
  Globe,
  Lock,
  Crown,
} from 'lucide-react';
import type { DesignStyle, OutputFormat } from '@prisma/client';
import { STYLES, isProStyle } from '@/config/styles';
import { Input, Label } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { UpgradeDialog } from '@/components/billing/upgrade-dialog';
import { VisualTemplatePicker } from '@/components/generate/visual-template-picker';

export type InputMode = 'url' | 'text' | 'prompt';

const TONES = [
  {
    id: 'Jurnalisme Tajam & Akurat',
    label: '📰 Jurnalisme Tajam',
    desc: 'Fakta & data objektif ala media nasional',
    icon: '📰',
  },
  {
    id: 'Finansial & Cuan Edukatif',
    label: '💰 Finansial & Cuan',
    desc: 'Metrik angka terstruktur (@ngomonginuang)',
    icon: '💰',
  },
  {
    id: 'Santai & Populer Gen-Z',
    label: '⚡ Santai Gen-Z',
    desc: 'Bahasa mengalir, ramah (@tentangkampus_id)',
    icon: '⚡',
  },
  {
    id: 'Viral Hook & Sensasional',
    label: '🔥 Viral Hook',
    desc: 'Headline memancing rasa penasaran tinggi',
    icon: '🔥',
  },
];

export function MultiInputForm({ isProUser = false }: { isProUser?: boolean }) {
  const router = useRouter();
  const [mode, setMode] = React.useState<InputMode>('url');

  // Form Inputs
  const [url, setUrl] = React.useState('');
  const [rawText, setRawText] = React.useState('');
  const [rawTitle, setRawTitle] = React.useState('');
  const [prompt, setPrompt] = React.useState('');
  const [tone, setTone] = React.useState(TONES[0].id);

  // Single Initial Style Selection (Default: BREAKING_NEWS Free)
  const [selectedStyle, setSelectedStyle] = React.useState<DesignStyle>('BREAKING_NEWS');
  const [selectedFormat, setSelectedFormat] = React.useState<OutputFormat>('FEED_PORTRAIT');
  const [slides, setSlides] = React.useState<number>(5);

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = React.useState(false);
  const [upgradeModalTitle, setUpgradeModalTitle] = React.useState('Buka Template Eksklusif Pro');

  function handleSelectStyle(styleId: DesignStyle) {
    const isLocked = isProStyle(styleId) && !isProUser;
    if (isLocked) {
      const def = STYLES.find((s) => s.id === styleId);
      setUpgradeModalTitle(`Template ${def?.label || 'Pro'} Terkunci 🔒`);
      setShowUpgradeModal(true);
      return;
    }
    setSelectedStyle(styleId);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          url: mode === 'url' ? url.trim() : undefined,
          rawText: mode === 'text' ? rawText.trim() : undefined,
          rawTitle: mode === 'text' ? rawTitle.trim() : undefined,
          prompt: mode === 'prompt' ? prompt.trim() : undefined,
          tone,
          style: selectedStyle,
          format: selectedFormat,
          slides,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        if (data.error === 'QUOTA_EXCEEDED' || data.error === 'GUEST_LIMIT' || data.error === 'TRIAL_EXPIRED') {
          setUpgradeModalTitle('Batas Kuota Tercapai');
          setShowUpgradeModal(true);
          setLoading(false);
          return;
        }
        throw new Error(data.message || data.error || 'Gagal membuat konten.');
      }

      const targetContent = data.content || data.generatedContent;
      const targetId = targetContent?.id || data.runId || data.run?.id;

      // Cache result locally in sessionStorage
      try {
        if (targetId && data.article) {
          sessionStorage.setItem(`content_${targetId}`, JSON.stringify({
            article: data.article,
            generatedContent: targetContent,
            run: data.run || { id: targetId },
          }));
        }
      } catch (cacheErr) {
        console.warn('[SessionStorage Cache Warning]:', cacheErr);
      }

      if (targetId) {
        window.location.href = `/content/${targetId}`;
      } else {
        router.push('/dashboard');
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan sistem.');
      setLoading(false);
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
        {/* ─── 1. MODE TABS (URL vs TEXT vs PROMPT) ─── */}
        <div className="flex p-1 sm:p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm">
          <button
            type="button"
            onClick={() => setMode('url')}
            className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              mode === 'url'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-700 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
            }`}
          >
            <Link2 className="size-3.5 sm:size-4" />
            <span>Link Berita</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('text')}
            className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              mode === 'text'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-700 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
            }`}
          >
            <FileText className="size-3.5 sm:size-4" />
            <span>Salin Teks</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('prompt')}
            className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              mode === 'prompt'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-700 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
            }`}
          >
            <Sparkles className="size-3.5 sm:size-4" />
            <span>Ide Prompt</span>
          </button>
        </div>

        {/* ─── 2. INPUT WORKSPACE CONTAINER ─── */}
        <div className="p-4 sm:p-6 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-md backdrop-blur-xl space-y-4">
          {/* MODE A: URL Input */}
          {mode === 'url' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Globe className="size-4 text-cyan-600 dark:text-cyan-400" />
                  <span>Tempelkan Link Berita / YouTube:</span>
                </Label>
                <span className="text-[10px] font-mono text-cyan-700 dark:text-cyan-400 font-bold bg-cyan-100 dark:bg-cyan-950/60 px-2 py-0.5 rounded-full border border-cyan-300 dark:border-cyan-800/40">
                  Auto-Scrape
                </span>
              </div>
              <div className="relative">
                <Link2 className="pointer-events-none absolute left-3.5 top-1/2 size-4 sm:size-5 -translate-y-1/2 text-slate-400" />
                <Input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://news.detik.com/... atau https://youtube.com/..."
                  className="h-11 sm:h-12 pl-10 sm:pl-11 text-xs sm:text-sm bg-slate-50 dark:bg-slate-950/90 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-primary rounded-xl"
                  required
                />
              </div>
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] text-slate-500 font-semibold">Mendukung:</span>
                {['Detik', 'Kompas', 'CNN', 'Kumparan', 'Antara', 'YouTube'].map((site) => (
                  <span
                    key={site}
                    className="text-[9px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                  >
                    {site}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* MODE B: Text Copy */}
          {mode === 'text' && (
            <div className="space-y-3 sm:space-y-4">
              <div>
                <Label className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 mb-1.5 block">
                  Judul Berita / Naskah (Opsional):
                </Label>
                <Input
                  value={rawTitle}
                  onChange={(e) => setRawTitle(e.target.value)}
                  placeholder="Judul artikel atau berita Anda..."
                  className="h-10 sm:h-11 bg-slate-50 dark:bg-slate-950/90 border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white rounded-xl"
                />
              </div>
              <div>
                <Label className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 mb-1.5 block">
                  Isi Naskah Berita Lengkap:
                </Label>
                <textarea
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  rows={5}
                  placeholder="Salin dan tempelkan isi naskah berita atau artikel panjang di sini..."
                  className="w-full rounded-2xl bg-slate-50 dark:bg-slate-950/90 border border-slate-200 dark:border-slate-800 p-3.5 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  required
                />
              </div>
            </div>
          )}

          {/* MODE C: Prompt AI */}
          {mode === 'prompt' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <Sparkles className="size-4 text-primary shrink-0" />
                  <span>Tuliskan Topik Carousel AI:</span>
                </Label>
                <span className="text-[10px] font-mono text-primary font-bold bg-primary/10 dark:bg-primary/20 px-2 py-0.5 rounded-full border border-primary/20 dark:border-primary/30">
                  Gemini 2.5 Flash Turbo
                </span>
              </div>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={3}
                placeholder="Contoh: 5 strategi cerdas mengelola keuangan untuk fresh graduate di tahun 2026."
                className="w-full rounded-2xl bg-slate-50 dark:bg-slate-950/90 border border-slate-200 dark:border-slate-800 p-3.5 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                required
              />

              {/* Quick Trending Prompt Chips */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  ⚡ Ide Topik Tren Cepat (Klik untuk Coba):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    '💡 5 Kesalahan Finansial Fatal di Usia 20-an & Solusinya',
                    '🤖 7 AI Tools Produktivitas Paling Mengubah Kerja 2026',
                    '📱 Review Flagship Smartphone: Inovasi Kamera & Baterai',
                    '🚀 4 Strategi Bisnis Modal Kecil Menjadi Viral di Medsos',
                    '💼 Seni Negosiasi Gaji & Karier untuk Profesional Muda',
                    '☕ Rahasia Memulai Bisnis F&B dengan Pelanggan Loyal',
                  ].map((trendingTopic, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setPrompt(trendingTopic)}
                      className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-900 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-slate-800 transition-all text-slate-700 dark:text-slate-300"
                    >
                      {trendingTopic}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tone Selector Chips */}
          <div className="space-y-2 pt-3 border-t border-slate-200 dark:border-slate-800/80">
            <Label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block">
              Gaya Bahasa / Tone:
            </Label>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
              {TONES.map((t) => {
                const isSelected = tone === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTone(t.id)}
                    className={`p-2.5 sm:p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-primary/10 dark:bg-primary/20 border-primary ring-1 ring-primary/50 text-primary dark:text-white shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-950/80 border-slate-200 dark:border-slate-800/80 text-slate-600 dark:text-slate-400 hover:border-slate-400 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="font-bold text-[11px] sm:text-xs text-slate-900 dark:text-slate-200 truncate">
                      {t.label}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                      {t.desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ─── 2. PILIHAN TEMPLATE DESAIN VISUAL (5-COLUMN MODERN MOCKUP PICKER) ─── */}
        <VisualTemplatePicker
          selectedStyle={selectedStyle}
          onSelectStyle={handleSelectStyle}
          selectedFormat={selectedFormat}
          onSelectFormat={setSelectedFormat}
          isProUser={isProUser}
          onRequireUpgrade={(style) => {
            setUpgradeModalTitle(`Template ${style.label} Terkunci 🔒`);
            setShowUpgradeModal(true);
          }}
        />

        {/* Error Notification */}
        {error && (
          <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Submit Generate Action Button */}
        <Button
          type="submit"
          disabled={loading}
          className="w-full h-13 sm:h-14 rounded-2xl bg-gradient-to-r from-primary via-indigo-600 to-primary hover:opacity-95 text-white font-black text-sm sm:text-base shadow-xl shadow-primary/25 transition-all flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>AI Sedang Meriset & Membuat Carousel...</span>
            </>
          ) : (
            <>
              <Sparkles className="size-5 text-amber-300" />
              <span>Buat Carousel AI Sekarang</span>
              <ArrowRight className="size-5 ml-1" />
            </>
          )}
        </Button>
      </form>

      {/* Upgrade Dialog */}
      <UpgradeDialog
        open={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        title={upgradeModalTitle}
        reason="PRO_STYLE"
      />
    </>
  );
}
