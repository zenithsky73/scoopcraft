import Link from 'next/link';
import { Crown, Sparkles, UserPlus, Zap } from 'lucide-react';
import { ProgressBar } from '@/components/ui/progress-bar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { QuotaState } from '@/server/billing/quota';
import { TRIAL } from '@/config/trial';
import { cn } from '@/lib/utils';

export function QuotaMeter({ quota, compact = false }: { quota: QuotaState; compact?: boolean }) {
  // 1. Akun OWNER (Pemilik Aplikasi): Akses Unlimited
  if (quota.isOwner) {
    return (
      <div
        className={cn(
          'flex items-center gap-3 rounded-2xl border border-amber-500/40 bg-gradient-to-br from-amber-500/10 via-amber-600/5 to-amber-950/20 dark:from-amber-500/15 dark:via-amber-600/10 dark:to-amber-950/30 p-3.5 shadow-md shadow-amber-500/5 transition-colors duration-200',
          compact && 'py-2.5 px-3.5',
        )}
      >
        <div className="size-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-500 dark:text-amber-400 shrink-0">
          <Crown className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-400">
            OWNER ACCOUNT
          </p>
          <p className="text-xs font-bold text-slate-900 dark:text-slate-200">
            Generate Tanpa Batas ⚡
          </p>
        </div>
      </div>
    );
  }

  // 2. Akun Tamu (Guest)
  if (quota.isGuest) {
    return (
      <div className={cn('rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 p-3.5 space-y-2 shadow-sm transition-colors duration-200', compact && 'py-2.5 px-3.5')}>
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-black uppercase tracking-wider text-cyan-700 dark:text-cyan-400">
            Mode Tamu
          </p>
          <span className="text-[11px] font-mono font-bold text-slate-700 dark:text-slate-300">
            {quota.remaining} / 10 Kuota
          </span>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-tight">
          Daftar akun gratis agar seluruh carousel otomatis tersimpan permanen.
        </p>
        <Button asChild size="sm" className="w-full h-8 text-xs font-bold bg-primary hover:bg-primary/90 text-white rounded-xl shadow-sm">
          <Link href="/register">
            <UserPlus className="size-3.5 mr-1" /> Daftar Gratis (20x)
          </Link>
        </Button>
      </div>
    );
  }

  // 3. Akun Terdaftar (TRIAL / PRO / BASIC)
  const unlimited = quota.limit < 0;
  const lowQuota = !unlimited && quota.remaining <= Math.max(1, Math.ceil(quota.limit * 0.2));
  const lowDays = quota.isTrial && quota.daysLeft <= 3;
  const tone = !quota.allowed ? 'danger' : lowQuota || lowDays ? 'warning' : 'accent';

  return (
    <div
      className={cn(
        'rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white/90 dark:bg-slate-900/80 p-3.5 shadow-sm transition-colors duration-200 backdrop-blur-md',
        compact
          ? 'flex flex-row items-center justify-between gap-3 py-2.5 px-3.5 space-y-0'
          : 'space-y-2.5',
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {quota.isTrial ? 'Trial Gratis' : quota.plan}
          </span>
          {!quota.allowed && (
            <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800">
              Habis
            </span>
          )}
        </div>

        <p className="text-xs font-bold text-slate-900 dark:text-white tabular-nums truncate">
          {quota.isTrial ? (
            <>
              {quota.daysLeft} hari{' '}
              <span className="text-slate-500 dark:text-slate-400 font-normal">
                · {quota.remaining} kuota tersisa
              </span>
            </>
          ) : unlimited ? (
            'Generate Tanpa Batas'
          ) : (
            <>
              {quota.remaining} <span className="text-slate-500 dark:text-slate-400 font-normal">dari {quota.limit} kuota</span>
            </>
          )}
        </p>

        {!unlimited && (
          <div className="mt-1.5">
            <ProgressBar value={quota.used} max={quota.limit} tone={tone} />
          </div>
        )}
      </div>

      {(quota.isTrial || !quota.allowed) && (
        <Button
          asChild
          variant={quota.allowed ? 'secondary' : 'primary'}
          size="sm"
          className={cn(
            'text-xs font-bold rounded-xl shrink-0 h-8',
            compact
              ? 'w-auto px-3.5 bg-gradient-to-r from-primary/10 to-indigo-500/10 dark:from-primary/20 dark:to-indigo-500/20 border border-primary/30 text-primary hover:bg-primary hover:text-white shadow-sm'
              : 'w-full mt-2'
          )}
        >
          <Link href="/upgrade" className="flex items-center gap-1.5">
            <Sparkles className="size-3.5 text-primary shrink-0" />
            <span>Upgrade PRO</span>
          </Link>
        </Button>
      )}
    </div>
  );
}
