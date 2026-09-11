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
  Users,
  Bot,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MultiInputForm } from '@/components/generate/multi-input-form';
import { MasterQuotaInjector } from '@/components/dashboard/master-quota-injector';

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
        <header className="relative p-6 sm:p-8 rounded-3xl bg-white dark:bg-gradient-to-r dark:from-slate-900/90 dark:via-[#0a0f24]/90 dark:to-slate-900/90 border border-slate-200 dark:border-primary/30 shadow-lg dark:shadow-[0_0_50px_rgba(255,69,38,0.12)] backdrop-blur-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 overflow-hidden transition-colors duration-200">
          {/* Top-Right Cyberpunk Corner Accents */}
          <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none">
            <div className="absolute top-0 right-0 w-full h-[2px] bg-primary dark:bg-primary shadow-[0_0_10px_#ff4526]" />
            <div className="absolute top-0 right-0 w-[2px] h-full bg-primary dark:bg-primary shadow-[0_0_10px_#ff4526]" />
          </div>

          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              {/* VIP God-Mode Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-gradient-to-r dark:from-primary/20 dark:via-amber-500/20 dark:to-yellow-500/20 border border-amber-300 dark:border-primary/40 text-amber-900 dark:text-amber-300 font-mono text-[11px] font-black uppercase tracking-wider shadow-sm animate-pulse">
                <Crown className="size-3.5 text-amber-600 dark:text-amber-400" />
                <span>GOD-MODE OWNER // MASTER COMMAND</span>
              </div>

              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-[10px] font-mono text-slate-700 dark:text-slate-400">
                <span className="size-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-ping inline-block" />
                <span>SERVERLESS LIVE</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
              <span className="bg-gradient-to-r from-slate-900 via-primary to-orange-600 dark:from-white dark:via-primary dark:to-amber-300 bg-clip-text text-transparent">
                InstaDeck PRO Studio
              </span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-primary/10 dark:bg-primary/20 border border-primary/20 dark:border-primary/40 text-primary font-bold">
                v2.5 PRO
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-400 max-w-xl font-medium">
              Selamat datang, <span className="text-primary font-bold">{user.email}</span>. Anda memiliki akses penuh <span className="text-amber-700 dark:text-amber-400 font-bold">UNLIMITED ∞</span> ke seluruh 32 template desain dan engine generator AI.
            </p>
          </div>

          {/* Master Metrics HUD Panel */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full lg:w-auto shrink-0">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-primary/30 flex flex-col justify-center shadow-sm">
              <span className="text-[10px] font-mono uppercase text-primary font-bold flex items-center gap-1">
                <Zap className="size-3" /> Kuota AI
              </span>
              <span className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">UNLIMITED ∞</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-amber-500/30 flex flex-col justify-center shadow-sm">
              <span className="text-[10px] font-mono uppercase text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
                <Layers className="size-3" /> Template
              </span>
              <span className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">32 Unlocked</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-cyan-500/30 col-span-2 sm:col-span-1 flex flex-col justify-center shadow-sm">
              <span className="text-[10px] font-mono uppercase text-indigo-700 dark:text-cyan-400 font-bold flex items-center gap-1">
                <ShieldCheck className="size-3" /> Status
              </span>
              <span className="text-xs font-mono font-black text-emerald-600 dark:text-emerald-400">
                OWNER VIP
              </span>
            </div>
          </div>
        </header>

        {/* ─── QUICK SHORTCUT TO ADMIN INJECTOR ─── */}
        <section className="p-5 rounded-2xl bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm transition-colors duration-200">
          <div className="flex items-center gap-3.5">
            <div className="size-10 rounded-xl bg-amber-100 dark:bg-amber-500/10 border border-amber-300 dark:border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
              <Users className="size-5" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                Manajemen Pengguna &amp; Injector Kuota
              </h3>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                Kelola daftar pengguna terdaftar, tambah kuota kustom, atau ubah paket subscriber.
              </p>
            </div>
          </div>

          <Button asChild size="sm" className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shrink-0 rounded-xl shadow-sm">
            <Link href="/admin/users" className="flex items-center gap-1.5">
              <span>Buka Master Users</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </Button>
        </section>

        {/* ─── 2. MAIN WORKSPACE: AI GENERATOR ENGINE ─── */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <Terminal className="size-4 text-primary" /> AI Content Synthesis Console
            </h2>
            <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800">
              Mode: Direct Turbo
            </span>
          </div>

          <MultiInputForm isProUser={true} />
        </section>
      </div>
    </div>
  );
}
