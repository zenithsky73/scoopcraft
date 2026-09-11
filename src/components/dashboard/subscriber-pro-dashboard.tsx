'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Zap,
  Layers,
  Crown,
  FileDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MultiInputForm } from '@/components/generate/multi-input-form';
import type { QuotaState } from '@/server/billing/quota';

export type SubscriberProDashboardProps = {
  user: {
    id: string;
    email: string;
    role: string;
    plan: string;
  };
  quota: QuotaState;
};

export function SubscriberProDashboard({ user, quota }: SubscriberProDashboardProps) {
  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-20">
      {/* ─── 1. VIP PRO SUITE HEADER ─── */}
      <div className="relative overflow-hidden rounded-3xl border border-indigo-200/80 dark:border-indigo-500/30 bg-gradient-to-r from-indigo-900/10 via-purple-900/10 to-indigo-900/15 dark:from-slate-900 dark:via-indigo-950/40 dark:to-slate-900 p-6 sm:p-8 shadow-2xl backdrop-blur-xl transition-colors duration-200">
        {/* Glow ambient */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 right-0 w-80 h-80 bg-fuchsia-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-indigo-500/20 border border-amber-400/40 text-amber-600 dark:text-amber-300 font-bold text-xs shadow-sm">
                <Crown className="size-3.5 text-amber-500" />
                <span>KREATOR PRO SUITE // AKTIF</span>
              </div>

              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                <Zap className="size-3 text-emerald-500" />
                <span>Turbo AI Prioritas</span>
              </div>
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                Selamat Datang, <span className="bg-gradient-to-r from-primary via-indigo-500 to-fuchsia-500 bg-clip-text text-transparent">{user.email.split('@')[0]}</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-xl mt-1 leading-relaxed">
                Akun langganan <strong>{user.plan}</strong> Anda aktif. Anda dapat membuat carousel tanpa watermark, mengakses 32 template desain eksklusif, dan ekspor multi-halaman PDF & PNG.
              </p>
            </div>
          </div>

          {/* Quick Metrics Pro Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full lg:w-auto shrink-0">
            <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-center">
              <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Sparkles className="size-3 text-primary" /> Sisa Kuota
              </span>
              <span className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                {quota.remaining} <span className="text-xs font-normal text-slate-400">/ {quota.limit}</span>
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-center">
              <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Layers className="size-3 text-indigo-500" /> Template
              </span>
              <span className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                32 Unlocked
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 shadow-sm col-span-2 sm:col-span-1 flex flex-col justify-center">
              <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <FileDown className="size-3 text-emerald-500" /> Ekspor
              </span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                PDF & PNG HD
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── 2. AI GENERATOR ENGINE ─── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="size-4 text-primary" /> Generator Carousel Pro
          </h2>
          <span className="text-xs font-semibold text-slate-500">Auto-Scrape + Contextual HD Photo</span>
        </div>

        <MultiInputForm isProUser={true} />
      </section>
    </div>
  );
}
