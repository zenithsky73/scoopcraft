'use client';

import * as React from 'react';
import {
  Instagram,
  Linkedin,
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
  Code,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { notify } from '@/lib/notify';
import { cn } from '@/lib/utils';

interface ConnectRealSocialModalProps {
  open: boolean;
  onClose: () => void;
  onAccountConnected: () => void;
  defaultPlatform?: 'INSTAGRAM' | 'LINKEDIN';
}

export function ConnectRealSocialModal({
  open,
  onClose,
  onAccountConnected,
  defaultPlatform = 'INSTAGRAM',
}: ConnectRealSocialModalProps) {
  const [platform, setPlatform] = React.useState<'INSTAGRAM' | 'LINKEDIN'>(defaultPlatform);
  const [connectionMode, setConnectionMode] = React.useState<'ONE_CLICK' | 'MANUAL'>('ONE_CLICK');
  const [accountHandle, setAccountHandle] = React.useState('');
  const [externalId, setExternalId] = React.useState('');
  const [accessToken, setAccessToken] = React.useState('');
  const [isVerifying, setIsVerifying] = React.useState(false);
  const [isRedirecting, setIsRedirecting] = React.useState(false);
  const [showGuide, setShowGuide] = React.useState(false);

  React.useEffect(() => {
    setPlatform(defaultPlatform);
    setConnectionMode('ONE_CLICK');
  }, [defaultPlatform, open]);

  if (!open) return null;

  // 1-Click Meta OAuth Redirect
  const handleOneClickMetaConnect = () => {
    setIsRedirecting(true);
    notify.info('Membuka Otorisasi Meta...', 'Anda akan dialihkan ke halaman persetujuan resmi Meta Facebook.');
    window.location.href = '/api/social-accounts/oauth/meta';
  };

  // Verifikasi manual token
  const handleVerifyAndSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!accessToken.trim()) {
      notify.warning('Token Diperlukan', 'Masukkan Access Token Meta / LinkedIn Anda.');
      return;
    }

    setIsVerifying(true);

    try {
      let verifiedName = accountHandle || 'Akun Profesional';
      let verifiedUsername = accountHandle || 'social_user';

      if (platform === 'INSTAGRAM') {
        const targetId = externalId.trim() || 'me';
        const metaRes = await fetch(
          `https://graph.facebook.com/v19.0/${targetId}?fields=id,name,username,profile_picture_url&access_token=${accessToken.trim()}`
        );

        if (metaRes.ok) {
          const metaData = await metaRes.json();
          verifiedName = metaData.name || metaData.username || verifiedName;
          verifiedUsername = metaData.username || verifiedUsername;
        }
      }

      const res = await fetch('/api/social-accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform,
          accountName: verifiedName,
          accountHandle: verifiedUsername.startsWith('@') ? verifiedUsername : `@${verifiedUsername}`,
          externalId: externalId.trim() || undefined,
          accessToken: accessToken.trim(),
          isDemo: false,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'Gagal menyimpan akun.');
      }

      notify.celebrate(
        'Akun Asli Berhasil Terhubung! 🎉',
        `Akun ${platform} (${verifiedUsername}) siap mempublikasikan postingan live.`
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
                Hubungkan Akun Media Sosial
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Integrasi Resmi Meta Graph API (Instagram &amp; Facebook)
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
          {/* 1. Pilih Platform */}
          <div>
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5 block">
              Pilih Platform
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setPlatform('INSTAGRAM');
                  setConnectionMode('ONE_CLICK');
                }}
                className={cn(
                  'flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl border text-xs font-bold transition-all',
                  platform === 'INSTAGRAM'
                    ? 'border-pink-500 bg-pink-50 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300 ring-2 ring-pink-500/20'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                )}
              >
                <Instagram className="size-4 text-pink-500" />
                <span>Instagram &amp; Facebook</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPlatform('LINKEDIN');
                  setConnectionMode('MANUAL');
                }}
                className={cn(
                  'flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl border text-xs font-bold transition-all',
                  platform === 'LINKEDIN'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500/20'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                )}
              >
                <Linkedin className="size-4 text-blue-500" />
                <span>LinkedIn Feed</span>
              </button>
            </div>
          </div>

          {/* 2. MODE 1-KLIK (UNTUK META / INSTAGRAM) */}
          {platform === 'INSTAGRAM' && connectionMode === 'ONE_CLICK' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50/70 via-purple-50/40 to-pink-50/60 dark:from-indigo-950/40 dark:via-purple-950/20 dark:to-pink-950/30 border border-indigo-200/80 dark:border-indigo-800/60 text-center space-y-3">
                <div className="size-12 rounded-2xl bg-gradient-to-tr from-pink-500 via-purple-600 to-indigo-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-purple-500/25">
                  <Sparkles className="size-6" />
                </div>

                <div className="space-y-1 max-w-sm mx-auto">
                  <h4 className="text-sm font-black text-slate-900 dark:text-white">
                    Hubungkan 1-Klik via Akun Meta
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Masuk dengan akun Facebook Anda untuk mengotorisasi Newsly AI. Akun Instagram Bisnis &amp; Halaman Facebook Anda akan terhubung secara otomatis tanpa perlu menyalin token.
                  </p>
                </div>

                <Button
                  type="button"
                  size="lg"
                  disabled={isRedirecting}
                  onClick={handleOneClickMetaConnect}
                  className="w-full h-11 text-xs font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:opacity-95 text-white shadow-md shadow-pink-600/20"
                >
                  <ShieldCheck className="size-4 mr-2" />
                  <span>{isRedirecting ? 'Mengalihkan ke Meta...' : '⚡ Lanjutkan dengan Facebook & Instagram'}</span>
                  <ArrowRight className="size-4 ml-1.5" />
                </Button>
              </div>

              {/* Persyaratan Akun */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 p-3.5 space-y-2 text-xs">
                <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
                  <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                  <span>Syarat Akun Terhubung:</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-600 dark:text-slate-400 pl-1 leading-relaxed">
                  <li>
                    Akun Instagram bertipe <strong>Bisnis atau Kreator</strong> (bukan akun pribadi).
                  </li>
                  <li>
                    Instagram sudah <strong>ditautkan ke Halaman Facebook (Facebook Page)</strong> Anda.
                  </li>
                </ul>
              </div>

              {/* Opsi Pengembang */}
              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => setConnectionMode('MANUAL')}
                  className="text-[11px] text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium inline-flex items-center gap-1 transition-colors"
                >
                  <Code className="size-3" />
                  <span>Ingin memasukkan Access Token secara manual? (Mode Pengembang)</span>
                </button>
              </div>
            </div>
          )}

          {/* 3. MODE MANUAL (INPUT TOKEN) */}
          {(connectionMode === 'MANUAL' || platform === 'LINKEDIN') && (
            <form onSubmit={handleVerifyAndSave} className="space-y-3.5 animate-in fade-in duration-150">
              {platform === 'INSTAGRAM' && (
                <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                    <Code className="size-3" /> Mode Pengembang / Manual Token
                  </span>
                  <button
                    type="button"
                    onClick={() => setConnectionMode('ONE_CLICK')}
                    className="text-[11px] text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-bold"
                  >
                    ← Kembali ke 1-Klik
                  </button>
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-1 block">
                  Username / Handle Akun
                </label>
                <input
                  type="text"
                  value={accountHandle}
                  onChange={(e) => setAccountHandle(e.target.value)}
                  placeholder="Contoh: @kuliner_nusantara atau nama profil"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 px-3 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                />
              </div>

              {platform === 'INSTAGRAM' && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Instagram Business Account ID
                    </label>
                    <span className="text-[10px] text-slate-400">Didapat dari Meta Developer</span>
                  </div>
                  <input
                    type="text"
                    value={externalId}
                    onChange={(e) => setExternalId(e.target.value)}
                    placeholder="Contoh: 17841405391234567"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 px-3 py-2 text-xs font-mono text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  />
                </div>
              )}

              {platform === 'LINKEDIN' && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      LinkedIn Author URN
                    </label>
                    <span className="text-[10px] text-slate-400">Contoh: urn:li:person:XXXXX</span>
                  </div>
                  <input
                    type="text"
                    value={externalId}
                    onChange={(e) => setExternalId(e.target.value)}
                    placeholder="urn:li:person:XXXXX atau urn:li:organization:XXXXX"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 px-3 py-2 text-xs font-mono text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  />
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-1 flex items-center gap-1.5">
                  <Key className="size-3.5 text-indigo-500" />
                  <span>Access Token</span>
                </label>
                <textarea
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                  rows={3}
                  placeholder="Tempelkan Access Token di sini..."
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-2.5 text-xs font-mono text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 resize-none"
                />
              </div>

              {/* Accordion Panduan Bantuan */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 p-3">
                <button
                  type="button"
                  onClick={() => setShowGuide(!showGuide)}
                  className="flex items-center justify-between w-full text-xs font-bold text-slate-700 dark:text-slate-300"
                >
                  <span className="flex items-center gap-1.5">
                    <HelpCircle className="size-3.5 text-indigo-500" />
                    Panduan Token
                  </span>
                  <span className="text-[10px] text-indigo-600 dark:text-indigo-400">
                    {showGuide ? 'Sembunyikan' : 'Buka Panduan'}
                  </span>
                </button>

                {showGuide && (
                  <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2 text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed animate-in fade-in">
                    <p>
                      1. Buka <strong>Meta Graph API Explorer</strong> di{' '}
                      <a
                        href="https://developers.facebook.com/tools/explorer/"
                        target="_blank"
                        rel="noreferrer"
                        className="text-indigo-600 dark:text-indigo-400 underline inline-flex items-center gap-0.5"
                      >
                        developers.facebook.com/tools/explorer
                        <ExternalLink className="size-2.5" />
                      </a>
                    </p>
                    <p>
                      2. Pilih Halaman Facebook Anda, centang izin: <code className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded text-[10px] font-mono">instagram_basic</code>, <code className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded text-[10px] font-mono">instagram_content_publish</code>, dan <code className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded text-[10px] font-mono">pages_show_list</code>.
                    </p>
                    <p>
                      3. Klik <strong>Generate Access Token</strong>, lalu salin token dan ID ke formulir di atas.
                    </p>
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-xs text-slate-500"
                >
                  Batal
                </Button>

                <Button
                  type="submit"
                  size="sm"
                  disabled={isVerifying || !accessToken.trim()}
                  className="text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20"
                >
                  <ShieldCheck className="size-3.5 mr-1.5" />
                  <span>{isVerifying ? 'Memverifikasi...' : 'Simpan & Hubungkan Akun'}</span>
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
