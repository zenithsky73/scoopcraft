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

export type InputMode = 'url' | 'text' | 'prompt';

const TONES = [
  {
    id: 'Jurnalisme Tajam & Akurat',
    label: '📰 Jurnalisme Tajam',
    desc: 'Fakta & data objektif ala media berita nasional',
    icon: '📰',
  },
  {
    id: 'Finansial & Cuan Edukatif',
    label: '💰 Finansial & Cuan',
    desc: 'Metrik angka terstruktur & berwibawa (@ngomonginuang, @mikirduit)',
    icon: '💰',
  },
  {
    id: 'Santai & Populer Gen-Z',
    label: '⚡ Santai Gen-Z',
    desc: 'Bahasa mengalir, ramah, & engaging (@tentangkampus_id, @voxpopular.id)',
    icon: '⚡',
  },
  {
    id: 'Viral Hook & Sensasional',
    label: '🔥 Viral Hook',
    desc: 'Headline memancing rasa penasaran & retensi pembaca sangat tinggi',
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
    setError(null);

    // Double check style lock
    if (isProStyle(selectedStyle) && !isProUser) {
      setShowUpgradeModal(true);
      return;
    }

    setLoading(true);

    try {
      const payload = {
        mode,
        url: mode === 'url' ? url : undefined,
        rawText: mode === 'text' ? rawText : undefined,
        rawTitle: mode === 'text' ? rawTitle : undefined,
        prompt: mode === 'prompt' ? prompt : undefined,
        tone,
        style: selectedStyle,
        format: selectedFormat,
        slides,
      };

      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });

      let body: any = {};
      const text = await res.text();
      try {
        body = JSON.parse(text);
      } catch {
        body = { error: `Server error (${res.status}): ${text ? text.slice(0, 200) : 'No response'}` };
      }

      if (!res.ok) {
        setError(body.error || `Error ${res.status}: Gagal memulai proses.`);
        setLoading(false);
        return;
      }

      // Route immediately to Studio Editor
      router.push(`/content/${body.runId}`);
    } catch (err: any) {
      setError(err?.message || 'Terjadi kesalahan jaringan saat memproses AI.');
      setLoading(false);
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="w-full max-w-4xl mx-auto space-y-8">
        {/* ─── 1. MODE TABS WITH SMOOTH SAAS TRANSITIONS ─── */}
        <div className="bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800/90 flex flex-wrap gap-1.5 shadow-2xl backdrop-blur-md">
          <button
            type="button"
            onClick={() => setMode('url')}
            className={`flex-1 min-w-[140px] py-3.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200 ${
              mode === 'url'
                ? 'bg-gradient-to-r from-primary to-indigo-600 text-white shadow-lg shadow-primary/30 scale-[1.01]'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Link2 className="size-4" /> Link Berita / YouTube
          </button>

          <button
            type="button"
            onClick={() => setMode('text')}
            className={`flex-1 min-w-[140px] py-3.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200 ${
              mode === 'text'
                ? 'bg-gradient-to-r from-primary to-indigo-600 text-white shadow-lg shadow-primary/30 scale-[1.01]'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <FileText className="size-4" /> Salin Naskah Teks
          </button>

          <button
            type="button"
            onClick={() => setMode('prompt')}
            className={`flex-1 min-w-[140px] py-3.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200 ${
              mode === 'prompt'
                ? 'bg-gradient-to-r from-primary via-indigo-600 to-purple-600 text-white shadow-lg shadow-primary/30 scale-[1.01]'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Sparkles className="size-4" /> Tulis Ide AI Prompt
          </button>
        </div>

        {/* ─── 2. DYNAMIC INPUT FIELDS ─── */}
        <div className="bg-slate-900/50 p-6 sm:p-8 rounded-3xl border border-slate-800/90 shadow-2xl space-y-6 backdrop-blur-md">
          {/* MODE A: URL Link */}
          {mode === 'url' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <Globe className="size-4 text-cyan-400" />
                  Tempelkan URL Berita atau Video YouTube:
                </Label>
                <span className="text-[11px] font-mono text-cyan-400 font-bold bg-cyan-950/40 px-2 py-0.5 rounded-full border border-cyan-800/40">
                  Auto-Scraping
                </span>
              </div>
              <div className="relative">
                <Link2 className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
                <Input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Contoh: https://news.detik.com/... atau https://youtube.com/watch?v=..."
                  className="h-12 pl-11 text-sm bg-slate-950/90 border-slate-800 text-white focus:border-primary"
                  required
                />
              </div>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-[11px] text-slate-400">Portal didukung:</span>
                {['Detik', 'Kompas', 'CNN Indonesia', 'Antara', 'Tirto', 'Kumparan', 'YouTube'].map((site) => (
                  <span
                    key={site}
                    className="text-[10px] px-2 py-0.5 rounded-full bg-slate-950 border border-slate-800 text-slate-400"
                  >
                    {site}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* MODE B: Text Copy */}
          {mode === 'text' && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-bold text-slate-200 mb-1.5 block">
                  Judul Berita / Naskah (Opsional):
                </Label>
                <Input
                  value={rawTitle}
                  onChange={(e) => setRawTitle(e.target.value)}
                  placeholder="Judul artikel atau berita Anda..."
                  className="h-11 bg-slate-950/90 border-slate-800 text-sm text-white"
                />
              </div>
              <div>
                <Label className="text-sm font-bold text-slate-200 mb-1.5 block">
                  Isi Naskah / Teks Berita Lengkap:
                </Label>
                <textarea
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  rows={6}
                  placeholder="Salin dan tempelkan isi berita, press release, atau artikel panjang Anda di sini..."
                  className="w-full rounded-2xl bg-slate-950/90 border border-slate-800 p-4 text-sm text-slate-100 placeholder:text-slate-500 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  required
                />
              </div>
            </div>
          )}

          {/* MODE C: Prompt AI */}
          {mode === 'prompt' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <Sparkles className="size-4 text-primary" />
                  Tuliskan Topik / Ide yang Ingin Dibuat Carousel:
                </Label>
                <span className="text-[11px] font-mono text-primary font-bold bg-primary/20 px-2.5 py-0.5 rounded-full border border-primary/30">
                  Gemini Flash AI
                </span>
              </div>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
                placeholder="Contoh: Buatkan 5 slide edukasi tentang tips mengatur keuangan pertama kali untuk mahasiswa di tahun 2026."
                className="w-full rounded-2xl bg-slate-950/90 border border-slate-800 p-4 text-sm text-slate-100 placeholder:text-slate-500 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                required
              />
            </div>
          )}

          {/* Tone Selector Chips */}
          <div className="space-y-2.5 pt-3 border-t border-slate-800/80">
            <Label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Pilihan Tone / Gaya Bahasa:
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {TONES.map((t) => {
                const isSelected = tone === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTone(t.id)}
                    className={`p-3.5 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'bg-primary/15 border-primary ring-1 ring-primary/50 text-white shadow-md'
                        : 'bg-slate-950/80 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <div className="font-bold text-xs text-slate-200 flex items-center gap-1.5">
                      <span>{t.label}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-tight">
                      {t.desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ─── 3. 10 VISUAL PRESET CARDS (FREE VS LOCKED PRO) ─── */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <Layers className="size-5 text-primary" /> Pilih Gaya Desain Visual Awal:
              </h2>
              <p className="text-xs text-slate-400">
                *Template bertanda <strong>GRATIS</strong> bisa langsung dicoba bebas. Template <strong>🔒 PRO</strong> eksklusif untuk pelanggan.
              </p>
            </div>
            <span className="text-xs font-mono text-primary font-bold">10 Preset Media Indonesia</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {STYLES.map((style) => {
              const isSelected = selectedStyle === style.id;
              const isLocked = isProStyle(style.id) && !isProUser;

              return (
                <div
                  key={style.id}
                  onClick={() => handleSelectStyle(style.id)}
                  className={`relative p-4 rounded-2xl cursor-pointer border transition-all duration-200 flex flex-col justify-between ${
                    isSelected
                      ? 'bg-primary/10 border-primary shadow-xl ring-2 ring-primary/50 scale-[1.01]'
                      : isLocked
                      ? 'bg-slate-950/40 border-slate-800/60 opacity-85 hover:opacity-100 hover:border-amber-500/40'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className="size-3.5 rounded-full shrink-0 shadow-sm"
                          style={{ backgroundColor: style.accentColor }}
                        />
                        <span className="font-bold text-sm text-white truncate">{style.label}</span>
                      </div>
                      {isSelected ? (
                        <div className="size-5 rounded-full bg-primary flex items-center justify-center text-white shrink-0">
                          <Check className="size-3 stroke-[3]" />
                        </div>
                      ) : isLocked ? (
                        <span className="inline-flex items-center gap-1 text-[9px] font-black px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
                          <Lock className="size-2.5" /> PRO
                        </span>
                      ) : style.badge ? (
                        <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
                          GRATIS
                        </span>
                      ) : null}
                    </div>

                    {style.subLabel && (
                      <p className="text-xs font-semibold text-primary/90 mb-1.5">
                        {style.subLabel}
                      </p>
                    )}

                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {style.description}
                    </p>
                  </div>

                  {isLocked && (
                    <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-amber-400/90 font-bold">
                      <span className="flex items-center gap-1">
                        <Crown className="size-3 text-amber-400" /> Buka dengan Paket Pro
                      </span>
                      <span className="text-slate-400 font-mono">Rp 19rb ➔</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ─── 4. SLIDE COUNT & FORMAT CONTROLS ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-900/50 p-5 sm:p-6 rounded-3xl border border-slate-800">
          <div>
            <Label className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5 block">
              Jumlah Slide Carousel:
            </Label>
            <div className="flex gap-2">
              {[3, 5, 7, 10].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setSlides(num)}
                  className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition-all ${
                    slides === num
                      ? 'bg-primary text-white shadow-md shadow-primary/30'
                      : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {num} Slide
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5 block">
              Rasio Ukuran Media:
            </Label>
            <div className="flex gap-2">
              {[
                { id: 'FEED_PORTRAIT', label: 'Feed 4:5 (Standar IG)' },
                { id: 'FEED_SQUARE', label: 'Square 1:1' },
                { id: 'STORY', label: 'Story 9:16' },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setSelectedFormat(f.id as OutputFormat)}
                  className={`flex-1 py-2.5 px-2 rounded-xl font-bold text-xs transition-all truncate ${
                    selectedFormat === f.id
                      ? 'bg-primary text-white shadow-md shadow-primary/30'
                      : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="p-4 rounded-2xl bg-red-950/60 border border-red-800/80 text-red-200 text-xs sm:text-sm font-medium">
            {error}
          </div>
        )}

        {/* ─── 5. GENERATE SUBMIT BUTTON ─── */}
        <Button
          type="submit"
          disabled={loading}
          className="w-full h-14 rounded-2xl text-base font-black bg-gradient-to-r from-primary via-indigo-600 to-purple-600 hover:opacity-95 text-white shadow-2xl shadow-primary/30 flex items-center justify-center gap-3 transition-all transform hover:scale-[1.005] active:scale-[0.99]"
        >
          {loading ? (
            <>
              <Sparkles className="size-5 animate-spin" /> Sedang Meriset & Menghasilkan Carousel...
            </>
          ) : (
            <>
              <Zap className="size-5 fill-current" /> Generate Carousel Sekarang (AI Gemini) <ArrowRight className="size-5" />
            </>
          )}
        </Button>
      </form>

      {/* Upgrade Dialog Popup when clicking locked pro template */}
      <UpgradeDialog
        open={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        title={upgradeModalTitle}
        reason="PRO_STYLE"
      />
    </>
  );
}
