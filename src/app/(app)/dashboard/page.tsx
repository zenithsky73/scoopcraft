import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Lock, Sparkles } from 'lucide-react';
import { getViewer } from '@/server/viewer';
import { db } from '@/server/db';
import { getQuotaState, QUOTA_MESSAGES } from '@/server/billing/quota';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UrlInputForm } from '@/components/generate/url-input-form';
import { SLIDES } from '@/server/design/deck';
import { APP } from '@/config/app';

export const metadata: Metadata = { title: 'Buat konten' };

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
    <div className="mx-auto max-w-work space-y-5">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">Buat konten</h2>
        <p className="mt-1 text-sm text-muted">Tempel URL artikel berita, pilih gaya, format, dan jumlah slide.</p>
      </div>

      {locked && quota.reason && (
        <div className="flex flex-wrap items-start gap-3 rounded-lg border border-warning/30 bg-warning/10 p-4">
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

      {/* Akun yang belum diisi akan tercetak sebagai handle bawaan aplikasi —
          lebih baik diberitahu sebelum menghasilkan 10 gambar. */}
      {!user.brandKit?.handle && (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-surface-2 p-3">
          <p className="min-w-0 flex-1 text-sm text-muted">
            Gambar akan memakai akun bawaan <span className="font-medium text-fg">{APP.handle}</span>.
          </p>
          <Button asChild variant="secondary" size="sm">
            <Link href="/settings">Pakai akunku</Link>
          </Button>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>URL artikel</CardTitle>
          <CardDescription>Mendukung sebagian besar portal berita.</CardDescription>
        </CardHeader>
        <CardContent>
          <UrlInputForm disabled={locked} defaultSlides={SLIDES.default} />
        </CardContent>
      </Card>
    </div>
  );
}
