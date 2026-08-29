'use client';

import * as React from 'react';
import {
  X,
  QrCode,
  Building2,
  Wallet,
  Check,
  Copy,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  CreditCard,
  Zap,
} from 'lucide-react';
import type { Plan } from '@prisma/client';
import { PLANS, formatIDR, type PaidPlan } from '@/config/plans';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface NativePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  planId: PaidPlan | null;
  onSuccess: (planName: string) => void;
}

export function NativePaymentModal({
  isOpen,
  onClose,
  planId,
  onSuccess,
}: NativePaymentModalProps) {
  const [activeTab, setActiveTab] = React.useState<'QRIS' | 'VA' | 'EWALLET'>('QRIS');
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [successState, setSuccessState] = React.useState(false);
  const [orderId, setOrderId] = React.useState('');

  // Generate unique Order ID whenever modal opens
  React.useEffect(() => {
    if (isOpen && planId) {
      const randomCode = Math.floor(100 + Math.random() * 900);
      const timestamp = Date.now().toString().slice(-6);
      setOrderId(`NW-${planId}-${timestamp}-${randomCode}`);
      setSuccessState(false);
      setLoading(false);
    }
  }, [isOpen, planId]);

  if (!isOpen || !planId) return null;

  const plan = PLANS[planId];

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleConfirmPayment = async () => {
    setLoading(true);

    try {
      const res = await fetch('/api/billing/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planId }),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        alert(data.error || 'Terjadi kendala saat konfirmasi pembayaran.');
        return;
      }

      setSuccessState(true);
      setTimeout(() => {
        onSuccess(plan.name);
        onClose();
      }, 1800);
    } catch (err: any) {
      setLoading(false);
      alert(err.message || 'Terjadi kesalahan sistem.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div
        className="relative w-full max-w-lg rounded-[28px] bg-slate-900 border border-slate-800 text-slate-100 shadow-2xl shadow-black/80 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary shadow-sm">
              <CreditCard className="size-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-black tracking-tight text-white flex items-center gap-1.5">
                Payment Gateway Newsly AI
              </h3>
              <p className="text-[10px] font-mono text-slate-400">
                Order ID: <span className="text-slate-300 font-bold">{orderId}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="size-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5">
          {/* Total Pembayaran Banner Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Total Pembayaran
            </p>
            <div className="text-3xl font-black tracking-tight text-white mt-1">
              {formatIDR(plan.price)}
            </div>
            <div className="mt-2 flex items-center justify-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary/20 border border-primary/40 text-primary text-[10px] font-black uppercase">
                <Sparkles className="size-3" /> {plan.name}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-bold">
                <Zap className="size-3 text-amber-400" /> {plan.quotaLabel}
              </span>
            </div>
          </div>

          {/* Payment Method Tabs */}
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Pilih Metode Pembayaran:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('QRIS')}
                className={cn(
                  'py-2.5 px-2 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all border',
                  activeTab === 'QRIS'
                    ? 'bg-primary/20 border-primary text-white shadow-md shadow-primary/20 ring-1 ring-primary'
                    : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                )}
              >
                <QrCode className="size-4" />
                <span>QRIS Instan</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('VA')}
                className={cn(
                  'py-2.5 px-2 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all border',
                  activeTab === 'VA'
                    ? 'bg-primary/20 border-primary text-white shadow-md shadow-primary/20 ring-1 ring-primary'
                    : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                )}
              >
                <Building2 className="size-4" />
                <span>Transfer Bank</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('EWALLET')}
                className={cn(
                  'py-2.5 px-2 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all border',
                  activeTab === 'EWALLET'
                    ? 'bg-primary/20 border-primary text-white shadow-md shadow-primary/20 ring-1 ring-primary'
                    : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                )}
              >
                <Wallet className="size-4" />
                <span>E-Wallet / WA</span>
              </button>
            </div>
          </div>

          {/* Tab 1: QRIS Instan */}
          {activeTab === 'QRIS' && (
            <div className="space-y-3 animate-fade-in">
              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 text-center">
                <p className="text-[11px] font-semibold text-slate-400 mb-3">
                  Mendukung: <span className="text-slate-200 font-bold">BCA, GoPay, OVO, DANA, ShopeePay, Livin Mandiri, BRImo</span>
                </p>

                {/* QRIS Visual Card */}
                <div className="mx-auto w-48 h-48 bg-white rounded-2xl p-3 shadow-xl flex flex-col items-center justify-between relative border-4 border-slate-200">
                  {/* QRIS Header */}
                  <div className="w-full flex items-center justify-between border-b border-slate-200 pb-1">
                    <span className="text-[10px] font-black text-slate-900 tracking-wider">QRIS</span>
                    <span className="text-[8px] font-bold text-slate-500">GPN</span>
                  </div>

                  {/* QR Code SVG */}
                  <svg className="w-32 h-32 text-slate-900" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm10-2h8v8h-8V2zm2 2v4h4V4h-4zM2 14h8v8H2v-8zm2 2v4h4v-4H4zm14 0h4v4h-4v-4zm-4 4h4v4h-4v-4zm0-4h4v4h-4v-4zm4-4h4v4h-4v-4zm-8-2h2v2h-2v-2zm2 2h2v2h-2v-2zm-2 2h2v2h-2v-2zm4-4h2v2h-2v-2zm2 2h2v2h-2v-2z" />
                  </svg>

                  {/* NMID Footer */}
                  <div className="text-[9px] font-mono text-slate-700 font-bold">
                    NMID: ID1020304050
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 mt-3">
                  Buka aplikasi mobile banking atau e-wallet Anda, lalu scan QRIS di atas.
                </p>
              </div>
            </div>
          )}

          {/* Tab 2: Transfer Bank */}
          {activeTab === 'VA' && (
            <div className="space-y-2.5 animate-fade-in">
              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 space-y-3">
                <p className="text-[11px] font-semibold text-slate-400">
                  Transfer tepat sesuai nominal ke salah satu rekening resmi di bawah:
                </p>

                {/* Bank BCA */}
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-black text-blue-400 tracking-wider">BANK BCA</span>
                    <p className="text-sm font-mono font-black text-white">0601 188 154</p>
                    <p className="text-[10px] text-slate-400">A/N: Muhammad Zeno</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy('0601188154', 'BCA')}
                    className="h-8 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 flex items-center gap-1.5 transition-colors"
                  >
                    {copiedKey === 'BCA' ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
                    <span>{copiedKey === 'BCA' ? 'Tersalin' : 'Salin'}</span>
                  </button>
                </div>

                {/* SeaBank */}
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-black text-orange-400 tracking-wider">SEABANK</span>
                    <p className="text-sm font-mono font-black text-white">9011 3209 9830</p>
                    <p className="text-[10px] text-slate-400">A/N: Muhammad Zeno</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy('901132099830', 'SEABANK')}
                    className="h-8 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 flex items-center gap-1.5 transition-colors"
                  >
                    {copiedKey === 'SEABANK' ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
                    <span>{copiedKey === 'SEABANK' ? 'Tersalin' : 'Salin'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: E-Wallet / WhatsApp */}
          {activeTab === 'EWALLET' && (
            <div className="space-y-3 animate-fade-in">
              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 space-y-3">
                {/* ShopeePay / GoPay / DANA */}
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-black text-emerald-400 tracking-wider">SHOPEEPAY / GOPAY / DANA</span>
                    <p className="text-sm font-mono font-black text-white">0838 3701 7301</p>
                    <p className="text-[10px] text-slate-400">A/N: Muhammad Zeno</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy('083837017301', 'EWALLET')}
                    className="h-8 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 flex items-center gap-1.5 transition-colors"
                  >
                    {copiedKey === 'EWALLET' ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
                    <span>{copiedKey === 'EWALLET' ? 'Tersalin' : 'Salin'}</span>
                  </button>
                </div>

                {/* Direct WhatsApp Confirmation Button */}
                <a
                  href={`https://wa.me/6283837017301?text=Halo%20Admin%20Newsly%20AI%2C%20saya%20sudah%20transfer%20untuk%20aktivasi%20paket%20${plan.name}%20dengan%20Order%20ID%3A%20${orderId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/40 hover:bg-emerald-600/30 text-emerald-300 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <span>💬 Konfirmasi Cepat ke WhatsApp Admin (083837017301)</span>
                  <ExternalLink className="size-3.5" />
                </a>
              </div>
            </div>
          )}

          {/* Success Notification */}
          {successState && (
            <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500 text-emerald-300 text-xs font-bold text-center space-y-1 animate-fade-in">
              <CheckCircle2 className="size-6 text-emerald-400 mx-auto" />
              <p>Pembayaran Berhasil Dikonfirmasi!</p>
              <p className="text-[10px] text-emerald-400 font-normal">
                Paket {plan.name} aktif! Mengalihkan ke Dashboard...
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2 pt-1">
            <Button
              type="button"
              block
              disabled={loading || successState}
              loading={loading}
              onClick={handleConfirmPayment}
              className="h-12 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-lg shadow-emerald-600/30 ring-2 ring-emerald-400/40 transition-all hover:scale-[1.01]"
            >
              <span className="flex items-center justify-center gap-2">
                <Check className="size-4 stroke-[3]" /> Konfirmasi Pembayaran Selesai (Aktifkan Paket)
              </span>
            </Button>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2 text-center text-xs font-bold text-slate-400 hover:text-slate-200 transition-colors"
            >
              Batal
            </button>
          </div>
        </div>

        {/* Footer Guarantee */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
          <div className="flex items-center gap-1.5 font-semibold">
            <ShieldCheck className="size-3.5 text-emerald-400" />
            <span>Enkripsi 256-bit &amp; Garansi Aktivasi Instan</span>
          </div>
          <span className="font-mono text-slate-400">Newsly AI Studio</span>
        </div>
      </div>
    </div>
  );
}
