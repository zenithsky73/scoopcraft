'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Check, Crown, Info } from 'lucide-react';
import type { Plan } from '@prisma/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PLAN_LIST, formatIDR, type PaidPlan } from '@/config/plans';
import { cn } from '@/lib/utils';

export function PlanGrid({
  currentPlan,
  isOwner,
  preview,
}: {
  currentPlan: Plan;
  isOwner: boolean;
  /**
   * Mematikan pemanggilan API — dipakai halaman pratinjau UI. Berupa boolean,
   * bukan callback: server component tidak bisa mengoper fungsi ke client
   * component, dan pratinjaunya memang tidak perlu bereaksi apa pun.
   */
  preview?: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = React.useState<Plan | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  async function subscribe(plan: PaidPlan) {
    setError(null);

    if (preview) return;

    setPending(plan);

    const res = await fetch('/api/billing/activate', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ plan }),
    });

    const body = await res.json().catch(() => ({}));
    setPending(null);

    if (!res.ok) {
      setError(body.error ?? 'Gagal mengaktifkan langganan.');
      return;
    }

    router.refresh();
  }

  if (isOwner) {
    return (
      <Card className="border-accent">
        <CardContent className="flex flex-wrap items-center gap-3 py-5">
          <Crown className="size-5 shrink-0 text-accent" aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">Akun pemilik</p>
            <p className="mt-0.5 text-sm text-muted">
              Generate tanpa batas, tanpa masa trial. Tidak perlu berlangganan.
            </p>
          </div>
          <Badge variant="accent">Unlimited</Badge>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2.5 rounded-md border border-border bg-surface-2 p-3">
        <Info className="mt-0.5 size-4 shrink-0 text-muted" aria-hidden />
        <p className="text-sm text-muted">
          Pembayaran belum tersambung. Menekan Subscribe langsung mengaktifkan paket untuk pengujian.
        </p>
      </div>

      {error && (
        <p className="rounded-md border border-danger/25 bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        {PLAN_LIST.map((plan) => {
          const active = currentPlan === plan.id;

          return (
            <Card key={plan.id} className={cn(plan.highlight && !active && 'border-accent', active && 'border-success')}>
              <CardContent className="flex h-full flex-col gap-4 py-5">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold">{plan.name}</h3>
                  {active ? (
                    <Badge variant="success">Paket aktif</Badge>
                  ) : (
                    plan.highlight && <Badge variant="accent">Populer</Badge>
                  )}
                </div>

                <p className="text-2xl font-semibold tabular-nums">
                  {formatIDR(plan.price)}
                  <span className="text-sm font-normal text-muted"> /bulan</span>
                </p>

                <ul className="space-y-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-muted">
                      <Check className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button
                  block
                  className="mt-auto"
                  variant={active ? 'secondary' : plan.highlight ? 'primary' : 'secondary'}
                  disabled={active}
                  loading={pending === plan.id}
                  onClick={() => subscribe(plan.id)}
                >
                  {active ? 'Sedang dipakai' : 'Subscribe'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
