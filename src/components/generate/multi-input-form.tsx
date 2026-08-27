'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  Link2,
  FileText,
  Sparkles,
  Layers,
  ArrowRight,
  TrendingUp,
  Flame,
  Check,
} from 'lucide-react';
import type { DesignStyle, OutputFormat } from '@prisma/client';
import { STYLES } from '@/config/styles';
import { Input, Label } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export type InputMode = 'url' | 'text' | 'prompt';

const TONES = [
  { id: 'Informatif & Tajam', label: '📰 Jurnalisme Tajam', desc: 'Gaya portal berita nasional, fakta & data akurat' },
  { id: 'Edukasi & Finansial', label: '💰 Finansial & Bisnis', desc: 'Analisis mendalam, angka terstruktur ala media finansial' },
  { id: 'Santai & Menarik', label: '⚡ Santai & Gen-Z', desc: 'Bahasa populer, engaging, cocok untuk pop culture & kampus' },
  { id: 'Viral Hook & Sensasional', label: '🔥 Viral Hook', desc: 'Headline memancing rasa penasaran, retensi tinggi' },
];

export function MultiInputForm() {
  const router = useRouter();
  const [mode, setMode] = React.useState<InputMode>('url');

  // Input states
  const [url, setUrl] = React.useState('');
  const [rawText, setRawText] = React.useState('');
  const [rawTitle, setRawTitle] = React.useState('');
  const [prompt, setPrompt] = React.useState('');
  const [tone, setTone] = React.useState(TONES[0].id);

  // Single style selection
  const [selectedStyle, setSelectedStyle] = React.useState<DesignStyle>('BREAKING_NEWS');
  const [selectedFormat, setSelectedFormat] = React.useState<OutputFormat>('FEED_PORTRAIT');
  const [slides, setSlides] = React.useState<number>(5);

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
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

      // If completed with direct result, push to content page
      router.push(`/content/${body.runId}`);
    } catch (err: any) {
      setError(err?.message || 'Terjadi kesalahan jaringan.');
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-4xl mx-auto space-y-8">
      {/* 1. Input Mode Tabs */}
      <div className="bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 flex flex-wrap gap-1 shadow-xl">
        <button
          type="button"
          onClick={() => setMode('url')}
          className={`flex-1 min-w-[140px] py-3 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
            mode === 'url'
              ? 'bg-primary text-white shadow-lg shadow-primary/25'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <Link2 className="size-4" /> Link Berita / YouTube
        </button>

        <button
          type="button"
          onClick={() => setMode('text')}
          className={`flex-1 min-w-[140px] py-3 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
            mode === 'text'
              ? 'bg-primary text-white shadow-lg shadow-primary/25'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <FileText className="size-4" /> Salin Teks Berita
        </button>

        <button
          type="button"
          onClick={() => setMode('prompt')}
          className={`flex-1 min-w-[140px] py-3 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
            mode === 'prompt'
              ? 'bg-gradient-to-r from-primary to-indigo-500 text-white shadow-lg shadow-primary/25'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <Sparkles className="size-4" /> Tulis Prompt Ide AI
        </button>
      </div>

      {/* 2. Dynamic Input Fields based on Mode */}
      <div className="bg-slate-900/60 p-6 sm:p-7 rounded-3xl border border-slate-800/80 shadow-2xl space-y-6">
        {mode === 'url' && (
          <div className="space-y-2">
            <Label className="text-sm font-bold text-slate-200">
              Tempelkan URL Berita atau Video YouTube:
            </Label>
            <div className="relative">
              <Link2 className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
              <Input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Contoh: https://news.detik.com/... atau https://youtube.com/watch?v=..."
                className="h-12 pl-11 text-sm bg-slate-950 border-slate-800"
                required
              />
            </div>
            <p className="text-xs text-slate-400">
              Mendukung portal berita nasional (*Detik, Kompas, CNN, Antara, Kumparan, Tirto*) dan video YouTube.
            </p>
          </div>
        )}

        {mode === 'text' && (
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-bold text-slate-200">Judul Berita / Rilis (Opsional):</Label>
              <Input
                value={rawTitle}
                onChange={(e) => setRawTitle(e.target.value)}
                placeholder="Judul artikel Anda..."
                className="h-11 bg-slate-950 border-slate-800 text-sm"
              />
            </div>
            <div>
              <Label className="text-sm font-bold text-slate-200">Isi Naskah / Teks Berita:</Label>
              <textarea
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                rows={6}
                placeholder="Salin dan tempelkan naskah berita, artikel, atau tulisan Anda di sini..."
                className="w-full rounded-2xl bg-slate-950 border border-slate-800 p-4 text-sm text-slate-100 placeholder:text-slate-500 focus:ring-2 focus:ring-primary outline-none"
                required
              />
            </div>
          </div>
        )}

        {mode === 'prompt' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-bold text-slate-200">
                Tuliskan Topik / Ide yang Ingin Dibuat Carousel:
              </Label>
              <span className="text-xs text-primary font-bold">AI Auto-Research</span>
            </div>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              placeholder="Contoh: Buatkan carousel edukasi tentang 5 langkah mengelola keuangan gaji pertama bagi Gen-Z, lengkap dengan tips menabung & investasi aman."
              className="w-full rounded-2xl bg-slate-950 border border-slate-800 p-4 text-sm text-slate-100 placeholder:text-slate-500 focus:ring-2 focus:ring-primary outline-none"
              required
            />
          </div>
        )}

        {/* Tone Selector */}
        <div className="space-y-2.5 pt-2 border-t border-slate-800">
          <Label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Gaya Bahasa / Tone:
          </Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {TONES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTone(t.id)}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  tone === t.id
                    ? 'bg-primary/10 border-primary ring-1 ring-primary/50 text-white'
                    : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="font-bold text-xs text-slate-200">{t.label}</div>
                <div className="text-[11px] text-slate-400 mt-1 line-clamp-1">{t.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Single Visual Style Selection (10 Presets) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <Layers className="size-5 text-primary" /> Pilih 1 Gaya Desain Visual Awal:
            </h2>
            <p className="text-xs text-slate-400">
              *Anda bisa langsung mencoba dan mengganti ke template gaya lainnya di Studio Editor nanti.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {STYLES.map((style) => {
            const isSelected = selectedStyle === style.id;
            return (
              <div
                key={style.id}
                onClick={() => setSelectedStyle(style.id)}
                className={`p-4 rounded-2xl cursor-pointer border transition-all duration-200 flex flex-col justify-between ${
                  isSelected
                    ? 'bg-primary/10 border-primary shadow-xl ring-2 ring-primary/50'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="size-3.5 rounded-full"
                      style={{ backgroundColor: style.accentColor }}
                    />
                    <span className="font-bold text-sm text-white">{style.label}</span>
                  </div>
                  {isSelected ? (
                    <div className="size-5 rounded-full bg-primary flex items-center justify-center text-white">
                      <Check className="size-3 stroke-[3]" />
                    </div>
                  ) : style.badge ? (
                    <span
                      className="text-[10px] font-black px-2 py-0.5 rounded text-white"
                      style={{ backgroundColor: style.accentColor }}
                    >
                      {style.badge}
                    </span>
                  ) : null}
                </div>

                {style.subLabel && (
                  <p className="text-xs font-semibold text-primary mb-1.5">
                    {style.subLabel}
                  </p>
                )}

                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {style.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Slide Count & Format Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-900/60 p-5 rounded-3xl border border-slate-800">
        <div>
          <Label className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 block">
            Jumlah Slide Carousel:
          </Label>
          <div className="flex gap-2">
            {[3, 5, 7].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setSlides(num)}
                className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition-all ${
                  slides === num
                    ? 'bg-primary text-white shadow-md'
                    : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {num} Slide
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 block">
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
                className={`flex-1 py-2.5 px-2 rounded-xl font-bold text-xs transition-all line-clamp-1 ${
                  selectedFormat === f.id
                    ? 'bg-primary text-white shadow-md'
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
        <div className="p-4 rounded-2xl bg-red-950/50 border border-red-800/80 text-red-300 text-xs sm:text-sm font-medium">
          {error}
        </div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={loading}
        className="w-full h-14 rounded-2xl text-base font-black bg-gradient-to-r from-primary via-indigo-600 to-primary bg-size-200 hover:bg-pos-100 text-white shadow-2xl shadow-primary/30 flex items-center justify-center gap-3 transition-all"
      >
        {loading ? (
          <>
            <Sparkles className="size-5 animate-spin" /> Sedang Menghasilkan Carousel Cantik...
          </>
        ) : (
          <>
            <Sparkles className="size-5" /> Generate Carousel Sekarang <ArrowRight className="size-5" />
          </>
        )}
      </Button>
    </form>
  );
}
