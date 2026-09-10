'use client';

import * as React from 'react';
import {
  X,
  Instagram,
  Sparkles,
  AtSign,
  CheckCircle2,
  AlertCircle,
  Plus,
  Zap,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/input';
import { notify } from '@/lib/notify';
import { cn } from '@/lib/utils';
import type { SocialPlatform } from '@prisma/client';

interface ConnectAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccountConnected?: (account: any) => void;
  defaultPlatform?: SocialPlatform;
}

const PLATFORMS: {
  id: SocialPlatform;
  label: string;
  badge: string;
  desc: string;
  color: string;
  gradient: string;
  icon: any;
  placeholder: string;
  example: string;
}[] = [
  {
    id: 'INSTAGRAM',
    label: 'Instagram Pro',
    badge: 'Feed & Carousel',
    desc: 'Posting carousel slide promosi & katalog produk otomatis ke Instagram.',
    color: '#E1306C',
    gradient: 'from-pink-500 via-purple-600 to-orange-500',
    icon: Instagram,
    placeholder: '@namatoko_id',
    example: '@racun.shopee_id',
  },
  {
    id: 'TIKTOK',
    label: 'TikTok Studio',
    badge: 'Photo Carousel',
    desc: 'Posting carousel foto affiliate & sound viral langsung ke feed TikTok.',
    color: '#00F2FE',
    gradient: 'from-cyan-500 via-sky-600 to-indigo-600',
    icon: Sparkles,
    placeholder: '@affiliate_tiktok',
    example: '@rekomendasi.outfit',
  },
  {
    id: 'THREADS',
    label: 'Threads Meta',
    badge: 'Microblog Utas',
    desc: 'Posting teks insight, cerita produk, dan gambar carousel ke Threads.',
    color: '#000000',
    gradient: 'from-slate-900 via-zinc-800 to-black dark:from-slate-100 dark:via-zinc-200 dark:to-white',
    icon: AtSign,
    placeholder: '@brand_threads',
    example: '@infobisnis.daily',
  },
];

export function ConnectAccountModal({
  isOpen,
  onClose,
  onAccountConnected,
  defaultPlatform = 'INSTAGRAM',
}: ConnectAccountModalProps) {
  const [selectedPlatform, setSelectedPlatform] = React.useState<SocialPlatform>(defaultPlatform);
  const [handle, setHandle] = React.useState('');
  const [accountName, setAccountName] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (defaultPlatform) {
      setSelectedPlatform(defaultPlatform);
    }
  }, [defaultPlatform, isOpen]);

  if (!isOpen) return null;

  const currentPlatformInfo = PLATFORMS.find((p) => p.id === selectedPlatform) || PLATFORMS[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    let cleanHandle = handle.trim();
    if (!cleanHandle) {
      setErrorMsg('Username/Handle akun media sosial wajib diisi.');
      return;
    }

    if (!cleanHandle.startsWith('@')) {
      cleanHandle = `@${cleanHandle}`;
    }

    const finalAccountName = accountName.trim() || cleanHandle.replace('@', '');

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/social-accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: selectedPlatform,
          accountName: finalAccountName,
          accountHandle: cleanHandle,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal menghubungkan akun media sosial.');
      }

      notify.celebrate(
        'Akun Berhasil Dihubungkan! 🎉',
        `${cleanHandle} (${currentPlatformInfo.label}) aktif dan siap digunakan untuk Auto-Post & Jadwal Carousel.`
      );

      if (onAccountConnected) {
        onAccountConnected(data.account);
      }

      setHandle('');
      setAccountName('');
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Terjadi kesalahan sistem.');
      notify.error('Gagal Menghubungkan', err?.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Coral-Orange accent */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-11 rounded-2xl bg-gradient-to-tr from-[#ff4526] to-amber-500 text-white flex items-center justify-center shadow-lg shadow-[#ff4526]/20">
                <Zap className="size-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                  Hubungkan Akun Medsos
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  InstaDeck PRO • Multi-Channel Auto-Post Engine
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="size-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 1. Platform Selector */}
          <div>
            <Label className="text-xs font-black text-slate-800 dark:text-slate-200 mb-2 block">
              1. Pilih Platform Media Sosial
            </Label>
            <div className="grid grid-cols-3 gap-2.5">
              {PLATFORMS.map((plat) => {
                const isSelected = selectedPlatform === plat.id;
                const Icon = plat.icon;
                return (
                  <button
                    key={plat.id}
                    type="button"
                    onClick={() => setSelectedPlatform(plat.id)}
                    className={cn(
                      'p-3 rounded-2xl border text-left flex flex-col justify-between transition-all relative overflow-hidden',
                      isSelected
                        ? 'border-[#ff4526] bg-orange-50/50 dark:bg-orange-950/20 ring-2 ring-[#ff4526]/30 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 hover:bg-slate-100 dark:hover:bg-slate-900'
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div
                        className={cn(
                          'size-8 rounded-xl flex items-center justify-center shadow-sm',
                          plat.id === 'INSTAGRAM' && 'bg-gradient-to-tr from-pink-500 via-purple-600 to-orange-500 text-white',
                          plat.id === 'TIKTOK' && 'bg-black text-cyan-300 border border-slate-700',
                          plat.id === 'THREADS' && 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                        )}
                      >
                        <Icon className="size-4" />
                      </div>
                      {isSelected && (
                        <div className="size-4 rounded-full bg-[#ff4526] text-white flex items-center justify-center">
                          <CheckCircle2 className="size-3" />
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-black text-slate-900 dark:text-white">
                        {plat.label}
                      </div>
                      <div className="text-[10px] text-slate-500 font-semibold truncate">
                        {plat.badge}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Account Details Form */}
          <div className="space-y-3.5 bg-slate-50 dark:bg-slate-950/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div>
              <Label htmlFor="accountHandle" className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Username / Handle Akun <span className="text-red-500">*</span>
              </Label>
              <div className="relative mt-1">
                <Input
                  id="accountHandle"
                  required
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  placeholder={currentPlatformInfo.placeholder}
                  className="h-10 text-xs rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 font-mono font-bold text-slate-900 dark:text-white"
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                Contoh: <span className="font-mono font-semibold">{currentPlatformInfo.example}</span>
              </p>
            </div>

            <div>
              <Label htmlFor="accountName" className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Nama Brand / Toko (Opsional)
              </Label>
              <div className="relative mt-1">
                <Input
                  id="accountName"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder="Contoh: Toko Hijab Cantik Official"
                  className="h-10 text-xs rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                Label nama untuk memudahkan Anda memilih akun saat membuat jadwal postingan.
              </p>
            </div>
          </div>

          {/* Security & Multi-Tenant Info */}
          <div className="p-3.5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 text-emerald-900 dark:text-emerald-300 text-[11px] space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <ShieldCheck className="size-4 text-emerald-600 shrink-0" />
              <span>Privasi Multi-Tenant Terisolasi Aman</span>
            </div>
            <p className="text-[10px] text-emerald-700 dark:text-emerald-400 pl-5 leading-relaxed">
              Akun ini hanya dapat dilihat dan digunakan oleh Anda. Postingan carousel akan diproses melalui Repliz Gold Publisher berkecepatan tinggi.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="h-10 px-4 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-800"
            >
              Batal
            </Button>
            <Button
              type="submit"
              loading={isSubmitting}
              className="h-10 px-6 text-xs font-bold rounded-xl bg-[#ff4526] hover:bg-[#e03d22] text-white shadow-lg shadow-[#ff4526]/25"
            >
              <Plus className="size-4 mr-1.5" />
              Hubungkan Sekarang
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
