import Link from 'next/link';
import { APP } from '@/config/app';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { Sparkles, Layers, Zap, Download, ShieldCheck, ArrowRight } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200 relative overflow-hidden selection:bg-primary/20">
      {/* ─── AMBIENT BACKGROUND GLOWS (NO SPLIT BORDER) ─── */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 size-[600px] rounded-full bg-gradient-to-tr from-indigo-500/15 via-purple-500/10 to-cyan-500/15 dark:from-indigo-600/15 dark:via-purple-600/10 dark:to-cyan-500/10 blur-[140px]" />
      <div className="pointer-events-none absolute -bottom-40 left-1/2 -translate-x-1/2 size-[500px] rounded-full bg-gradient-to-br from-cyan-500/15 via-indigo-500/10 to-pink-500/15 dark:from-cyan-600/10 dark:via-indigo-600/10 dark:to-pink-600/10 blur-[140px]" />

      {/* Grid Pattern Overlay */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] dark:bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)]" />

      {/* Top Navbar */}
      <header className="h-16 flex items-center justify-between px-4 sm:px-8 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl shrink-0 z-20">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="size-9 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 flex items-center justify-center shadow-md shadow-indigo-600/15 group-hover:scale-105 transition-transform">
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
            className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-primary transition-colors"
          >
            <span>Kembali ke Beranda</span>
            <ArrowRight className="size-3.5" />
          </Link>
          <ThemeToggle />
        </div>
      </header>

      {/* ─── MAIN CENTERED UNIFIED WORKSPACE ─── */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 sm:py-12 relative z-10">
        <div className="w-full max-w-[460px] space-y-5">
          {/* Glass Card Container */}
          <div className="rounded-[32px] border border-slate-200/90 dark:border-slate-800/90 bg-white/95 dark:bg-slate-900/90 p-6 sm:p-9 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.07)] dark:shadow-[0_25px_70px_-15px_rgba(0,0,0,0.6)] backdrop-blur-2xl transition-all duration-200">
            {/* Integrated Mascot Header */}
            <div className="flex flex-col items-center justify-center mb-6 text-center">
              <div className="relative mb-3 group">
                <div className="absolute -inset-1.5 rounded-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-pink-500 opacity-70 blur-md group-hover:opacity-100 transition duration-300 animate-pulse" />
                <div className="relative size-16 sm:size-18 rounded-full bg-white dark:bg-slate-950 p-2 border border-slate-200 dark:border-slate-800 flex items-center justify-center shadow-lg">
                  <img
                    src="/robot-avatar.png"
                    alt="Newsly AI Mascot"
                    className="w-full h-full object-contain drop-shadow-sm"
                  />
                </div>
              </div>
            </div>

            {/* Form Content (Login / Register) */}
            {children}
          </div>

          {/* Feature Highlight Pills (Seamless & Compact) */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-[11px] font-bold text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm backdrop-blur-md">
              <Layers className="size-3 text-indigo-600 dark:text-indigo-400" />
              <span>20 Template Desain</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm backdrop-blur-md">
              <Zap className="size-3 text-cyan-600 dark:text-cyan-400" />
              <span>Gemini 2.5 Turbo</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm backdrop-blur-md">
              <Download className="size-3 text-emerald-600 dark:text-emerald-400" />
              <span>Ekspor PDF &amp; ZIP</span>
            </div>
          </div>

          {/* Security Footer Note */}
          <p className="text-center text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1.5">
            <ShieldCheck className="size-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Enkripsi 256-bit • Privasi &amp; Data Terjamin Aman</span>
          </p>
        </div>
      </main>
    </div>
  );
}
