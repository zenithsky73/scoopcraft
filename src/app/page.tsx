import Link from 'next/link';
import { ArrowRight, Link2, Sparkles, LayoutTemplate, Layers, Zap, CheckCircle2, Check, Smartphone, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { STYLES } from '@/config/styles';
import { HeroShowcase } from '@/components/landing/hero-showcase';
import { NewslyLogo } from '@/components/brand/newsly-logo';

const STEPS = [
  {
    num: '01',
    title: 'Masukkan sumber',
    body: 'Ketik kata kunci topik, ide bisnis, atau tempel URL artikel yang ingin diubah menjadi konten.',
  },
  {
    num: '02',
    title: 'Pilih format',
    body: 'Tentukan apakah Anda membutuhkan Carousel Feed (4:5), Story (9:16), atau keduanya sekaligus.',
  },
  {
    num: '03',
    title: 'Terima konten jadi',
    body: 'Dapatkan struktur naskah slide, visual grafis estetik, caption lengkap, dan auto-post langsung ke sosmed.',
  },
];

const BENEFITS = [
  {
    icon: FileText,
    title: 'Artikel jadi carousel',
    body: 'Tempel URL artikel atau ide dan biarkan AI mengambil insight penting, menyusunnya menjadi alur slide visual yang mudah dibaca.',
  },
  {
    icon: Smartphone,
    title: 'Story siap tayang',
    body: 'Ubah satu topik menjadi rangkaian Story vertikal (9:16) yang ringkas, visual, dan konsisten tanpa menyusun manual.',
  },
  {
    icon: Sparkles,
    title: 'Caption & Hook ikut selesai',
    body: 'Hook pembuka memikat, ringkasan isi, call-to-action konversi jualan, dan hashtag dibuat otomatis agar paket konten siap tayang.',
  },
];

const CLIENTS = [
  { name: 'Indo Voice Over', src: '/clients/ivo.jpg' },
  { name: 'Indo Voice Over Academy', src: '/clients/ivo-academy.png' },
  { name: 'Bikin Jingle', src: '/clients/bj.png' },
  { name: 'Behind The Sun', src: '/clients/behind-the-sun.jpg' },
  { name: 'Fitzyu', src: '/clients/fitzyu.png' },
  { name: 'Tumbler Guys', src: '/clients/tumblerguys.png' },
];

export default function LandingPage() {
  return (
    <div className="min-h-dvh bg-[#fafafa] dark:bg-[#070913] text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-200">
      {/* ─── HEADER ─── */}
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 dark:border-slate-800/80 bg-white/90 dark:bg-[#070913]/90 px-4 backdrop-blur-xl lg:px-12 transition-colors duration-200">
        <Link href="/" className="flex items-center gap-2.5">
          <NewslyLogo size={36} showText showProBadge textClassName="text-lg font-black tracking-tight" />
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <Button asChild variant="ghost" size="sm" className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-xs font-bold">
            <Link href="/login">Masuk</Link>
          </Button>
          <Button asChild size="sm" className="bg-[#ff4526] hover:bg-[#e93a1d] text-white text-xs font-bold shadow-lg shadow-[#ff4526]/25 rounded-xl">
            <Link href="/dashboard">Buat Konten Gratis</Link>
          </Button>
        </div>
      </header>

      {/* ─── HERO SECTION ─── */}
      <main className="flex-1 max-w-6xl mx-auto px-4 py-12 sm:py-20 lg:py-24 space-y-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column Text */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#fff0ec] dark:bg-[#ff4526]/15 border border-[#ffd4ca] dark:border-[#ff4526]/30 text-xs font-bold text-[#ff4526] shadow-sm">
              <span className="flex h-2 w-2 rounded-full bg-[#ff4526] animate-pulse" />
              <span>Konten siap posting, nyaris tanpa effort</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.08]">
              Masukkan topik.{' '}
              <span className="text-[#ff4526]">
                Konten langsung jadi.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium">
              Cukup masukkan kata kunci atau tempel URL sebuah artikel. InstaDeck otomatis mengubahnya menjadi carousel atau Story lengkap—mulai dari ide, naskah, visual, hingga caption.
            </p>

            {/* Workflow Step Pills */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 pt-1 text-xs font-bold">
              <span className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1.5 shadow-sm">
                ⚡ Input Kata Kunci / URL
              </span>
              <span className="text-slate-400 font-bold">➔</span>
              <span className="px-3.5 py-1.5 rounded-xl bg-[#fff0ec] dark:bg-[#ff4526]/15 border border-[#ffd4ca] dark:border-[#ff4526]/30 text-[#ff4526] flex items-center gap-1.5 shadow-sm">
                🎨 AI Render Visual &amp; Caption
              </span>
              <span className="text-slate-400 font-bold">➔</span>
              <span className="px-3.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 shadow-sm">
                🚀 Siap Posting IG, FB &amp; Threads
              </span>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 pt-4">
              <Button asChild size="lg" className="h-13 px-7 rounded-2xl text-base font-black bg-[#ff4526] hover:bg-[#e93a1d] text-white shadow-xl shadow-[#ff4526]/30 transition-all">
                <Link href="/dashboard" className="flex items-center gap-2">
                  <Zap className="size-5 fill-current" /> Buat Carousel Sekarang <ArrowRight className="size-5" />
                </Link>
              </Button>

              <Button asChild variant="secondary" size="lg" className="h-13 px-6 rounded-2xl text-sm font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 shadow-sm">
                <Link href="/templates">
                  <Layers className="size-4 mr-2 text-[#ff4526]" /> Jelajahi 20+ Template
                </Link>
              </Button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center lg:justify-start gap-2 pt-1 font-medium">
              <Check className="size-4 text-emerald-500 stroke-[3]" /> Tanpa desain manual • Tanpa mulai dari nol
            </p>
          </div>

          {/* Right Column: 3D Layered Carousel Showcase Mockup */}
          <div className="lg:col-span-5 flex justify-center items-center">
            <HeroShowcase />
          </div>
        </div>

        {/* ─── 3 PILLARS: DARI INPUT MENJADI KONTEN ─── */}
        <div className="pt-8 space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-black uppercase tracking-widest text-[#ff4526]">Dari input menjadi konten</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Satu sumber. Semua materi konten siap.</h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">InstaDeck menangani pekerjaan yang biasanya memakan waktu berjam-jam—menggali ide, menyusun alur, mendesain slide, dan menulis caption.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {BENEFITS.map((b, idx) => (
              <div
                key={idx}
                className="p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 backdrop-blur-md shadow-sm space-y-3.5 transition-all hover:border-[#ff4526]/40 hover:-translate-y-1"
              >
                <div className="size-11 rounded-2xl flex items-center justify-center bg-[#fff0ec] dark:bg-[#ff4526]/15 text-[#ff4526] border border-[#ffd4ca] dark:border-[#ff4526]/30 shadow-sm">
                  <b.icon className="size-5" />
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">{b.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{b.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ─── 3 LANGKAH CARA KERJA ─── */}
        <div className="p-6 sm:p-10 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 shadow-sm space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-[#ff4526]">Cara kerjanya</span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1">Tiga langkah. Hampir tanpa effort.</h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">Anda membawa ide atau sumbernya. InstaDeck mengurus proses produksi konten dari awal sampai siap posting.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STEPS.map((step, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-950/60 space-y-3"
              >
                <span className="inline-flex size-10 items-center justify-center rounded-xl bg-[#ff4526] text-white font-black text-sm shadow-md shadow-[#ff4526]/20">
                  {step.num}
                </span>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">{step.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{step.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ─── OUR CLIENTS SECTION ─── */}
        <div className="p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 shadow-sm space-y-6">
          <div className="text-center sm:text-left">
            <span className="text-xs font-black uppercase tracking-widest text-[#ff4526]">Our Clients:</span>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Brand &amp; tim profesional yang telah mempercayai InstaDeck</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {CLIENTS.map((client, idx) => (
              <div
                key={idx}
                className="h-24 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-center overflow-hidden hover:border-[#ff4526]/30 transition-colors"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={client.src}
                  alt={client.name}
                  className="max-h-14 max-w-full object-contain filter grayscale hover:grayscale-0 transition-all opacity-80 hover:opacity-100"
                />
              </div>
            ))}
          </div>
        </div>

        {/* ─── 20 TEMPLATE BISNIS & UMKM HIGHLIGHT ─── */}
        <div className="p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-gradient-to-br dark:from-slate-900/90 dark:to-slate-950 shadow-md space-y-6 transition-colors duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="size-5 text-[#ff4526]" /> 20+ Pilihan Template Bisnis, Brand &amp; UMKM
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Koleksi template visual siap pakai untuk Cafe (ala Fore), Kuliner Padang, Skincare, Retail, Toko Olshop, dan SaaS.
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
                <span className="text-[10px] text-[#ff4526] truncate block font-medium">
                  {style.subLabel || '@instadeck.id'}
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
            <NewslyLogo size={24} showText showProBadge textClassName="text-xs font-black text-slate-700 dark:text-slate-300" />
            <span className="text-slate-400 dark:text-slate-500">— AI Content Automation untuk Carousel &amp; Story</span>
          </div>
          <p>© {new Date().getFullYear()} InstaDeck PRO. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
