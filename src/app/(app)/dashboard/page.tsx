import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Lock, Sparkles } from 'lucide-react';
import { getViewer } from '@/server/viewer';
import { db } from '@/server/db';
import { getQuotaState, QUOTA_MESSAGES } from '@/server/billing/quota';
import { Button } from '@/components/ui/button';
import { MultiInputForm } from '@/components/generate/multi-input-form';
import { CyberpunkOwnerDashboard } from '@/components/dashboard/cyberpunk-owner-dashboard';
import { SubscriberProDashboard } from '@/components/dashboard/subscriber-pro-dashboard';

export const metadata: Metadata = { title: 'Dashboard — Pembuat Konten & Carousel AI' };

export default async function DashboardPage() {
  const viewer = await getViewer();
  if (!viewer) redirect('/login');

  const user = await db.user.findUniqueOrThrow({
    where: { id: viewer.user.id },
    include: { brandKit: true },
  });

  const quota = getQuotaState(user);
  const isOwner = quota.isOwner || user.role === 'OWNER' || user.email === '91venture@gmail.com';
  const isSubscriber = user.plan === 'PRO' || user.plan === 'BUSINESS';

  // ─── 1. JIKA OWNER LOGIN: TAMPILKAN CYBERPUNK VIP GOD-MODE DASHBOARD ───
  if (isOwner) {
    return <CyberpunkOwnerDashboard user={user} />;
  }

  // ─── 2. JIKA PENGGUNA BERLANGGANAN PRO / BUSINESS: TAMPILKAN KREATOR PRO SUITE DASHBOARD ───
  if (isSubscriber) {
    return <SubscriberProDashboard user={user} quota={quota} />;
  }

  // ─── 3. DASHBOARD REGULER / PENGGUNA GRATIS & TAMU ───
  const locked = !quota.allowed;

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-20">
      {/* ─── HERO HEADER BANNER WITH 3D MASCOT ─── */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-gradient-to-r dark:from-slate-900/90 dark:via-slate-900/60 dark:to-slate-950 p-6 sm:p-8 shadow-xl backdrop-blur-xl transition-colors duration-200">
        {/* Glow ambient */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 right-0 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>AI Engine: <strong>Gemini 3.5 Flash Turbo</strong></span>
            </div>

            <div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white flex items-center justify-center md:justify-start gap-2">
                Newsly<span className="bg-gradient-to-r from-cyan-500 via-pink-500 to-amber-500 bg-clip-text text-transparent">AI</span>
              </h1>
              <p className="text-sm sm:text-base font-semibold text-slate-700 dark:text-slate-300 mt-1">
                From News to Stunning Content
              </p>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl mt-1 leading-relaxed">
                Ubah link berita portal, press release, atau ide topik menjadi slide carousel Instagram & LinkedIn berkelas dalam hitungan detik.
              </p>
            </div>

            {/* Workflow Step Pills */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-2 text-[11px] font-bold">
              <span className="px-3 py-1 rounded-xl bg-cyan-100 dark:bg-cyan-950/60 border border-cyan-300 dark:border-cyan-800/60 text-cyan-800 dark:text-cyan-300 flex items-center gap-1.5 shadow-sm">
                🔗 Tempel Link / Naskah
              </span>
              <span className="text-slate-400 font-bold">➔</span>
              <span className="px-3 py-1 rounded-xl bg-purple-100 dark:bg-purple-950/60 border border-purple-300 dark:border-purple-800/60 text-purple-800 dark:text-purple-300 flex items-center gap-1.5 shadow-sm">
                ✨ AI Meriset & Menyusun
              </span>
              <span className="text-slate-400 font-bold">➔</span>
              <span className="px-3 py-1 rounded-xl bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800/60 text-amber-800 dark:text-amber-300 flex items-center gap-1.5 shadow-sm">
                📸 Siap Posting IG & LinkedIn
              </span>
            </div>
          </div>

          {/* 3D Mascot Image */}
          <div className="relative shrink-0 flex justify-center items-center">
            <div className="relative size-36 sm:size-44 drop-shadow-[0_15px_30px_rgba(56,189,248,0.25)] hover:scale-105 transition-transform duration-300">
              <img
                src="/mascot-hero.png"
                alt="Newsly AI Showcase"
                className="w-full h-full object-contain rounded-2xl"
              />
            </div>
          </div>
        </div>
      </div>

      {locked && quota.reason && (
        <div className="flex flex-wrap items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
          <Lock className="mt-0.5 size-4 shrink-0 text-amber-500" aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-slate-900 dark:text-white">Generate baru terkunci</p>
            <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-300">{QUOTA_MESSAGES[quota.reason]}</p>
          </div>
          <Button asChild size="sm" className="bg-primary hover:bg-primary/90 text-white font-bold text-xs">
            <Link href="/upgrade">
              <Sparkles aria-hidden className="size-3.5 mr-1" /> Upgrade
            </Link>
          </Button>
        </div>
      )}

      <MultiInputForm isProUser={false} />
    </div>
  );
}
