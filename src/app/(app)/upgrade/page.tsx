import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Sparkles, Crown } from 'lucide-react';
import { getViewer } from '@/server/viewer';
import { getQuotaState } from '@/server/billing/quota';
import { PlanGrid } from '@/components/billing/plan-grid';
import { QuotaMeter } from '@/components/billing/quota-meter';
import { formatDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Pilihan Paket & Kuota — Newsly AI' };

export default async function UpgradePage() {
  const viewer = await getViewer();
  if (!viewer) redirect('/login');

  const user = viewer.user;
  const quota = getQuotaState(user);

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-12">
      {/* Header Section */}
      <div className="text-center sm:text-left space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold text-primary">
          <Sparkles className="size-3.5" />
          <span>Investasi Terbaik untuk Konten Media Sosial Anda</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
          Pilihan Paket &amp; Kuota Langganan
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
          Tingkatkan produktivitas konten media sosial dengan 20 template visual media papan atas, ekspor carousel LinkedIn PDF, dan kuota melimpah.
        </p>
      </div>

      {/* Status Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 backdrop-blur-xl shadow-sm">
          <QuotaMeter quota={quota} />
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 backdrop-blur-xl shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Status Akun Saat Ini
            </p>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-base font-black text-slate-900 dark:text-white">
                {quota.isOwner ? '👑 Pemilik Aplikasi (OWNER)' : `Paket ${user.plan}`}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-700 dark:text-slate-300">
                {user.subscriptionStatus}
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 pt-3 border-t border-slate-200 dark:border-slate-800/80">
            {quota.isOwner
              ? 'Tanpa batas kuota dan tanpa masa berlaku selamanya.'
              : quota.isTrial
              ? user.trialEndsAt
                ? `Masa uji coba gratis aktif hingga ${formatDate(user.trialEndsAt)}.`
                : 'Masa uji coba berjalan.'
              : quota.resetsAt
              ? `Kuota bulanan berikutnya akan direset pada ${formatDate(quota.resetsAt)}.`
              : 'Aktif.'}
          </p>
        </div>
      </div>

      {/* Plan Grid */}
      <PlanGrid currentPlan={user.plan} isOwner={quota.isOwner} />
    </div>
  );
}
