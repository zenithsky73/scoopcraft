import Link from 'next/link';
import { ArrowRight, Link2, Sparkles, LayoutTemplate, Layers, Zap, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { APP } from '@/config/app';
import { TRIAL, GUEST } from '@/config/trial';
import { STYLES } from '@/config/styles';

const STEPS = [
  {
    icon: Link2,
    title: '1. Tempel Link / Tulis Ide',
    body: 'Mendukung URL berita nasional (Detik, Kompas, CNN), YouTube, salin teks berita, atau prompt ide AI.',
    color: '#06B6D4',
  },
  {
    icon: Sparkles,
    title: '2. AI Gemini 3.6 Flash Meriset',
    body: 'AI meriset fakta, menyusun headline viral, naskah slide carousel, caption, dan hashtag dalam 2 detik.',
    color: '#8B5CF6',
  },
  {
    icon: LayoutTemplate,
    title: '3. 10 Template Desain Instagram',
    body: 'Pilih & ganti 10 template gaya media top Indonesia secara instan (1-klik) di Studio Editor.',
    color: '#EC4899',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-dvh bg-slate-950 text-slate-100 flex flex-col">
      {/* ─── HEADER ─── */}
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-slate-800/80 bg-slate-950/80 px-4 backdrop-blur-xl lg:px-12">
        <Link href="/" className="flex items-center gap-2.5">
          <img
            src="/logo-icon.png"
            alt="Newsly AI"
            className="size-8 object-contain"
          />
          <span className="text-lg font-black tracking-tight text-white">
            Newsly<span className="bg-gradient-to-r from-cyan-400 via-pink-500 to-amber-400 bg-clip-text text-transparent">AI</span>
          </span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <Button asChild variant="ghost" size="sm" className="text-slate-300 hover:text-white text-xs font-bold">
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
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 shadow-md">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Didukung <strong>Google Gemini 3.6 Flash</strong></span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.1]">
              From News to{' '}
              <span className="bg-gradient-to-r from-cyan-400 via-pink-500 to-amber-400 bg-clip-text text-transparent">
                Stunning Content
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium">
              Platform AI Pembuat Carousel & Feed Media Sosial Kelas Dunia. Ubah berita portal, press release, atau topik ide menjadi slide konten Instagram & LinkedIn visual berkelas dalam hitungan detik.
            </p>

            {/* Workflow Step Pills */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 pt-1 text-xs font-bold">
              <span className="px-3.5 py-1.5 rounded-xl bg-cyan-950/60 border border-cyan-800/60 text-cyan-300 flex items-center gap-1.5 shadow-sm">
                🔗 Tempel Link Berita
              </span>
              <span className="text-slate-500 font-bold">➔</span>
              <span className="px-3.5 py-1.5 rounded-xl bg-purple-950/60 border border-purple-800/60 text-purple-300 flex items-center gap-1.5 shadow-sm">
                ✨ AI Meriset & Menyusun
              </span>
              <span className="text-slate-500 font-bold">➔</span>
              <span className="px-3.5 py-1.5 rounded-xl bg-amber-950/60 border border-amber-800/60 text-amber-300 flex items-center gap-1.5 shadow-sm">
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

              <Button asChild variant="secondary" size="lg" className="h-13 px-6 rounded-2xl text-sm font-bold bg-slate-900 border border-slate-800 text-slate-200 hover:bg-slate-800">
                <Link href="/templates">
                  <Layers className="size-4 mr-2 text-primary" /> Jelajahi 10 Template
                </Link>
              </Button>
            </div>
          </div>

          {/* Right Column 3D Mascot Banner */}
          <div className="lg:col-span-5 flex justify-center items-center">
            <div className="relative w-full max-w-sm sm:max-w-md drop-shadow-[0_25px_50px_rgba(56,189,248,0.25)] hover:scale-105 transition-transform duration-500">
              <img
                src="/mascot-hero.png"
                alt="Newsly AI Robot Mascot"
                className="w-full h-auto object-contain"
              />
            </div>
          </div>
        </div>

        {/* ─── 3 STEP HOW IT WORKS ─── */}
        <div className="pt-8 space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-black text-white">Cara Kerja Super Cepat</h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">3 Langkah sederhana dari artikel berita menjadi carousel viral</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STEPS.map((step, idx) => (
              <div
                key={idx}
                className="p-6 rounded-3xl border border-slate-800 bg-slate-900/50 backdrop-blur-md shadow-xl space-y-3"
              >
                <div
                  className="size-10 rounded-2xl flex items-center justify-center shadow-md"
                  style={{ backgroundColor: `${step.color}20`, color: step.color }}
                >
                  <step.icon className="size-5" />
                </div>
                <h3 className="font-bold text-base text-white">{step.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{step.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ─── 10 STYLES HIGHLIGHT ─── */}
        <div className="p-8 rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900/90 to-slate-950 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <Layers className="size-5 text-primary" /> 10 Preset Desain Media Instagram Indonesia
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Terinspirasi dari akun-akun media sosial dengan engagement tertinggi di Indonesia.
              </p>
            </div>
            <Button asChild size="sm" variant="secondary" className="text-xs font-bold bg-slate-900 border-slate-800 text-slate-200">
              <Link href="/templates">Lihat Semua ➔</Link>
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {STYLES.map((style) => (
              <div
                key={style.id}
                className="p-3 rounded-2xl border border-slate-800/80 bg-slate-950/60 flex flex-col justify-between space-y-1.5"
              >
                <div className="flex items-center gap-2">
                  <span className="size-2.5 rounded-full" style={{ backgroundColor: style.accentColor }} />
                  <span className="text-xs font-bold text-white truncate">{style.label}</span>
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
      <footer className="border-t border-slate-800/80 py-8 px-4 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src="/logo-icon.png" alt="Newsly AI" className="size-5 object-contain" />
            <span className="font-bold text-slate-400">Newsly AI — From News to Stunning Content</span>
          </div>
          <p>© {new Date().getFullYear()} Newsly AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
