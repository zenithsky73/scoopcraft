import Link from 'next/link';
import { APP } from '@/config/app';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { Sparkles, Layers, Zap, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Top Navbar */}
      <header className="h-16 flex items-center justify-between px-4 sm:px-8 border-b border-slate-200 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl shrink-0 z-20">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="size-9 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 flex items-center justify-center shadow-md shadow-indigo-600/15 group-hover:scale-105 transition-transform">
            <img
              src="/logo-icon.png"
              alt="Newsly AI"
              className="size-7 object-contain"
            />
          </div>
          <span className="text-base font-black tracking-tight text-slate-900 dark:text-white">
            Newsly<span className="bg-gradient-to-r from-cyan-500 via-pink-500 to-amber-500 bg-clip-text text-transparent">AI</span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="hidden sm:flex items-center gap-1 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-primary transition-colors"
          >
            <span>Kembali ke Beranda</span>
            <ArrowRight className="size-3.5" />
          </Link>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Split-Screen Container */}
      <div className="flex-1 flex flex-col lg:flex-row items-stretch justify-center relative overflow-hidden">
        {/* Decorative Background Glows */}
        <div className="pointer-events-none absolute -top-40 -left-40 size-[500px] rounded-full bg-indigo-500/15 dark:bg-indigo-500/10 blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-40 -right-40 size-[500px] rounded-full bg-cyan-500/15 dark:bg-cyan-500/10 blur-[120px]" />

        {/* ─── LEFT PANEL: HERO SHOWCASE (Desktop) ─── */}
        <div className="hidden lg:flex lg:w-1/2 p-12 flex-col justify-between relative bg-gradient-to-br from-indigo-900/10 via-slate-900/5 to-cyan-900/10 dark:from-indigo-950/40 dark:via-slate-950 dark:to-cyan-950/40 border-r border-slate-200 dark:border-slate-800/80">
          <div className="space-y-6 max-w-lg">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold text-primary">
              <Sparkles className="size-3.5" />
              <span>Platform AI Carousel #1 di Indonesia</span>
            </div>

            <h2 className="text-3xl xl:text-4xl font-black text-slate-900 dark:text-white leading-tight tracking-tight">
              Ubah Berita & Ide Menjadi{' '}
              <span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-pink-400 bg-clip-text text-transparent">
                Slide Carousel Viral
              </span>{' '}
              dalam 1,4 Detik.
            </h2>

            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Otomasi riset konten berita, penulisan copywriting viral, hingga rendering 5 slide visual profesional siap posting ke Instagram & LinkedIn.
            </p>

            {/* Feature Badges Grid */}
            <div className="space-y-3 pt-4">
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 shadow-sm backdrop-blur-md">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-primary shrink-0">
                  <Layers className="size-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white">20 Template Desain Kelas Dunia</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Bloomberg, Streetwear, Editorial, Minimal, Podcast, dll.</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 shadow-sm backdrop-blur-md">
                <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 shrink-0">
                  <Zap className="size-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white">Riset Kilat Multi-Sumber</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Dukungan link berita, video YouTube, naskah, dan prompt ide.</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 shadow-sm backdrop-blur-md">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                  <CheckCircle2 className="size-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white">Ekspor Instan 1-Klik</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Unduh PDF Carousel LinkedIn, PNG Single, atau Semua PNG (.ZIP).</p>
                </div>
              </div>
            </div>
          </div>

          {/* Social Proof */}
          <div className="pt-6 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-emerald-600 dark:text-emerald-400" />
              <span>Privasi data &amp; aset terenkripsi aman</span>
            </div>
            <span className="font-mono font-bold text-[11px]">Newsly Engine v2.5</span>
          </div>
        </div>

        {/* ─── RIGHT PANEL: FORM CONTAINER (Responsive) ─── */}
        <main className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 lg:p-12 relative z-10">
          <div className="w-full max-w-md">
            {/* Robot Mascot Glow Header */}
            <div className="flex flex-col items-center justify-center mb-6 text-center">
              <div className="relative group">
                <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-pink-500 opacity-60 blur-md group-hover:opacity-100 transition duration-300" />
                <div className="relative size-18 sm:size-20 rounded-full bg-white dark:bg-slate-900 p-2 border border-slate-200 dark:border-slate-800 flex items-center justify-center shadow-xl">
                  <img
                    src="/robot-avatar.png"
                    alt="Newsly AI Mascot"
                    className="w-full h-full object-contain drop-shadow-md"
                  />
                </div>
              </div>
            </div>

            {/* Auth Glass Card */}
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/80 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl transition-all duration-200">
              {children}
            </div>

            {/* Safe Footer Note */}
            <p className="mt-6 text-center text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1.5">
              <span>🔒 Dilindungi oleh Autentikasi Enkripsi 256-bit</span>
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
