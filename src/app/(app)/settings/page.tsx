import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getViewer } from '@/server/viewer';
import { db } from '@/server/db';
import { getQuotaState } from '@/server/billing/quota';
import { SettingsHub } from '@/components/settings/settings-hub';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Pengaturan & Brand Kit — Newsly AI' };

export default async function SettingsPage() {
  const viewer = await getViewer();
  if (!viewer) redirect('/login');

  const user = await db.user.findUniqueOrThrow({
    where: { id: viewer.user.id },
    include: { brandKit: true },
  });

  const quota = getQuotaState(user);
  const quotaRemaining = quota.remaining < 0 ? 9999 : quota.remaining;
  const quotaTotal = quota.limit < 0 ? 9999 : quota.limit;

  return (
    <div className="mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
      <SettingsHub
        user={{
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          plan: user.plan,
          subscriptionStatus: user.subscriptionStatus,
          trialEndsAt: user.trialEndsAt,
          generateCount: user.generateCount,
          createdAt: user.createdAt,
          brandKit: user.brandKit
            ? {
                handle: user.brandKit.handle,
                displayName: user.brandKit.displayName,
                logoUrl: user.brandKit.logoUrl,
                hideNewslyWatermark: user.brandKit.hideNewslyWatermark,
                tagline: user.brandKit.tagline,
              }
            : null,
        }}
        quotaRemaining={quotaRemaining}
        quotaTotal={quotaTotal}
      />
    </div>
  );
}
