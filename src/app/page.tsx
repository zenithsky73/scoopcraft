import Link from 'next/link';
import { ArrowRight, Link2, Sparkles, LayoutTemplate, Layers, Zap, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { APP } from '@/config/app';
import { TRIAL, GUEST } from '@/config/trial';
import { STYLES } from '@/config/styles';
import { HeroShowcase } from '@/components/landing/hero-showcase';
import { NewslyLogo } from '@/components/brand/newsly-logo';

const STEPS = [
  {
    icon: Link2,
    title: '1. Tempel Link / Tulis Ide',
    body: 'Mendukung URL berita nasional (Detik, Kompas, CNN), YouTube, salin teks berita, atau prompt ide AI.',
    color: '#06B6D4',
  },
  {
    icon: Sparkles,
    title: '2. AI Gemini Turbo Meriset',
    body: 'AI meriset fakta, menyusun headline viral, naskah slide carousel, caption, dan hashtag dalam 1-2 detik.',
    color: '#8B5CF6',
  },
  {
    icon: LayoutTemplate,
    title: '3. 20 Template Desain Instagram',
    body: 'Pilih & ganti 20 template gaya media top Indonesia secara instan (1-klik) di Studio Editor.',
    color: '#EC4899',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-dvh bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-200">
      {/* ─── HEADER ─── */}
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 px-4 backdrop-blur-xl lg:px-12 transition-colors duration-200">
        <Link href="/" className="flex items-center gap-2.5">
          <NewslyLogo size={32} />
          <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
            Newsly<span className="bg-gradient-to-r from-cyan-500 via-pink-500 to-amber-500 bg-clip-text text-transparent">AI</span>
          </span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <Button asChild variant="ghost" size="sm" className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-xs font-bold">
            <Link href="/login">Masuk</Link>
          </Button>
          <Button asChild size="sm" className="bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-primary/25 rounded-xl">
            <Link href="/dashboard">Coba Gratis (5x)</Link>
          </Button>
        </div>
      </header>

      {/* ─── HERO SECTION ─── */}
      <main className="flex-1 max-w-6xl mx-auto px-4 py-12 sm:py-20 lg:py-24 space-y-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column Text */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-sm">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
              <span>Didukung <strong>Google Gemini AI Turbo</strong></span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.1]">
              From News to{' '}
              <span className="bg-gradient-to-r from-cyan-500 via-pink-500 to-amber-500 bg-clip-text text-transparent">
                Stunning Content
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium">
              Platform AI Pembuat Carousel & Feed Media Sosial Kelas Dunia. Ubah berita portal, press release, atau topik ide menjadi slide konten Instagram & LinkedIn visual berkelas dalam hitungan detik.
            </p>

            {/* Workflow Step Pills */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 pt-1 text-xs font-bold">
              <span className="px-3.5 py-1.5 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800/60 text-cyan-800 dark:text-cyan-300 flex items-center gap-1.5 shadow-sm">
                🔗 Tempel Link Berita
              </span>
              <span className="text-slate-400 font-bold">➔</span>
              <span className="px-3.5 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800/60 text-purple-800 dark:text-purple-300 flex items-center gap-1.5 shadow-sm">
                ✨ AI Meriset & Menyusun
              </span>
              <span className="text-slate-400 font-bold">➔</span>
              <span className="px-3.5 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-300 flex items-center gap-1.5 shadow-sm">
                📸 Siap Posting IG & LinkedIn
              </span>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 pt-4">
              <Button asChild size="lg" className="h-13 px-7 rounded-2xl text-base font-black bg-gradient-to-r from-primary via-indigo-600 to-purple-600 text-white shadow-xl shadow-primary/30 hover:opacity-95 transition-all">
                <Link href="/dashboard" className="flex items-center gap-2">
                  <Zap className="size-5 fill-current" /> Buat Carousel Sekarang <ArrowRight className="size-5" />
                </Link>
              </Button>

              <Button asChild variant="secondary" size="lg" className="h-13 px-6 rounded-2xl text-sm font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 shadow-sm">
                <Link href="/templates">
                  <Layers className="size-4 mr-2 text-primary" /> Jelajahi 20 Template
                </Link>
              </Button>
            </div>
          </div>

          {/* Right Column: 3D Layered Carousel Showcase Mockup (100% Seamless & Transparent) */}
          <div className="lg:col-span-5 flex justify-center items-center">
            <HeroShowcase />
          </div>
        </div>

        {/* ─── 3 STEP HOW IT WORKS ─── */}
        <div className="pt-8 space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">Cara Kerja Super Cepat</h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">3 Langkah sederhana dari artikel berita menjadi carousel viral</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STEPS.map((step, idx) => (
              <div
                key={idx}
                className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 backdrop-blur-md shadow-sm space-y-3 transition-colors duration-200"
              >
                <div
                  className="size-10 rounded-2xl flex items-center justify-center shadow-sm"
                  style={{ backgroundColor: `${step.color}15`, color: step.color }}
                >
                  <step.icon className="size-5" />
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">{step.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{step.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ─── 20 STYLES HIGHLIGHT ─── */}
        <div className="p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-gradient-to-br dark:from-slate-900/90 dark:to-slate-950 shadow-md space-y-6 transition-colors duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="size-5 text-primary" /> 20 Preset Desain Media Instagram Indonesia
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Terinspirasi dari akun-akun media sosial dengan engagement tertinggi di Indonesia.
              </p>
            </div>
            <Button asChild size="sm" variant="secondary" className="text-xs font-bold bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200">
              <Link href="/templates">Lihat Semua ➔</Link>
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {STYLES.map((style) => (
              <div
                key={style.id}
                className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950/60 flex flex-col justify-between space-y-1.5 transition-colors duration-200 shadow-sm"
              >
                <div className="flex items-center gap-2">
                  <span className="size-2.5 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: style.accentColor }} />
                  <span className="text-xs font-bold text-slate-900 dark:text-white truncate">{style.label}</span>
                </div>
                <span className="text-[10px] text-primary truncate block font-medium">
                  {style.subLabel || '@media.id'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-slate-200 dark:border-slate-800/80 py-8 px-4 text-center text-xs text-slate-500 bg-white/50 dark:bg-slate-950 transition-colors duration-200">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <NewslyLogo size={20} />
            <span className="font-bold text-slate-700 dark:text-slate-400">Newsly AI — From News to Stunning Content</span>
          </div>
          <p>© {new Date().getFullYear()} Newsly AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
