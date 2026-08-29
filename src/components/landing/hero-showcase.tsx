'use client';

import * as React from 'react';
import { Sparkles, ArrowRight, Layers, Zap, TrendingUp, CheckCircle2, Bookmark, Heart, MessageCircle, Share2 } from 'lucide-react';

export function HeroShowcase() {
  return (
    <div className="relative w-full max-w-lg mx-auto select-none py-6">
      {/* ─── AMBIENT GLOW BACKDROPS ─── */}
      <div className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 size-72 rounded-full bg-gradient-to-tr from-cyan-500/25 via-indigo-500/20 to-pink-500/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-10 right-0 size-60 rounded-full bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-amber-500/20 blur-3xl" />

      {/* ─── FLOATING TOP-LEFT PILL: LINK INPUT ─── */}
      <div className="absolute -top-3 -left-4 sm:-left-6 z-30 animate-bounce duration-1000 hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-700/80 shadow-xl backdrop-blur-xl text-xs font-bold text-slate-800 dark:text-slate-200">
        <div className="size-6 rounded-lg bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-mono text-[11px]">
          🔗
        </div>
        <span>URL Berita ➔ Carousel</span>
      </div>

      {/* ─── FLOATING TOP-RIGHT PILL: AI ENGINE ─── */}
      <div className="absolute -top-2 -right-3 sm:-right-4 z-30 hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-indigo-600/90 to-purple-600/90 border border-indigo-400/40 shadow-xl shadow-indigo-500/20 backdrop-blur-xl text-xs font-bold text-white">
        <Sparkles className="size-4 text-amber-300 animate-pulse" />
        <span>Gemini 2.5 Turbo</span>
      </div>

      {/* ─── 3D LAYERED CAROUSEL STACK CONTAINER ─── */}
      <div className="relative group cursor-pointer perspective-[1000px]">
        {/* Layer 3: Backmost Slide (Outro & CTA) */}
        <div className="absolute inset-0 rounded-[28px] bg-gradient-to-br from-slate-800 to-slate-950 border border-slate-700/60 p-5 shadow-2xl transform -rotate-6 -translate-x-4 -translate-y-4 scale-95 opacity-50 transition-transform duration-500 group-hover:-rotate-8 group-hover:-translate-x-6 group-hover:-translate-y-6">
          <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold">
            <span>#OUTRO</span>
            <span>5/5</span>
          </div>
          <p className="mt-8 text-xs font-bold text-slate-400">Simpan &amp; Bagikan jika bermanfaat!</p>
        </div>

        {/* Layer 2: Middle Slide (Key Insight Point) */}
        <div className="absolute inset-0 rounded-[28px] bg-gradient-to-br from-indigo-950/80 to-slate-900 border border-indigo-500/30 p-5 shadow-2xl transform rotate-3 translate-x-3 -translate-y-2 scale-98 opacity-75 transition-transform duration-500 group-hover:rotate-6 group-hover:translate-x-5 group-hover:-translate-y-3">
          <div className="flex justify-between items-center text-[10px] text-indigo-400 font-bold">
            <span className="px-2 py-0.5 rounded-full bg-indigo-500/20">POINT 01</span>
            <span>2/5</span>
          </div>
          <div className="mt-6 space-y-2">
            <div className="h-3 w-3/4 bg-indigo-400/30 rounded-full" />
            <div className="h-2.5 w-full bg-slate-700/50 rounded-full" />
            <div className="h-2.5 w-5/6 bg-slate-700/50 rounded-full" />
          </div>
        </div>

        {/* Layer 1: FRONT HERO SLIDE (Ultra-Crisp Carousel Cover) */}
        <div className="relative rounded-[28px] bg-gradient-to-b from-slate-900 via-slate-900 to-[#0c1222] border border-slate-700/80 dark:border-indigo-500/30 p-6 sm:p-7 shadow-[0_20px_50px_rgba(15,23,42,0.6)] dark:shadow-[0_25px_60px_rgba(79,70,229,0.25)] transition-transform duration-500 group-hover:scale-[1.02]">
          {/* Slide Top Bar */}
          <div className="flex items-center justify-between gap-2 pb-4 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-black bg-rose-500/20 border border-rose-500/30 text-rose-400">
                <span className="size-1.5 rounded-full bg-rose-500 animate-ping" />
                BREAKING TECH
              </span>
              <span className="text-[11px] font-mono text-slate-400">@newsly.ai</span>
            </div>
            <span className="px-2 py-0.5 rounded-md text-[11px] font-black font-mono bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              1 / 5
            </span>
          </div>

          {/* Slide Body Headline */}
          <div className="pt-5 pb-6 space-y-3">
            <h3 className="text-lg sm:text-xl font-black text-white leading-snug tracking-tight">
              Kecerdasan Buatan Ubah Cara Bikin Konten: Dari Artikel Berita Jadi Carousel Viral
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Otomatisasi riset mendalam dan ekstraksi poin penting ke dalam desain feed visual Instagram &amp; LinkedIn dalam hitungan detik.
            </p>
          </div>

          {/* Visual Mini Infographic Graphic */}
          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="size-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20 font-bold text-xs">
                ⚡
              </div>
              <div>
                <p className="text-xs font-black text-white">Visual Storytelling</p>
                <p className="text-[10px] text-slate-400">Format Carousel 1080×1350</p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-1 rounded-lg border border-emerald-800/50">
              <TrendingUp className="size-3.5" />
              <span>+380% Reach</span>
            </div>
          </div>

          {/* Slide Footer Action */}
          <div className="mt-5 pt-3.5 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 hover:text-rose-400 transition-colors">
                <Heart className="size-3.5 text-rose-500 fill-rose-500/20" /> 2.4k
              </span>
              <span className="flex items-center gap-1 hover:text-cyan-400 transition-colors">
                <MessageCircle className="size-3.5 text-cyan-400" /> 184
              </span>
              <span className="flex items-center gap-1 hover:text-indigo-400 transition-colors">
                <Share2 className="size-3.5 text-indigo-400" /> 920
              </span>
            </div>

            <div className="flex items-center gap-1 text-[11px] font-black text-indigo-400 hover:text-indigo-300">
              <span>GESER</span>
              <ArrowRight className="size-3.5 animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* ─── FLOATING BOTTOM-LEFT METRICS PILL ─── */}
      <div className="absolute -bottom-3 -left-3 sm:-left-5 z-30 flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-slate-200/90 dark:border-slate-700/90 shadow-2xl backdrop-blur-xl text-xs">
        <div className="size-7 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black">
          <CheckCircle2 className="size-4" />
        </div>
        <div>
          <p className="text-[11px] font-black text-slate-900 dark:text-white">Ekspor PDF &amp; ZIP</p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">Resolusi HD 1080p Tajam</p>
        </div>
      </div>

      {/* ─── FLOATING BOTTOM-RIGHT BADGE ─── */}
      <div className="absolute -bottom-2 -right-3 sm:-right-4 z-30 hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-600 text-white shadow-xl shadow-pink-500/20 text-xs font-black">
        <span>📸 20 Pilihan Gaya Desain</span>
      </div>
    </div>
  );
}
