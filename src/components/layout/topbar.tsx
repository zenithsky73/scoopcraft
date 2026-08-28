'use client';

import Link from 'next/link';
import { Crown, Sparkles } from 'lucide-react';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { UserMenu } from '@/components/layout/user-menu';
import type { QuotaState } from '@/server/billing/quota';

export function Topbar({
  title,
  email,
  quota,
}: {
  title: string;
  email?: string | null;
  quota?: QuotaState;
}) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 px-4 backdrop-blur-xl lg:px-8 transition-colors duration-200">
      {/* Mobile Brand Logo */}
      <div className="flex items-center gap-2.5 lg:hidden">
        <Link href="/dashboard" className="flex items-center gap-2">
          <img
            src="/logo-icon.png"
            alt="Newsly AI"
            className="size-7 object-contain"
          />
          <span className="text-sm font-black tracking-tight text-slate-900 dark:text-white">
            Newsly<span className="bg-gradient-to-r from-cyan-500 via-pink-500 to-amber-500 bg-clip-text text-transparent">AI</span>
          </span>
        </Link>
      </div>

      <div className="hidden lg:flex items-center gap-3">
        <h1 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">{title}</h1>
      </div>

      {/* Right Controls: Theme Switcher, Role Badge & User Profile Menu */}
      <div className="flex items-center gap-2.5">
        <ThemeToggle />

        {quota?.isOwner ? (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 dark:bg-gradient-to-r dark:from-amber-500/20 dark:to-yellow-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/30 text-xs font-black uppercase tracking-wider shadow-sm">
            <Crown className="size-3.5 text-amber-500 dark:text-amber-400" />
            <span>OWNER</span>
          </div>
        ) : quota?.isGuest ? (
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-cyan-100 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-800 text-[11px] font-bold">
            <span>Tamu ({quota.remaining}x)</span>
          </div>
        ) : (
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 dark:bg-primary/20 text-primary border border-primary/20 dark:border-primary/30 text-[11px] font-bold">
            <Sparkles className="size-3" />
            <span>{quota?.remaining ?? 20} Kuota</span>
          </div>
        )}

        <div className="h-5 w-px bg-slate-200 dark:bg-slate-800 mx-0.5" />
        <UserMenu email={email} isOwner={quota?.isOwner} isGuest={quota?.isGuest} />
      </div>
    </header>
  );
}
