'use client';

import * as React from 'react';
import { Sparkles, ArrowRight, Layers, Zap, TrendingUp, CheckCircle2, Bookmark, Heart, MessageCircle, Share2 } from 'lucide-react';

export function HeroShowcase() {
  return (
    <div className="relative w-full max-w-lg mx-auto select-none py-6">
      {/* ─── AMBIENT GLOW BACKDROPS ─── */}
      <div className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 size-72 rounded-full bg-gradient-to-tr from-[#ff4526]/20 via-orange-500/15 to-amber-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-10 right-0 size-60 rounded-full bg-gradient-to-br from-pink-500/15 via-[#ff4526]/20 to-orange-500/15 blur-3xl" />

      {/* ─── FLOATING TOP-LEFT PILL: LINK INPUT ─── */}
      <div className="absolute -top-3 -left-4 sm:-left-6 z-30 animate-bounce duration-1000 hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-slate-200/90 dark:border-slate-700/90 shadow-xl backdrop-blur-xl text-xs font-bold text-slate-800 dark:text-slate-200">
        <div className="size-6 rounded-lg bg-[#fff0ec] dark:bg-[#ff4526]/20 text-[#ff4526] flex items-center justify-center font-mono text-[11px]">
          ⚡
        </div>
        <span>Topik / URL ➔ Carousel</span>
      </div>

      {/* ─── FLOATING TOP-RIGHT PILL: AI ENGINE ─── */}
      <div className="absolute -top-2 -right-3 sm:-right-4 z-30 hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-[#ff4526] to-orange-500 border border-[#ff866a]/40 shadow-xl shadow-[#ff4526]/25 backdrop-blur-xl text-xs font-bold text-white">
        <Sparkles className="size-4 text-amber-200 animate-pulse" />
        <span>Gemini 2.5 Flash</span>
      </div>

      {/* ─── 3D LAYERED CAROUSEL STACK CONTAINER ─── */}
      <div className="relative group cursor-pointer perspective-[1000px]">
        {/* Layer 3: Backmost Slide (Outro & CTA) */}
        <div className="absolute inset-0 rounded-[28px] bg-gradient-to-br from-slate-800 to-slate-950 border border-slate-700/60 p-5 shadow-2xl transform -rotate-6 -translate-x-4 -translate-y-4 scale-95 opacity-50 transition-transform duration-500 group-hover:-rotate-8 group-hover:-translate-x-6 group-hover:-translate-y-6">
          <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold">
            <span>#OUTRO CTA</span>
            <span>5/5</span>
          </div>
          <p className="mt-8 text-xs font-bold text-slate-400">Order via Link di Bio / Simpan Postingan!</p>
        </div>

        {/* Layer 2: Middle Slide (Key Insight Point) */}
        <div className="absolute inset-0 rounded-[28px] bg-gradient-to-br from-[#1e1410] to-slate-900 border border-[#ff4526]/30 p-5 shadow-2xl transform rotate-3 translate-x-3 -translate-y-2 scale-98 opacity-75 transition-transform duration-500 group-hover:rotate-6 group-hover:translate-x-5 group-hover:-translate-y-3">
          <div className="flex justify-between items-center text-[10px] text-[#ff7e5e] font-bold">
            <span className="px-2 py-0.5 rounded-full bg-[#ff4526]/20">POINT 01 · KEUNGGULAN</span>
            <span>2/5</span>
          </div>
          <div className="mt-6 space-y-2">
            <div className="h-3 w-3/4 bg-[#ff7e5e]/30 rounded-full" />
            <div className="h-2.5 w-full bg-slate-700/50 rounded-full" />
            <div className="h-2.5 w-5/6 bg-slate-700/50 rounded-full" />
          </div>
        </div>

        {/* Layer 1: FRONT HERO SLIDE (Ultra-Crisp Carousel Cover) */}
        <div className="relative rounded-[28px] bg-gradient-to-b from-slate-900 via-slate-900 to-[#0e1017] border border-slate-700/80 dark:border-[#ff4526]/30 p-6 sm:p-7 shadow-[0_20px_50px_rgba(15,23,42,0.6)] dark:shadow-[0_25px_60px_rgba(255,69,38,0.2)] transition-transform duration-500 group-hover:scale-[1.02]">
          {/* Slide Top Bar */}
          <div className="flex items-center justify-between gap-2 pb-4 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-black bg-[#ff4526]/20 border border-[#ff4526]/40 text-[#ff7e5e]">
                <span className="size-1.5 rounded-full bg-[#ff4526] animate-ping" />
                ✨ MENU SPESIAL
              </span>
              <span className="text-[11px] font-mono text-slate-400">@instadeck.id</span>
            </div>
            <span className="px-2 py-0.5 rounded-md text-[11px] font-black font-mono bg-[#ff4526]/20 text-[#ff7e5e] border border-[#ff4526]/30">
              1 / 5
            </span>
          </div>

          {/* Slide Body Headline */}
          <div className="pt-5 pb-6 space-y-3">
            <h3 className="text-lg sm:text-xl font-black text-white leading-snug tracking-tight">
              Kecerdasan Buatan Ubah Ide &amp; Topik Menjadi Konten Carousel dan Story Siap Posting
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              Cukup ketik topik atau tempel link. Naskah hook, desain visual carousel, caption lengkap, hingga auto-schedule ke Instagram selesai dalam hitungan detik.
            </p>
          </div>

          {/* Visual Mini Infographic Graphic */}
          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="size-8 rounded-xl bg-gradient-to-tr from-[#ff4526] to-orange-500 flex items-center justify-center text-white shadow-md shadow-[#ff4526]/30 font-bold text-xs">
                📱
              </div>
              <div>
                <p className="text-xs font-black text-white">Carousel 4:5 &amp; Story 9:16</p>
                <p className="text-[10px] text-slate-400">Desain Visual Otomatis</p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-1 rounded-lg border border-emerald-800/50">
              <TrendingUp className="size-3.5" />
              <span>+380% Jangkauan</span>
            </div>
          </div>

          {/* Slide Footer Action */}
          <div className="mt-5 pt-3.5 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 hover:text-[#ff7e5e] transition-colors">
                <Heart className="size-3.5 text-[#ff4526] fill-[#ff4526]/20" /> 2.4k
              </span>
              <span className="flex items-center gap-1 hover:text-[#ff7e5e] transition-colors">
                <MessageCircle className="size-3.5 text-slate-400" /> 184
              </span>
              <span className="flex items-center gap-1 hover:text-[#ff7e5e] transition-colors">
                <Share2 className="size-3.5 text-slate-400" /> 920
              </span>
            </div>

            <div className="flex items-center gap-1 text-[11px] font-black text-[#ff7e5e] hover:text-[#ff9b87]">
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
          <p className="text-[11px] font-black text-slate-900 dark:text-white">Ekspor PDF, ZIP &amp; Auto-Post</p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">HD 1080p Instagram Ready</p>
        </div>
      </div>

      {/* ─── FLOATING BOTTOM-RIGHT BADGE ─── */}
      <div className="absolute -bottom-2 -right-3 sm:-right-4 z-30 hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-[#ff4526] to-orange-600 text-white shadow-xl shadow-[#ff4526]/25 text-xs font-black">
        <span>🎨 20+ Template Brand &amp; UMKM</span>
      </div>
    </div>
  );
}
