'use client';

import * as React from 'react';
import Link from 'next/link';
import { Check, Sparkles, X, Zap, Crown, FileText, Image as ImageIcon, Video, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PLANS, formatIDR } from '@/config/plans';

export function UpgradeDialog({
  open,
  onClose,
  title = 'Tingkatkan ke Newsly AI Pro',
  reason,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  reason?: 'PRO_STYLE' | 'GUEST_LIMIT' | 'TRIAL_EXPIRED' | 'PDF_EXPORT' | null;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl animate-in zoom-in-95 duration-200 text-slate-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          aria-label="Tutup"
        >
          <X className="size-5" />
        </button>

        {/* Header */}
        <div className="p-6 pb-4 text-center">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary to-indigo-600 text-white shadow-lg shadow-primary/30">
            <Crown className="size-6" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/20 border border-primary/40 text-primary text-xs font-black uppercase tracking-wider mb-2">
            <Sparkles className="size-3.5" /> Newsly AI SaaS
          </div>
          <h3 className="text-xl font-black tracking-tight text-white">{title}</h3>
          <p className="mt-1.5 text-xs text-slate-400">
            {reason === 'PRO_STYLE'
              ? 'Template visual eksklusif & fitur kustom foto aktif di paket Kreator Pro.'
              : reason === 'GUEST_LIMIT'
              ? 'Batas coba gratis Anda sudah habis. Mulai berlangganan mulai Rp 19rb untuk lanjut buat konten!'
              : 'Tingkatkan kualitas konten media sosial Anda dengan naskah mendalam dan visual editorial kelas dunia.'}
          </p>
        </div>

        {/* Features Checklist */}
        <div className="mx-6 rounded-2xl border border-slate-800 bg-slate-950/60 p-4 space-y-2.5 text-xs">
          <div className="flex items-center gap-2.5 font-medium text-slate-200">
            <Sparkles className="size-4 text-primary shrink-0" />
            <span>Semua 10 Template Desain Visual Media Instagram</span>
          </div>
          <div className="flex items-center gap-2.5 font-medium text-slate-200">
            <ImageIcon className="size-4 text-emerald-400 shrink-0" />
            <span>Kustomisasi & Ganti Foto Bebas per Slide</span>
          </div>
          <div className="flex items-center gap-2.5 font-medium text-slate-200">
            <FileText className="size-4 text-cyan-400 shrink-0" />
            <span>Ekspor Carousel LinkedIn PDF & Unduh PNG HD</span>
          </div>
          <div className="flex items-center gap-2.5 font-medium text-slate-200">
            <Crown className="size-4 text-amber-400 shrink-0" />
            <span>Watermark Brand / Akun Media Sosial Sendiri</span>
          </div>
        </div>

        {/* Pricing Box */}
        <div className="p-6 pt-4 space-y-3">
          <div className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-primary/15 via-indigo-600/10 to-transparent border border-primary/30 p-4">
            <div>
              <p className="text-xs font-black text-white">Mulai dari Rp 19.000</p>
              <p className="text-[11px] text-slate-400">Pilihan paket hemat & fleksibel</p>
            </div>
            <div className="text-right">
              <span className="text-lg font-black text-white">{formatIDR(PLANS.PRO.price)}</span>
              <span className="text-[10px] text-slate-400 font-medium"> /bln (Pro)</span>
            </div>
          </div>

          <div className="flex gap-2.5">
            <Button asChild size="lg" className="flex-1 rounded-2xl h-11 text-xs font-black bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 text-white shadow-lg shadow-primary/25">
              <Link href="/upgrade">
                <Zap className="size-4 mr-1.5 fill-current" /> Lihat Semua Paket <ArrowRight className="size-4 ml-1" />
              </Link>
            </Button>
            <Button variant="ghost" size="lg" onClick={onClose} className="rounded-2xl h-11 text-xs font-bold text-slate-400 hover:text-white">
              Nanti Saja
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
