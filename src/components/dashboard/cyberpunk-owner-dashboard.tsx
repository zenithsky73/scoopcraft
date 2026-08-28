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
    <div className="min-h-screen bg-[#05070f] text-slate-100 relative overflow-hidden font-sans pb-24 selection:bg-cyan-500 selection:text-black">
      {/* ─── CYBERPUNK AMBIENT LIGHTING & HUD MATRIX GRID ─── */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Neon Glow Blobs */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-cyan-500/20 rounded-full blur-[140px]" />
        <div className="absolute top-1/4 -right-32 w-96 h-96 bg-fuchsia-600/20 rounded-full blur-[160px]" />
        <div className="absolute bottom-10 left-1/3 w-80 h-80 bg-amber-500/15 rounded-full blur-[140px]" />

        {/* Matrix Grid Lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#06b6d408_1px,transparent_1px),linear-gradient(to_bottom,#06b6d408_1px,transparent_1px)] bg-[size:32px_32px]" />
        {/* Scanlines Effect */}
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.02)_50%,transparent_50%)] bg-[size:100%_4px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-8">
        {/* ─── 1. CYBERPUNK OWNER COMMAND HEADER ─── */}
        <header className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900/90 via-[#0a0f24]/90 to-slate-900/90 border border-cyan-500/30 shadow-[0_0_50px_rgba(6,182,212,0.15)] backdrop-blur-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 overflow-hidden">
          {/* Top-Right Cyberpunk Corner Accents */}
          <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none">
            <div className="absolute top-0 right-0 w-full h-[2px] bg-cyan-400 shadow-[0_0_10px_#06b6d4]" />
            <div className="absolute top-0 right-0 w-[2px] h-full bg-cyan-400 shadow-[0_0_10px_#06b6d4]" />
          </div>

          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              {/* VIP God-Mode Glitch Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-cyan-500/20 via-fuchsia-500/20 to-amber-500/20 border border-cyan-400/50 text-cyan-300 font-mono text-[11px] font-black uppercase tracking-wider shadow-[0_0_15px_rgba(6,182,212,0.4)] animate-pulse">
                <Crown className="size-3.5 text-amber-400" />
                <span>GOD-MODE OWNER // MASTER COMMAND</span>
              </div>

              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-950/80 border border-slate-800 text-[10px] font-mono text-slate-400">
                <span className="size-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                <span>SERVERLESS LIVE</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white flex items-center gap-3">
              <span className="bg-gradient-to-r from-white via-cyan-200 to-fuchsia-300 bg-clip-text text-transparent">
                Newsly Cyber Studio
              </span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-400">
                v2.5 PRO
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-400 max-w-xl font-medium">
              Selamat datang, <span className="text-cyan-300 font-bold">{user.email}</span>. Anda memiliki akses penuh <span className="text-amber-400 font-bold">UNLIMITED ∞</span> ke seluruh 20 template desain dan engine generator AI.
            </p>
          </div>

          {/* Master Metrics HUD Panel */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full lg:w-auto shrink-0">
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-cyan-500/30 flex flex-col justify-center">
              <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold flex items-center gap-1">
                <Zap className="size-3" /> Kuota AI
              </span>
              <span className="text-lg sm:text-xl font-black text-white">UNLIMITED ∞</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-fuchsia-500/30 flex flex-col justify-center">
              <span className="text-[10px] font-mono uppercase text-fuchsia-400 font-bold flex items-center gap-1">
                <Layers className="size-3" /> Template
              </span>
              <span className="text-lg sm:text-xl font-black text-white">20/20 UNLOCKED</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-emerald-500/30 col-span-2 sm:col-span-1 flex flex-col justify-center">
              <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold flex items-center gap-1">
                <Cpu className="size-3" /> AI Engine
              </span>
              <span className="text-xs font-bold text-emerald-300">Gemini 3.5 Flash</span>
            </div>
          </div>
        </header>

        {/* ─── 2. MAIN WORKSPACE: AI GENERATOR ENGINE ─── */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-cyan-400 flex items-center gap-2">
              <Terminal className="size-4" /> AI Content Synthesis Console
            </h2>
            <span className="text-[11px] font-mono text-slate-500">Mode: Direct Turbo</span>
          </div>

          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800/80 shadow-2xl backdrop-blur-xl relative">
            <MultiInputForm isProUser={true} />
          </div>
        </section>

        {/* ─── 3. 20 MASTER TEMPLATES SHOWCASE GALLERY ─── */}
        <section className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <Layers className="size-5 text-cyan-400" /> Katalog 20 Template Desain Kelas Dunia
              </h2>
              <p className="text-xs text-slate-400">
                Klik kartu atau ikon mata untuk melihat pratinjau 5 slide secara interaktif.
              </p>
            </div>
            <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300">
              20 Template Aktif
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {STYLES.map((style) => (
              <div
                key={style.id}
                onClick={() => setSelectedPreviewStyle(style)}
                className="group p-4 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-900 transition-all duration-300 flex flex-col justify-between cursor-pointer relative overflow-hidden shadow-lg hover:shadow-cyan-500/10"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="size-3 rounded-full shrink-0 shadow-sm"
                        style={{ backgroundColor: style.accentColor }}
                      />
                      <span className="font-bold text-xs text-white group-hover:text-cyan-300 transition-colors truncate">
                        {style.label}
                      </span>
                    </div>

                    <span
                      className="text-[9px] font-black px-2 py-0.5 rounded-full uppercase"
                      style={{
                        backgroundColor: `${style.accentColor}20`,
                        color: style.accentColor,
                        border: `1px solid ${style.accentColor}40`,
                      }}
                    >
                      {style.badge || 'PRO'}
                    </span>
                  </div>

                  {style.subLabel && (
                    <p className="text-[11px] font-semibold text-cyan-400/90 truncate">
                      {style.subLabel}
                    </p>
                  )}

                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {style.description}
                  </p>
                </div>

                <div className="pt-3 mt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 group-hover:text-cyan-300">
                  <span className="font-mono">👁️ Lihat 5 Slide</span>
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
