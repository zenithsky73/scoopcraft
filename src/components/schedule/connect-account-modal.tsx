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
  ExternalLink,
  RefreshCw,
  ArrowRight,
  Check,
  Globe,
  Radio,
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
    desc: 'Posting carousel foto promosi & katalog produk otomatis ke Instagram.',
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
  const [connectMode, setConnectMode] = React.useState<'OFFICIAL_SYNC' | 'MANUAL_INPUT'>('OFFICIAL_SYNC');
  
  // Sync state
  const [isSyncing, setIsSyncing] = React.useState(false);
  const [syncedAccounts, setSyncedAccounts] = React.useState<any[]>([]);
  const [hasSyncedOnce, setHasSyncedOnce] = React.useState(false);
  const [claimingId, setClaimingId] = React.useState<string | null>(null);

  // Manual input state
  const [handle, setHandle] = React.useState('');
  const [accountName, setAccountName] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (defaultPlatform) {
      setSelectedPlatform(defaultPlatform);
    }
  }, [defaultPlatform, isOpen]);

  // Fetch Repliz accounts when modal opens
  const fetchReplizAccounts = React.useCallback(async () => {
    setIsSyncing(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/social-accounts/sync');
      const data = await res.json();
      if (res.ok && data.accounts) {
        setSyncedAccounts(data.accounts);
        setHasSyncedOnce(true);
      } else {
        setErrorMsg(data?.error || 'Gagal mengambil data akun dari Repliz.');
      }
    } catch (e: any) {
      setErrorMsg(e?.message || 'Gagal terhubung ke server sinkronisasi.');
    } finally {
      setIsSyncing(false);
    }
  }, []);

  React.useEffect(() => {
    if (isOpen) {
      fetchReplizAccounts();
    }
  }, [isOpen, fetchReplizAccounts]);

  if (!isOpen) return null;

  const currentPlatformInfo = PLATFORMS.find((p) => p.id === selectedPlatform) || PLATFORMS[0];

  // Filter accounts for the currently selected platform
  const filteredReplizAccounts = syncedAccounts.filter(
    (a) => a.platform === selectedPlatform
  );

  // Handle Claim Repliz Account
  const handleClaimAccount = async (acc: any) => {
    setClaimingId(acc.id);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/social-accounts/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          replizAccountId: acc.id,
          platform: acc.platform,
          accountName: acc.name,
          accountHandle: acc.username,
          avatarUrl: acc.avatar,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal menautkan akun.');
      }

      notify.celebrate(
        'Akun Berhasil Ditautkan! 🎉',
        `${acc.username} (${currentPlatformInfo.label}) berhasil dihubungkan ke profil InstaDeck Anda dan siap untuk Auto-Post.`
      );

      if (onAccountConnected) {
        onAccountConnected(data.account);
      }

      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Terjadi kesalahan saat menautkan akun.');
      notify.error('Gagal Menautkan', err?.message);
    } finally {
      setClaimingId(null);
    }
  };

  // Handle Manual Submission
  const handleManualSubmit = async (e: React.FormEvent) => {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div
        className="relative w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-scale-up my-8"
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
                  InstaDeck PRO • Multi-Channel Auto-Post via Repliz Gold (200 Akun)
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
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="size-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 1. Pilih Platform */}
          <div>
            <Label className="text-xs font-black text-slate-800 dark:text-slate-200 mb-2 block">
              1. Pilih Platform Media Sosial:
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

          {/* Mode Switcher: Portal Resmi (Solusi A) vs Input Manual */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setConnectMode('OFFICIAL_SYNC')}
              className={cn(
                'flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5',
                connectMode === 'OFFICIAL_SYNC'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              )}
            >
              <Globe className="size-3.5 text-[#ff4526]" />
              <span>Login Portal Resmi Repliz (Rekomendasi)</span>
            </button>

            <button
              type="button"
              onClick={() => setConnectMode('MANUAL_INPUT')}
              className={cn(
                'py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5',
                connectMode === 'MANUAL_INPUT'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              )}
            >
              <span>Input Handle Cepat</span>
            </button>
          </div>

          {/* ─── MODE A: PORTAL RESMI REPLIZ (SOLUSI A) ─── */}
          {connectMode === 'OFFICIAL_SYNC' && (
            <div className="space-y-4">
              {/* Langkah 1 Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50/60 to-purple-50/40 dark:from-indigo-950/30 dark:to-slate-950 border border-indigo-200/80 dark:border-indigo-900/50 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 font-mono">
                      LANGKAH 1 DARI 2
                    </span>
                    <h4 className="text-xs font-black text-slate-900 dark:text-white">
                      Otorisasi di Portal Resmi {currentPlatformInfo.label}
                    </h4>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                      Klik tombol di bawah untuk membuka halaman login resmi. Klik <strong>Connect {selectedPlatform}</strong> dan izinkan Repliz mempublikasikan postingan.
                    </p>
                  </div>
                </div>

                <Button
                  asChild
                  className="w-full h-10 text-xs font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:opacity-95 text-white rounded-xl shadow-md"
                >
                  <a href="https://app.repliz.com/account" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1.5">
                    <span>🔐 Buka Portal Otorisasi Resmi Repliz</span>
                    <ExternalLink className="size-3.5" />
                  </a>
                </Button>
              </div>

              {/* Langkah 2 Card: Sinkronisasi */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-mono">
                      LANGKAH 2 DARI 2
                    </span>
                    <h4 className="text-xs font-black text-slate-900 dark:text-white">
                      Tarik Akun ke Profil InstaDeck
                    </h4>
                  </div>

                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={fetchReplizAccounts}
                    disabled={isSyncing}
                    className="h-8 text-xs font-bold border border-slate-200 dark:border-slate-800 rounded-xl"
                  >
                    <RefreshCw className={cn("size-3.5 mr-1.5", isSyncing && "animate-spin text-[#ff4526]")} />
                    <span>{isSyncing ? 'Mengecek...' : 'Cek Akun Terbaru'}</span>
                  </Button>
                </div>

                {/* List Akun yang Terdeteksi dari Repliz */}
                {isSyncing ? (
                  <div className="p-6 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-2">
                    <RefreshCw className="size-5 text-[#ff4526] animate-spin" />
                    <span>Sedang menghubungkan ke server Repliz Gold...</span>
                  </div>
                ) : filteredReplizAccounts.length > 0 ? (
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                      Akun {currentPlatformInfo.label} yang terdeteksi di Repliz:
                    </span>
                    {filteredReplizAccounts.map((acc) => (
                      <div
                        key={acc.id}
                        className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="size-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-xs">
                            {acc.username.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-slate-900 dark:text-white">
                                {acc.username}
                              </span>
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold">
                                🟢 Siap
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400">{acc.name}</span>
                          </div>
                        </div>

                        {acc.isClaimedByCurrentUser ? (
                          <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                            <Check className="size-3.5" /> Sudah Terhubung
                          </span>
                        ) : acc.isClaimedByOther ? (
                          <span className="text-[11px] font-bold text-slate-400">
                            Digunakan User Lain
                          </span>
                        ) : (
                          <Button
                            type="button"
                            size="sm"
                            disabled={claimingId === acc.id}
                            onClick={() => handleClaimAccount(acc)}
                            className="h-8 text-xs font-bold bg-[#ff4526] hover:bg-[#e03d22] text-white rounded-xl shadow-sm"
                          >
                            {claimingId === acc.id ? 'Menghubungkan...' : 'Tautkan Akun Ini'}
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-1">
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Belum ada akun {currentPlatformInfo.label} yang terhubung di Repliz
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Silakan klik tombol <strong>Langkah 1</strong> di atas, lakukan login di portal Repliz, lalu klik <strong>Cek Akun Terbaru</strong>.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ─── MODE B: MANUAL INPUT CEPAT ─── */}
          {connectMode === 'MANUAL_INPUT' && (
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div className="space-y-3 bg-slate-50 dark:bg-slate-950/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
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
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5">
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
          )}

          {/* Footer Security Note */}
          <div className="p-3 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 text-emerald-900 dark:text-emerald-300 text-[11px] flex items-center gap-2">
            <ShieldCheck className="size-4 text-emerald-600 shrink-0" />
            <span>Privasi Multi-Tenant Terjamin: Akun Anda aman dan tidak dapat dilihat pengguna lain.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
