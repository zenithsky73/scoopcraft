'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Check, Crown, Sparkles, Zap, ShieldCheck, ArrowRight } from 'lucide-react';
import type { Plan } from '@prisma/client';
import { PLAN_LIST, formatIDR, type PaidPlan } from '@/config/plans';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { NativePaymentModal } from '@/components/billing/native-payment-modal';

export function PlanGrid({
  currentPlan,
  isOwner,
  preview,
}: {
  currentPlan: Plan;
  isOwner: boolean;
  preview?: boolean;
}) {
  const router = useRouter();
  const [selectedPlanForModal, setSelectedPlanForModal] = React.useState<PaidPlan | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  function handleOpenCheckout(plan: PaidPlan) {
    setError(null);
    setSuccessMessage(null);
    if (preview) return;
    setSelectedPlanForModal(plan);
  }

  function handlePaymentSuccess(planName: string) {
    setSuccessMessage(`✓ Pembayaran berhasil! Akun Anda kini aktif di ${planName}. Kuota telah ditambahkan.`);
    setTimeout(() => {
      router.refresh();
    }, 1500);
  }

  return (
    <div className="space-y-8">
      {/* Owner VIP Status Banner */}
      {isOwner && (
        <div className="rounded-3xl border border-amber-500/40 bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-amber-600/15 p-6 shadow-xl backdrop-blur-xl transition-colors duration-200">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/30 shrink-0">
                <Crown className="size-6 text-slate-950" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-base font-black text-slate-900 dark:text-white">Akun Pemilik (OWNER GOD-MODE)</p>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-800 dark:text-amber-300 border border-amber-400/40 text-[10px] font-black uppercase">
                    UNLIMITED ACTIVE
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                  Anda memiliki akses penuh tanpa batas kuota ke seluruh 20 template desain dan AI engine. Daftar paket di bawah ini adalah acuan katalog untuk pengguna platform Anda.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-xs font-bold text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-xs font-bold text-emerald-700 dark:text-emerald-300 animate-in fade-in">
          {successMessage}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-3 items-stretch">
        {PLAN_LIST.map((plan) => {
          const active = currentPlan === plan.id;
          const isLite = plan.id === 'BASIC';
          const isPro = plan.id === 'PRO';
          const isBusiness = plan.id === 'BUSINESS';

          return (
            <div
              key={plan.id}
              className={cn(
                'relative flex flex-col justify-between rounded-3xl p-6 transition-all duration-300 backdrop-blur-xl border',
                active
                  ? 'bg-white dark:bg-slate-900/90 border-emerald-500 shadow-xl ring-2 ring-emerald-500/30'
                  : isPro
                  ? 'bg-gradient-to-b from-indigo-50/90 via-white to-indigo-50/50 dark:from-indigo-950/80 dark:via-slate-900/90 dark:to-slate-950 border-primary shadow-xl shadow-primary/10 dark:shadow-primary/20 scale-[1.02] ring-1 ring-primary/50'
                  : isBusiness
                  ? 'bg-gradient-to-b from-purple-50/80 via-white to-purple-50/40 dark:from-purple-950/70 dark:via-slate-900/90 dark:to-slate-950 border-purple-500/40 shadow-lg'
                  : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm'
              )}
            >
              {/* Badge Ribbons */}
              {plan.badge && !active && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span
                    className={cn(
                      'px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-md text-white',
                      isPro
                        ? 'bg-gradient-to-r from-primary to-indigo-600 border border-indigo-400'
                        : isBusiness
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 border border-purple-400'
                        : 'bg-slate-700 dark:bg-slate-800 border border-slate-600 dark:border-slate-700 text-white'
                    )}
                  >
                    {plan.badge}
                  </span>
                </div>
              )}

              {active && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-lg bg-emerald-600 text-white border border-emerald-400">
                    ✓ Sedang Aktif
                  </span>
                </div>
              )}

              <div>
                {/* Header */}
                <div className="space-y-1 mb-4 pt-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">{plan.name}</h3>
                    {isBusiness && <Zap className="size-4 text-purple-600 dark:text-purple-400 fill-current" />}
                    {isPro && <Sparkles className="size-4 text-primary" />}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{plan.subName}</p>
                </div>

                {/* Pricing Display */}
                <div className="pb-5 border-b border-slate-200 dark:border-slate-800/80 mb-5">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                      {formatIDR(plan.price)}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">/bulan</span>
                  </div>
                  <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-800 dark:text-slate-200">
                    <span className="size-1.5 rounded-full bg-primary" />
                    <span>{plan.quotaLabel}</span>
                  </div>
                </div>

                {/* Features List */}
                <ul className="space-y-2.5 mb-6 text-xs text-slate-700 dark:text-slate-300">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <div
                        className={cn(
                          'size-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-white',
                          isPro ? 'bg-primary' : isBusiness ? 'bg-purple-600' : 'bg-slate-700 dark:bg-slate-800'
                        )}
                      >
                        <Check className="size-2.5 stroke-[3]" />
                      </div>
                      <span className={cn(idx === 0 && 'font-bold text-slate-900 dark:text-white')}>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <Button
                  block
                  size="lg"
                  disabled={active && !isOwner}
                  onClick={() => handleOpenCheckout(plan.id)}
                  className={cn(
                    'h-11 rounded-2xl text-xs font-black transition-all shadow-md',
                    active && !isOwner
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700'
                      : isPro
                      ? 'bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-500 text-white shadow-primary/25'
                      : isBusiness
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-95 text-white shadow-purple-600/25'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700'
                  )}
                >
                  {isOwner ? (
                    <span className="flex items-center justify-center gap-1.5 text-amber-300">
                      👑 Tes Checkout Modal <ArrowRight className="size-3.5" />
                    </span>
                  ) : active ? (
                    'Paket Anda Saat Ini'
                  ) : (
                    <span className="flex items-center justify-center gap-1.5">
                      Langganan Sekarang <ArrowRight className="size-3.5" />
                    </span>
                  )}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Trust & Guarantee Box */}
      <div className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/40 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600 dark:text-slate-400">
        <div className="flex items-center gap-3">
          <ShieldCheck className="size-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>
            Didukung oleh <strong>Payment Gateway Instan</strong> (QRIS, GoPay, ShopeePay, Transfer Bank BCA/Mandiri/BRI/BNI).
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0 font-bold text-slate-700 dark:text-slate-300">
          <span>⚡ Aktivasi Otomatis</span>
          <span>•</span>
          <span>🔒 Enkripsi 256-bit</span>
        </div>
      </div>

      {/* Native Payment Modal Checkout */}
      <NativePaymentModal
        isOpen={!!selectedPlanForModal}
        onClose={() => setSelectedPlanForModal(null)}
        planId={selectedPlanForModal}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
}
