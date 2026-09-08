'use client';

import * as React from 'react';
import {
  Instagram,
  Facebook,
  AtSign,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  HelpCircle,
  X,
  Key,
  Globe,
  Sparkles,
  Lock,
  ArrowRight,
  User,
  Mail,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { notify } from '@/lib/notify';
import { cn } from '@/lib/utils';

export type SupportedPlatform = 'INSTAGRAM' | 'FACEBOOK' | 'THREADS';

interface ConnectRealSocialModalProps {
  open: boolean;
  onClose: () => void;
  onAccountConnected: () => void;
  defaultPlatform?: SupportedPlatform;
}

export function ConnectRealSocialModal({
  open,
  onClose,
  onAccountConnected,
  defaultPlatform = 'INSTAGRAM',
}: ConnectRealSocialModalProps) {
  const [platform, setPlatform] = React.useState<SupportedPlatform>(defaultPlatform);
  const [accountHandle, setAccountHandle] = React.useState('');
  const [accountEmailOrId, setAccountEmailOrId] = React.useState('');
  const [passwordOrToken, setPasswordOrToken] = React.useState('');
  const [isVerifying, setIsVerifying] = React.useState(false);
  const [isRedirecting, setIsRedirecting] = React.useState(false);
  const [showGuide, setShowGuide] = React.useState(false);

  React.useEffect(() => {
    setPlatform(defaultPlatform);
  }, [defaultPlatform, open]);

  if (!open) return null;

  // 1-Click Portal OAuth Redirect for targeted platform
  const handleOneClickMetaConnect = () => {
    setIsRedirecting(true);
    notify.info(
      `Membuka Otorisasi ${platform}...`,
      'Anda akan dialihkan ke dialog persetujuan resmi.'
    );
    if (platform === 'THREADS') {
      window.location.href = '/api/social-accounts/oauth/threads';
    } else if (platform === 'INSTAGRAM') {
      window.location.href = '/api/social-accounts/oauth/instagram';
    } else {
      window.location.href = '/api/social-accounts/oauth/meta?platform=facebook';
    }
  };

  // Simpan manual akun
  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!accountHandle.trim()) {
      notify.warning('Username Diperlukan', 'Masukkan username atau nama akun Anda.');
      return;
    }

    setIsVerifying(true);

    try {
      const handleClean = accountHandle.trim().startsWith('@')
        ? accountHandle.trim()
        : `@${accountHandle.trim()}`;
      
      const accountNameClean = accountHandle.trim().replace(/^@/, '');

      const res = await fetch('/api/social-accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform,
          accountName: accountNameClean,
          accountHandle: handleClean,
          externalId: accountEmailOrId.trim() || undefined,
          accessToken: passwordOrToken.trim() || 'active_token',
          isDemo: false,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'Gagal menyimpan akun.');
      }

      notify.celebrate(
        'Akun Berhasil Dihubungkan! 🎉',
        `Akun ${platform} (${handleClean}) siap digunakan untuk autoposting.`
      );

      onAccountConnected();
      onClose();
    } catch (err: any) {
      notify.error('Gagal Menghubungkan', err?.message);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl animate-in zoom-in-95 duration-200 text-slate-800 dark:text-slate-200 max-h-[90vh] flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        {/* Header Modal */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-5 py-4 bg-slate-50/70 dark:bg-slate-950/40 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-xl bg-gradient-to-tr from-pink-500 via-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-pink-500/20">
              <ShieldCheck className="size-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                Hubungkan Akun {platform}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Masukkan detail akun Anda untuk mengaktifkan jadwal publikasi
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-white transition-colors"
            aria-label="Tutup"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* 1. Pilih Platform (3 Pilihan Terpisah) */}
          <div>
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5 block">
              Pilih Platform
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPlatform('INSTAGRAM')}
                className={cn(
                  'flex flex-col items-center justify-center gap-1.5 py-2.5 px-2 rounded-2xl border text-xs font-bold transition-all text-center',
                  platform === 'INSTAGRAM'
                    ? 'border-pink-500 bg-pink-50 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300 ring-2 ring-pink-500/20'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                )}
              >
                <Instagram className="size-4 text-pink-500" />
                <span>Instagram</span>
              </button>

              <button
                type="button"
                onClick={() => setPlatform('FACEBOOK')}
                className={cn(
                  'flex flex-col items-center justify-center gap-1.5 py-2.5 px-2 rounded-2xl border text-xs font-bold transition-all text-center',
                  platform === 'FACEBOOK'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500/20'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                )}
              >
                <Facebook className="size-4 text-blue-600" />
                <span>Facebook</span>
              </button>

              <button
                type="button"
                onClick={() => setPlatform('THREADS')}
                className={cn(
                  'flex flex-col items-center justify-center gap-1.5 py-2.5 px-2 rounded-2xl border text-xs font-bold transition-all text-center',
                  platform === 'THREADS'
                    ? 'border-slate-800 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white ring-2 ring-slate-400/30'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                )}
              >
                <AtSign className="size-4 text-slate-900 dark:text-white" />
                <span>Threads</span>
              </button>
            </div>
          </div>

          {/* 2. FORM MANUAL INPUT KREDENSIAL */}
          <form onSubmit={handleSaveAccount} className="space-y-3.5">
            <div>
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-1 flex items-center gap-1.5">
                <User className="size-3.5 text-indigo-500" />
                <span>Username / Nama Akun {platform} *</span>
              </label>
              <input
                type="text"
                required
                value={accountHandle}
                onChange={(e) => setAccountHandle(e.target.value)}
                placeholder={platform === 'FACEBOOK' ? 'Contoh: Halaman Astroboy atau @astroboy' : 'Contoh: @kuliner_nusantara'}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 px-3 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-1 flex items-center gap-1.5">
                <Mail className="size-3.5 text-indigo-500" />
                <span>Email / ID Akun (Opsional)</span>
              </label>
              <input
                type="text"
                value={accountEmailOrId}
                onChange={(e) => setAccountEmailOrId(e.target.value)}
                placeholder={platform === 'FACEBOOK' ? 'ID Halaman (Contoh: 1059971823315435)' : 'Email / Akun ID'}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 px-3 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-1 flex items-center gap-1.5">
                <Lock className="size-3.5 text-indigo-500" />
                <span>Password / Kunci Akses (Token)</span>
              </label>
              <input
                type="password"
                value={passwordOrToken}
                onChange={(e) => setPasswordOrToken(e.target.value)}
                placeholder="Masukkan kata sandi atau Access Token akun..."
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 px-3 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>

            <Button
              type="submit"
              disabled={isVerifying}
              className="w-full h-10 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-md transition-all mt-2"
            >
              {isVerifying ? 'Menyimpan Akun...' : `💾 Simpan & Hubungkan Akun ${platform}`}
            </Button>
          </form>

          {/* 3. OPSI OTORISASI CEPAT ALTERNATIF */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-center space-y-2">
            <p className="text-[11px] text-slate-400">Atau login otomatis dengan browser:</p>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={isRedirecting}
              onClick={handleOneClickMetaConnect}
              className="w-full text-xs font-semibold border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
            >
              <ShieldCheck className="size-3.5 mr-1.5 text-indigo-500" />
              {isRedirecting ? 'Mengalihkan...' : `🔑 Masuk dengan ${platform} Resmi`}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
