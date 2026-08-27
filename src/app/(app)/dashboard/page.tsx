import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Lock, Sparkles } from 'lucide-react';
import { getViewer } from '@/server/viewer';
import { db } from '@/server/db';
import { getQuotaState, QUOTA_MESSAGES } from '@/server/billing/quota';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MultiInputForm } from '@/components/generate/multi-input-form';
import { SLIDES } from '@/server/design/deck';
import { APP } from '@/config/app';

export const metadata: Metadata = { title: 'Buat Konten & Carousel' };

export default async function DashboardPage() {
  const viewer = await getViewer();
  if (!viewer) redirect('/login');

  const user = await db.user.findUniqueOrThrow({
    where: { id: viewer.user.id },
    include: { brandKit: true },
  });

  const quota = getQuotaState(user);
  const locked = !quota.allowed;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="text-center sm:text-left">
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
          Studio Pembuat Carousel & Konten
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Ubah link berita, teks artikel, atau prompt ide menjadi slide carousel media sosial kelas dunia dalam hitungan detik.
        </p>
      </div>

      {locked && quota.reason && (
        <div className="flex flex-wrap items-start gap-3 rounded-2xl border border-warning/30 bg-warning/10 p-4">
          <Lock className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">Generate baru terkunci</p>
            <p className="mt-0.5 text-sm text-muted">{QUOTA_MESSAGES[quota.reason]}</p>
          </div>
          <Button asChild size="sm">
            <Link href="/upgrade">
              <Sparkles aria-hidden /> Upgrade
            </Link>
          </Button>
        </div>
      )}

      <MultiInputForm />
    </div>
  );
}
