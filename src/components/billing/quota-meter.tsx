import Link from 'next/link';
import { Crown, UserPlus } from 'lucide-react';
import { ProgressBar } from '@/components/ui/progress-bar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { QuotaState } from '@/server/billing/quota';
import { TRIAL } from '@/config/trial';
import { cn } from '@/lib/utils';

export function QuotaMeter({ quota, compact = false }: { quota: QuotaState; compact?: boolean }) {
  // Akun pemilik tidak punya bar untuk diisi — tampilkan penanda, bukan
  // meteran kosong yang menyesatkan.
  if (quota.isOwner) {
    return (
      <div
        className={cn(
          'flex items-center gap-2.5 rounded-md border border-accent/25 bg-accent-soft p-3',
          compact && 'py-2.5',
        )}
      >
        <Crown className="size-4 shrink-0 text-accent" aria-hidden />
        <div className="min-w-0">
          <p className="text-2xs font-medium uppercase tracking-wide text-accent">Pemilik</p>
          <p className="text-sm font-medium text-accent">Generate tanpa batas</p>
        </div>
      </div>
    );
  }

  // Tamu: yang penting bukan angka sisa, tapi ajakan mendaftar sebelum
  // kontennya hilang bersama cookie.
  if (quota.isGuest) {
    return (
      <div className={cn('rounded-md border border-border bg-surface-2 p-3', compact && 'py-2.5')}>
        <p className="text-2xs font-medium uppercase tracking-wide text-muted">Mode coba</p>
        <p className="mt-1 text-sm font-medium">
          {quota.remaining > 0 ? `${quota.remaining} percobaan tersisa` : 'Percobaan gratis habis'}
        </p>
        <p className="hint mt-1">Daftar gratis untuk menyimpan hasilnya.</p>
        <Button asChild size="sm" block className="mt-3">
          <Link href="/register">
            <UserPlus aria-hidden /> Daftar gratis
          </Link>
        </Button>
      </div>
    );
  }

  const unlimited = quota.limit < 0;
  const lowQuota = !unlimited && quota.remaining <= Math.max(1, Math.ceil(quota.limit * 0.2));
  const lowDays = quota.isTrial && quota.daysLeft <= 3;
  const tone = !quota.allowed ? 'danger' : lowQuota || lowDays ? 'warning' : 'accent';

  return (
    <div
      className={cn(
        'rounded-md border border-border bg-surface-2 p-3',
        compact && 'flex items-center justify-between gap-3 py-2.5',
      )}
    >
      <div className={cn(compact && 'min-w-0 flex-1')}>
        <div className="mb-1.5 flex items-center justify-between gap-2">
          <span className="text-2xs font-medium uppercase tracking-wide text-muted">
            {quota.isTrial ? 'Trial' : quota.plan}
          </span>
          {!quota.allowed && <Badge variant="danger">Terkunci</Badge>}
        </div>

        <p className="mb-2 text-sm font-medium tabular-nums">
          {quota.isTrial ? (
            <>
              {quota.daysLeft} hari
              {TRIAL.mode !== 'DAYS_ONLY' && <span className="text-muted"> · {quota.remaining} generate</span>}
            </>
          ) : unlimited ? (
            'Tanpa batas'
          ) : (
            <>
              {quota.remaining} <span className="text-muted">dari {quota.limit} generate</span>
            </>
          )}
        </p>

        {!unlimited && <ProgressBar value={quota.used} max={quota.limit} tone={tone} />}
      </div>

      {(quota.isTrial || !quota.allowed) && (
        <Button
          asChild
          variant={quota.allowed ? 'secondary' : 'primary'}
          size="sm"
          block={!compact}
          className={cn(!compact && 'mt-3')}
        >
          <Link href="/upgrade">Upgrade</Link>
        </Button>
      )}
    </div>
  );
}
