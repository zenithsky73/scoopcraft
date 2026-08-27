'use client';

import * as React from 'react';
import Link from 'next/link';
import { Check, Sparkles, X, Zap, Crown, FileText, Image as ImageIcon, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PLANS, formatIDR } from '@/config/plans';

export function UpgradeDialog({
  open,
  onClose,
  title = 'Buka Semua Fitur Pro',
  reason,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  reason?: 'PRO_STYLE' | 'GUEST_LIMIT' | 'TRIAL_EXPIRED' | 'PDF_EXPORT' | null;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1.5 text-muted hover:bg-surface-2 hover:text-fg transition-colors"
          aria-label="Tutup"
        >
          <X className="size-5" />
        </button>

        {/* Header with gradient badge */}
        <div className="p-6 pb-4 text-center">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-lg shadow-orange-500/20">
            <Crown className="size-6" />
          </div>
          <Badge variant="accent" className="mb-2">
            <Sparkles className="size-3 mr-1" /> Scoopcraft Pro
          </Badge>
          <h3 className="text-xl font-bold tracking-tight text-fg">{title}</h3>
          <p className="mt-1 text-xs text-muted">
            {reason === 'PRO_STYLE'
              ? 'Template visual ini eksklusif untuk pengguna paket Pro ke atas.'
              : reason === 'GUEST_LIMIT'
              ? 'Batas percobaan gratis Anda sudah habis. Buat akun & berlangganan untuk generate tanpa batas!'
              : 'Tingkatkan kualitas konten media sosial Anda dengan naskah mendalam dan visual editorial kelas dunia.'}
          </p>
        </div>

        {/* Features Checklist */}
        <div className="mx-6 rounded-xl border border-border/80 bg-surface-2/60 p-4 space-y-2.5 text-xs">
          <div className="flex items-center gap-2.5 font-medium text-fg">
            <Sparkles className="size-4 text-amber-500 shrink-0" />
            <span>Semua 9 Visual Desain Pro (Editorial, Bloomberg Finance, Tech HUD, dll.)</span>
          </div>
          <div className="flex items-center gap-2.5 font-medium text-fg">
            <Video className="size-4 text-blue-500 shrink-0" />
            <span>Ekstraksi Video YouTube Otomatis (Transkrip & Subtitle)</span>
          </div>
          <div className="flex items-center gap-2.5 font-medium text-fg">
            <FileText className="size-4 text-emerald-500 shrink-0" />
            <span>Ekspor Carousel LinkedIn PDF & ZIP Lengkap</span>
          </div>
          <div className="flex items-center gap-2.5 font-medium text-fg">
            <ImageIcon className="size-4 text-purple-500 shrink-0" />
            <span>Kustomisasi & Ganti Foto Bebas per Slide</span>
          </div>
        </div>

        {/* Pricing Box */}
        <div className="p-6 pt-4 flex flex-col gap-3">
          <div className="flex items-baseline justify-between rounded-xl bg-accent/10 border border-accent/20 px-4 py-3">
            <div>
              <p className="text-xs font-semibold text-accent">Paket Pro Paling Populer</p>
              <p className="text-2xs text-muted">200 generate / bulan · Semua format</p>
            </div>
            <div className="text-right">
              <span className="text-lg font-bold text-fg">{formatIDR(PLANS.PRO.price)}</span>
              <span className="text-2xs text-muted"> / bln</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button asChild size="lg" className="flex-1 shadow-md shadow-accent/20">
              <Link href="/upgrade">
                <Zap className="size-4 mr-1.5" /> Berlangganan Sekarang
              </Link>
            </Button>
            <Button variant="ghost" size="lg" onClick={onClose}>
              Nanti Saja
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
