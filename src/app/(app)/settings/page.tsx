import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getViewer } from '@/server/viewer';
import { db } from '@/server/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { BrandForm } from '@/components/billing/brand-form';
import { APP } from '@/config/app';

export const metadata: Metadata = { title: 'Setelan' };

export default async function SettingsPage() {
  const viewer = await getViewer();
  if (!viewer) redirect('/login');

  const user = await db.user.findUniqueOrThrow({
    where: { id: viewer.user.id },
    include: { brandKit: true },
  });

  const rows = [
    { label: 'Nama', value: user.name || '—' },
    { label: 'Email', value: user.email },
    { label: 'Peran', value: user.role === 'OWNER' ? 'Pemilik (kuota tanpa batas)' : 'Pengguna' },
    { label: 'Paket', value: user.plan },
    { label: 'Status', value: user.subscriptionStatus },
    { label: 'Trial berakhir', value: user.trialEndsAt ? formatDate(user.trialEndsAt) : '—' },
    { label: 'Total generate', value: String(user.generateCount) },
    { label: 'Bergabung', value: formatDate(user.createdAt) },
  ];

  return (
    <div className="mx-auto max-w-work space-y-5">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">Setelan</h2>
        <p className="mt-1 text-sm text-muted">Detail akun kamu.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Identitas di gambar</CardTitle>
        </CardHeader>
        <CardContent>
          <BrandForm
            initialHandle={user.brandKit?.handle ?? null}
            initialDisplayName={user.brandKit?.displayName ?? null}
            initialLogoUrl={user.brandKit?.logoUrl ?? null}
            fallbackHandle={APP.handle}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Akun</CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-border py-0">
          {rows.map((row) => (
            <div key={row.label} className="flex items-center justify-between gap-4 py-3">
              <span className="text-sm text-muted">{row.label}</span>
              <span className="text-sm font-medium">{row.value}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Logo & warna kustom <Badge variant="neutral">Business</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted">Logo, palet warna, dan font sendiri — dibangun bersama gaya Custom Brand.</p>
        </CardContent>
      </Card>
    </div>
  );
}
