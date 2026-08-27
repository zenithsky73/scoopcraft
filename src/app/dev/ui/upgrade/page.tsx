import { notFound } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { PlanGrid } from '@/components/billing/plan-grid';
import { QuotaMeter } from '@/components/billing/quota-meter';
import type { QuotaState } from '@/server/billing/quota';

export const dynamic = 'force-dynamic';

/**
 * Pratinjau halaman paket dalam tiga keadaan sekaligus — trial hampir habis,
 * kuota terkunci, dan akun pemilik. Menguji ketiganya lewat database berarti
 * mengubah baris user bolak-balik.
 */
const TRIAL: QuotaState = {
  allowed: true,
  reason: null,
  isTrial: true,
  isOwner: false,
  isGuest: false,
  plan: 'TRIAL',
  daysLeft: 2,
  used: 8,
  limit: 10,
  remaining: 2,
  resetsAt: null,
};

const LOCKED: QuotaState = {
  ...TRIAL,
  allowed: false,
  reason: 'QUOTA_EXHAUSTED',
  daysLeft: 2,
  used: 10,
  remaining: 0,
};

const OWNER: QuotaState = {
  allowed: true,
  reason: null,
  isTrial: false,
  isOwner: true,
  isGuest: false,
  plan: 'BUSINESS',
  daysLeft: 0,
  used: 137,
  limit: -1,
  remaining: -1,
  resetsAt: null,
};

export default function DevUpgradePage() {
  if (process.env.NODE_ENV === 'production') notFound();

  return (
    <AppShell title="Pratinjau paket" email="demo@scoopcraft.test" quota={TRIAL}>
      <div className="mx-auto max-w-5xl space-y-8">
        <section className="space-y-3">
          <h3 className="text-sm font-semibold">Trial hampir habis</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <QuotaMeter quota={TRIAL} />
            <QuotaMeter quota={LOCKED} />
          </div>
          <PlanGrid currentPlan="TRIAL" isOwner={false} preview />
        </section>

        <section className="space-y-3">
          <h3 className="text-sm font-semibold">Akun pemilik</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <QuotaMeter quota={OWNER} />
          </div>
          <PlanGrid currentPlan="BUSINESS" isOwner preview />
        </section>
      </div>
    </AppShell>
  );
}
