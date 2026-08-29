'use client';

import * as React from 'react';
import { Crown, Zap, UserCheck, Sparkles, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/input';

export function MasterQuotaInjector() {
  const [targetEmail, setTargetEmail] = React.useState('');
  const [selectedPlan, setSelectedPlan] = React.useState<'STARTER' | 'PRO' | 'AGENCY'>('PRO');
  const [customQuota, setCustomQuota] = React.useState(200);
  const [loading, setLoading] = React.useState(false);
  const [message, setMessage] = React.useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handlePlanChange = (plan: 'STARTER' | 'PRO' | 'AGENCY') => {
    setSelectedPlan(plan);
    if (plan === 'STARTER') setCustomQuota(50);
    else if (plan === 'PRO') setCustomQuota(200);
    else if (plan === 'AGENCY') setCustomQuota(1000);
  };

  const handleInject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetEmail) return;

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/api/admin/inject-quota', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetEmail,
          plan: selectedPlan,
          quotaAmount: customQuota,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Gagal menyuntikkan kuota.');
      }

      setMessage({ type: 'success', text: data.message });
      setTargetEmail('');
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Terjadi kesalahan.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-cyan-500/30 shadow-xl backdrop-blur-xl space-y-4 transition-colors duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-300 dark:border-amber-500/30">
            <Crown className="size-4" />
          </div>
          <div>
            <h3 className="font-black text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
              Master User Quota & Role Injector
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Suntikkan kuota dan upgrade status pengguna secara instan (untuk transaksi manual / VIP).
            </p>
          </div>
        </div>
        <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-950 border border-cyan-300 dark:border-cyan-500/40 text-cyan-800 dark:text-cyan-300 self-start sm:self-auto">
          GOD-MODE TOOL
        </span>
      </div>

      <form onSubmit={handleInject} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          {/* Target Email */}
          <div className="sm:col-span-6 space-y-1.5">
            <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Email Pengguna Target:
            </Label>
            <Input
              type="email"
              placeholder="klien@gmail.com"
              value={targetEmail}
              onChange={(e) => setTargetEmail(e.target.value)}
              required
              className="h-10 text-xs bg-slate-50 dark:bg-slate-950/90 border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400"
            />
          </div>

          {/* Plan Selector */}
          <div className="sm:col-span-4 space-y-1.5">
            <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Paket Langganan:
            </Label>
            <div className="grid grid-cols-3 gap-1">
              <button
                type="button"
                onClick={() => handlePlanChange('STARTER')}
                className={`py-2 px-1 text-[11px] font-bold rounded-lg border transition-all ${
                  selectedPlan === 'STARTER'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800'
                }`}
              >
                Starter
              </button>
              <button
                type="button"
                onClick={() => handlePlanChange('PRO')}
                className={`py-2 px-1 text-[11px] font-bold rounded-lg border transition-all ${
                  selectedPlan === 'PRO'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800'
                }`}
              >
                Pro
              </button>
              <button
                type="button"
                onClick={() => handlePlanChange('AGENCY')}
                className={`py-2 px-1 text-[11px] font-bold rounded-lg border transition-all ${
                  selectedPlan === 'AGENCY'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800'
                }`}
              >
                Agency
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <div className="sm:col-span-2">
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-10 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-md shadow-amber-500/20 flex items-center justify-center gap-1.5"
            >
              {loading ? (
                <span>Menyuntik...</span>
              ) : (
                <>
                  <Zap className="size-3.5 fill-current" />
                  <span>Suntik</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Message Alert */}
        {message && (
          <div
            className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
              message.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                : 'bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="size-4 text-red-600 shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}
      </form>
    </div>
  );
}
