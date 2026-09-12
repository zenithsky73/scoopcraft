'use client';

import * as React from 'react';
import {
  X,
  CheckCircle2,
  Zap,
  ShieldCheck,
  ArrowRight,
  Lock,
  Radio,
  Check,
} from 'lucide-react';
import { SocialIcon } from '@/components/social/social-icon';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/input';
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
  buttonClass: string;
  oauthParam: string;
  features: string[];
}[] = [
  {
    id: 'INSTAGRAM',
    label: 'Instagram Pro',
    badge: 'Feed & Carousel',
    desc: 'Posting carousel slide promosi & katalog produk otomatis ke Instagram.',
    color: '#E1306C',
    gradient: 'from-pink-500 via-purple-600 to-orange-500',
    buttonClass: 'bg-gradient-to-r from-pink-600 via-purple-600 to-orange-500 hover:opacity-95 shadow-pink-500/25',
    oauthParam: 'instagram',
    features: [
      'Multi-slide Carousel & Feed High Quality',
      'Publishing langsung tanpa notifikasi manual',
      'Jadwal Auto-Post 24/7 otomatis',
    ],
  },
  {
    id: 'TIKTOK',
    label: 'TikTok Studio',
    badge: 'Photo Carousel',
    desc: 'Posting carousel foto affiliate & sound viral langsung ke feed TikTok.',
    color: '#00F2FE',
    gradient: 'from-cyan-500 via-sky-600 to-indigo-600',
    buttonClass: 'bg-black hover:bg-neutral-900 text-cyan-300 border border-cyan-500/30 shadow-cyan-500/20',
    oauthParam: 'tiktok',
    features: [
      'TikTok Photo Mode Carousel Otomatis',
      'Dukungan Caption Affiliate & Hashtag',
      'Auto-Publish ke feed TikTok Creator',
    ],
  },
  {
    id: 'THREADS',
    label: 'Threads Meta',
    badge: 'Microblog Utas',
    desc: 'Posting teks insight, cerita produk, dan gambar carousel ke Threads.',
    color: '#000000',
    gradient: 'from-slate-900 via-zinc-800 to-black dark:from-slate-100 dark:via-zinc-200 dark:to-white',
    buttonClass: 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-95 shadow-slate-900/20 dark:shadow-white/20',
    oauthParam: 'threads',
    features: [
      'Post Utas Microblog & Gambar Berseri',
      'Jadwal Otomatis Multi-Thread',
      'Meta Graph API Resmi Terintegrasi',
    ],
  },
];

export function ConnectAccountModal({
  isOpen,
  onClose,
  defaultPlatform = 'INSTAGRAM',
}: ConnectAccountModalProps) {
  const [selectedPlatform, setSelectedPlatform] = React.useState<SocialPlatform>(defaultPlatform);
  const [isRedirecting, setIsRedirecting] = React.useState(false);

  React.useEffect(() => {
    if (defaultPlatform) {
      setSelectedPlatform(defaultPlatform);
    }
  }, [defaultPlatform, isOpen]);

  if (!isOpen) return null;

  const currentPlatformInfo = PLATFORMS.find((p) => p.id === selectedPlatform) || PLATFORMS[0];

  // Handle Direct Official Login
  const handleDirectLogin = () => {
    setIsRedirecting(true);
    const oauthUrl = `/api/social-accounts/repliz/authorize?platform=${currentPlatformInfo.oauthParam}`;
    window.location.href = oauthUrl;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-scale-up my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-11 rounded-2xl bg-gradient-to-tr from-[#ff4526] to-amber-500 text-white flex items-center justify-center shadow-lg shadow-[#ff4526]/20">
                <Zap className="size-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                  Hubungkan Akun Sosial Media
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  InstaDeck PRO • Login Resmi 1-Klik Multi-Tenant
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
        <div className="p-6 space-y-5">
          {/* 1. Pilih Platform */}
          <div>
            <Label className="text-xs font-black text-slate-800 dark:text-slate-200 mb-2.5 block">
              Pilih Platform yang Ingin Dihubungkan:
            </Label>
            <div className="grid grid-cols-3 gap-2.5">
              {PLATFORMS.map((plat) => {
                const isSelected = selectedPlatform === plat.id;
                return (
                  <button
                    key={plat.id}
                    type="button"
                    onClick={() => setSelectedPlatform(plat.id)}
                    className={cn(
                      'p-3 rounded-2xl border text-left flex flex-col justify-between transition-all relative overflow-hidden',
                      isSelected
                        ? 'border-[#ff4526] bg-orange-50/60 dark:bg-orange-950/30 ring-2 ring-[#ff4526]/30 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 hover:bg-slate-100 dark:hover:bg-slate-900'
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <SocialIcon platform={plat.id} size={32} variant="rounded" />
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

          {/* 2. Official Connection Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-orange-50/60 via-white to-pink-50/40 dark:from-indigo-950/30 dark:via-slate-900 dark:to-slate-950 border border-orange-200/80 dark:border-indigo-900/50 space-y-4 shadow-sm">
            <div className="flex items-start gap-3.5">
              <SocialIcon platform={currentPlatformInfo.id} size={42} variant="rounded" />
              <div className="space-y-1 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-mono">
                    1-KLIK LOGIN RESMI
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                    <Radio className="size-3 text-emerald-500 animate-pulse" />
                    OAuth 2.0 Live
                  </span>
                </div>
                <h4 className="text-sm font-black text-slate-900 dark:text-white">
                  Otorisasikan Akun {currentPlatformInfo.label}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {currentPlatformInfo.desc}
                </p>
              </div>
            </div>

            {/* Fitur yang diaktifkan */}
            <div className="space-y-1.5 pt-1 border-t border-slate-100 dark:border-slate-800/80">
              {currentPlatformInfo.features.map((feat, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 font-medium">
                  <div className="size-4 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <Check className="size-2.5" />
                  </div>
                  <span>{feat}</span>
                </div>
              ))}
            </div>

            {/* Tombol Login Resmi */}
            <Button
              type="button"
              onClick={handleDirectLogin}
              loading={isRedirecting}
              className={cn(
                'w-full h-12 text-xs font-black text-white rounded-2xl shadow-lg transition-all',
                currentPlatformInfo.buttonClass
              )}
            >
              <Lock className="size-4 mr-2" />
              <span>Login &amp; Otorisasikan {currentPlatformInfo.label} Resmi</span>
              <ArrowRight className="size-4 ml-2" />
            </Button>

            <p className="text-[11px] text-center text-slate-500 dark:text-slate-400">
              Setelah tombol diklik, Anda akan diarahkan ke halaman login &amp; otorisasi resmi {currentPlatformInfo.label}. Cukup klik <strong>Izinkan / Setuju</strong>.
            </p>
          </div>

          {/* Footer Security Note */}
          <div className="p-3.5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 text-emerald-900 dark:text-emerald-300 text-[11px] flex items-center gap-2.5">
            <ShieldCheck className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="leading-snug">
              <strong>Privasi Multi-Tenant Terisolasi:</strong> Password Anda tidak pernah tersimpan di sistem InstaDeck. Otorisasi resmi diatur langsung via portal keamanan resmi {currentPlatformInfo.label}.
            </span>
          </div>

          {/* Modal Actions */}
          <div className="flex justify-end pt-1">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="h-10 px-5 text-xs font-bold rounded-xl border-slate-200 dark:border-slate-800"
            >
              Tutup
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
