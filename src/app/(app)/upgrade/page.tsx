import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getViewer } from '@/server/viewer';
import { db } from '@/server/db';
import { getQuotaState } from '@/server/billing/quota';
import { PlanGrid } from '@/components/billing/plan-grid';
import { QuotaMeter } from '@/components/billing/quota-meter';
import { formatDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Upgrade' };

export default async function UpgradePage() {
  const viewer = await getViewer();
  if (!viewer) redirect('/login');

  const user = viewer.user;
  const quota = getQuotaState(user);

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">Paket &amp; kuota</h2>
        <p className="mt-1 text-sm text-muted">
          Konten lama tetap bisa dilihat dan diunduh walau kuota habis.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <QuotaMeter quota={quota} />

        <div className="rounded-md border border-border bg-surface-2 p-3">
          <p className="text-2xs font-medium uppercase tracking-wide text-muted">Status</p>
          <p className="mt-1 text-sm font-medium">
            {quota.isOwner ? 'Pemilik aplikasi' : `${user.plan} · ${user.subscriptionStatus}`}
          </p>
          <p className="hint mt-2">
            {quota.isOwner
              ? 'Tanpa batas kuota dan tanpa masa berlaku.'
              : quota.isTrial
                ? user.trialEndsAt
                  ? `Trial berakhir ${formatDate(user.trialEndsAt)}.`
                  : 'Masa trial berjalan.'
                : quota.resetsAt
                  ? `Kuota direset ${formatDate(quota.resetsAt)}.`
                  : 'Belum ada jadwal reset kuota.'}
          </p>
        </div>
      </div>

      <PlanGrid currentPlan={user.plan} isOwner={quota.isOwner} />
    </div>
  );
}
