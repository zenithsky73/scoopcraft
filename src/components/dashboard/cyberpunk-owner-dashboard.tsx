'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Crown,
  Zap,
  Sparkles,
  Terminal,
  Layers,
  Database,
  Cpu,
  ShieldCheck,
  Flame,
  ArrowRight,
  Sliders,
  ExternalLink,
  Plus,
} from 'lucide-react';
import { MultiInputForm } from '@/components/generate/multi-input-form';
import { STYLES, type StyleDef } from '@/config/styles';
import { TemplatePreviewModal } from '@/components/generate/template-preview-modal';

export type CyberpunkOwnerDashboardProps = {
  user: {
    id: string;
    email: string;
    role: string;
    plan: string;
  };
  totalGenerations?: number;
};

export function CyberpunkOwnerDashboard({ user, totalGenerations = 128 }: CyberpunkOwnerDashboardProps) {
  const [selectedPreviewStyle, setSelectedPreviewStyle] = React.useState<StyleDef | null>(null);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#05070f] text-slate-900 dark:text-slate-100 relative overflow-hidden font-sans pb-24 transition-colors duration-200 selection:bg-indigo-500 selection:text-white">
      {/* ─── CYBERPUNK AMBIENT LIGHTING & HUD MATRIX GRID ─── */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Neon Glow Blobs */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-500/10 dark:bg-cyan-500/20 rounded-full blur-[140px]" />
        <div className="absolute top-1/4 -right-32 w-96 h-96 bg-purple-500/10 dark:bg-fuchsia-600/20 rounded-full blur-[160px]" />
        <div className="absolute bottom-10 left-1/3 w-80 h-80 bg-amber-500/5 dark:bg-amber-500/15 rounded-full blur-[140px]" />

        {/* Matrix Grid Lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0284c708_1px,transparent_1px),linear-gradient(to_bottom,#0284c708_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#06b6d408_1px,transparent_1px),linear-gradient(to_bottom,#06b6d408_1px,transparent_1px)] bg-[size:32px_32px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-8">
        {/* ─── 1. CYBERPUNK OWNER COMMAND HEADER ─── */}
        <header className="relative p-6 sm:p-8 rounded-3xl bg-white dark:bg-gradient-to-r dark:from-slate-900/90 dark:via-[#0a0f24]/90 dark:to-slate-900/90 border border-slate-200 dark:border-cyan-500/30 shadow-lg dark:shadow-[0_0_50px_rgba(6,182,212,0.12)] backdrop-blur-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 overflow-hidden transition-colors duration-200">
          {/* Top-Right Cyberpunk Corner Accents */}
          <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none">
            <div className="absolute top-0 right-0 w-full h-[2px] bg-indigo-600 dark:bg-cyan-400 shadow-[0_0_10px_#4f46e5] dark:shadow-[0_0_10px_#06b6d4]" />
            <div className="absolute top-0 right-0 w-[2px] h-full bg-indigo-600 dark:bg-cyan-400 shadow-[0_0_10px_#4f46e5] dark:shadow-[0_0_10px_#06b6d4]" />
          </div>

          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              {/* VIP God-Mode Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-gradient-to-r dark:from-cyan-500/20 dark:via-fuchsia-500/20 dark:to-amber-500/20 border border-amber-300 dark:border-cyan-500/40 text-amber-900 dark:text-cyan-300 font-mono text-[11px] font-black uppercase tracking-wider shadow-sm animate-pulse">
                <Crown className="size-3.5 text-amber-600 dark:text-amber-400" />
                <span>GOD-MODE OWNER // MASTER COMMAND</span>
              </div>

              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-[10px] font-mono text-slate-700 dark:text-slate-400">
                <span className="size-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-ping inline-block" />
                <span>SERVERLESS LIVE</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
              <span className="bg-gradient-to-r from-slate-900 via-indigo-700 to-purple-800 dark:from-white dark:via-cyan-200 dark:to-fuchsia-300 bg-clip-text text-transparent">
                Newsly Cyber Studio
              </span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-100 dark:bg-cyan-950 border border-indigo-200 dark:border-cyan-500/40 text-indigo-800 dark:text-cyan-400 font-bold">
                v2.5 PRO
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-400 max-w-xl font-medium">
              Selamat datang, <span className="text-indigo-700 dark:text-cyan-300 font-bold">{user.email}</span>. Anda memiliki akses penuh <span className="text-amber-700 dark:text-amber-400 font-bold">UNLIMITED ∞</span> ke seluruh 20 template desain dan engine generator AI.
            </p>
          </div>

          {/* Master Metrics HUD Panel */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full lg:w-auto shrink-0">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-cyan-500/30 flex flex-col justify-center shadow-sm">
              <span className="text-[10px] font-mono uppercase text-indigo-700 dark:text-cyan-400 font-bold flex items-center gap-1">
                <Zap className="size-3" /> Kuota AI
              </span>
              <span className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">UNLIMITED ∞</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-fuchsia-500/30 flex flex-col justify-center shadow-sm">
              <span className="text-[10px] font-mono uppercase text-purple-700 dark:text-fuchsia-400 font-bold flex items-center gap-1">
                <Layers className="size-3" /> Template
              </span>
              <span className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">20/20 UNLOCKED</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-emerald-500/30 col-span-2 sm:col-span-1 flex flex-col justify-center shadow-sm">
              <span className="text-[10px] font-mono uppercase text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1">
                <Cpu className="size-3" /> AI Engine
              </span>
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">Gemini 2.5 Turbo</span>
            </div>
          </div>
        </header>

        {/* ─── 2. MAIN WORKSPACE: AI GENERATOR ENGINE ─── */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-slate-900 dark:text-cyan-400 flex items-center gap-2">
              <Terminal className="size-4 text-indigo-600 dark:text-cyan-400" /> AI Content Synthesis Console
            </h2>
            <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800">
              Mode: Direct Turbo
            </span>
          </div>

          <MultiInputForm isProUser={true} />
        </section>

        {/* ─── 3. 20 MASTER TEMPLATES SHOWCASE GALLERY ─── */}
        <section className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="size-5 text-indigo-600 dark:text-cyan-400" /> Katalog 20 Template Desain Kelas Dunia
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Klik kartu atau ikon mata untuk melihat pratinjau 5 slide secara interaktif.
              </p>
            </div>
            <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-indigo-100 dark:bg-cyan-950 border border-indigo-200 dark:border-cyan-500/40 text-indigo-800 dark:text-cyan-300">
              20 Template Aktif
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {STYLES.map((style) => (
              <div
                key={style.id}
                onClick={() => setSelectedPreviewStyle(style)}
                className="group p-4 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-cyan-500/50 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all duration-300 flex flex-col justify-between cursor-pointer relative overflow-hidden shadow-sm hover:shadow-md"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="size-3 rounded-full shrink-0 shadow-sm"
                        style={{ backgroundColor: style.accentColor }}
                      />
                      <span className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-cyan-300 transition-colors truncate">
                        {style.label}
                      </span>
                    </div>

                    <span
                      className="text-[9px] font-black px-2 py-0.5 rounded-full uppercase"
                      style={{
                        backgroundColor: `${style.accentColor}15`,
                        color: style.accentColor,
                        border: `1px solid ${style.accentColor}30`,
                      }}
                    >
                      {style.badge || 'PRO'}
                    </span>
                  </div>

                  {style.subLabel && (
                    <p className="text-[11px] font-semibold text-indigo-700 dark:text-cyan-400/90 truncate">
                      {style.subLabel}
                    </p>
                  )}

                  <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {style.description}
                  </p>
                </div>

                <div className="pt-3 mt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-cyan-300">
                  <span className="font-mono font-semibold">👁️ Lihat 5 Slide</span>
                  <ArrowRight className="size-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ─── 4. INTERACTIVE 5-SLIDE PREVIEW MODAL ─── */}
      <TemplatePreviewModal
        isOpen={!!selectedPreviewStyle}
        onClose={() => setSelectedPreviewStyle(null)}
        styleDef={selectedPreviewStyle}
      />
    </div>
  );
}
