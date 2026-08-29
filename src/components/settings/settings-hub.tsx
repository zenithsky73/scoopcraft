'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Palette,
  User,
  Zap,
  Sparkles,
  Crown,
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  Check,
  Upload,
  Sliders,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  Trash2,
  Info,
} from 'lucide-react';
import { Input, Label } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn, formatDate } from '@/lib/utils';
import { ThemeToggle } from '@/components/layout/theme-toggle';

interface SettingsHubProps {
  user: {
    id: string;
    name: string | null;
    email: string;
    role: 'USER' | 'OWNER';
    plan: 'TRIAL' | 'BASIC' | 'PRO' | 'BUSINESS';
    subscriptionStatus: string;
    trialEndsAt: Date | null;
    generateCount: number;
    createdAt: Date;
    brandKit: {
      handle: string | null;
      displayName: string | null;
      logoUrl: string | null;
      hideNewslyWatermark: boolean;
      tagline: string | null;
    } | null;
  };
  quotaRemaining: number;
  quotaTotal: number;
}

export function SettingsHub({ user, quotaRemaining, quotaTotal }: SettingsHubProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState<'BRAND' | 'ACCOUNT' | 'BILLING' | 'PREFS'>('BRAND');

  // Brand Kit State
  const [handle, setHandle] = React.useState(user.brandKit?.handle ?? '@');
  const [displayName, setDisplayName] = React.useState(user.brandKit?.displayName ?? '');
  const [tagline, setTagline] = React.useState(user.brandKit?.tagline ?? '');
  const [logoUrl, setLogoUrl] = React.useState<string | null>(user.brandKit?.logoUrl ?? null);
  const [hideNewslyWatermark, setHideNewslyWatermark] = React.useState<boolean>(
    user.brandKit?.hideNewslyWatermark ?? false
  );
  const [brandLoading, setBrandLoading] = React.useState(false);
  const [brandToast, setBrandToast] = React.useState<string | null>(null);

  // Security / Password State
  const [currentPassword, setCurrentPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [showPass, setShowPass] = React.useState(false);
  const [passLoading, setPassLoading] = React.useState(false);
  const [passError, setPassError] = React.useState<string | null>(null);
  const [passSuccess, setPassSuccess] = React.useState<string | null>(null);

  const isOwner = user.role === 'OWNER';
  const isPro = isOwner || user.plan === 'PRO' || user.plan === 'BUSINESS';

  // Handle Logo Upload (Base64 data URL)
  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Ukuran file logo maksimal 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setLogoUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Save Brand Settings
  const handleSaveBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    setBrandLoading(true);
    setBrandToast(null);

    try {
      const res = await fetch('/api/brand', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          handle: handle.trim(),
          displayName: displayName.trim() || null,
          tagline: tagline.trim() || null,
          logoUrl,
          hideNewslyWatermark,
        }),
      });

      const data = await res.json();
      setBrandLoading(false);

      if (!res.ok) {
        alert(data.error || 'Gagal menyimpan pengaturan brand.');
        return;
      }

      setBrandToast('✓ Identitas Brand & Watermark berhasil disimpan!');
      setTimeout(() => setBrandToast(null), 4000);
      router.refresh();
    } catch (err: any) {
      setBrandLoading(false);
      alert(err.message || 'Terjadi kesalahan sistem.');
    }
  };

  // Change Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError(null);
    setPassSuccess(null);

    if (newPassword.length < 8) {
      setPassError('Kata sandi baru minimal 8 karakter.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPassError('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    setPassLoading(true);

    try {
      const res = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json();
      setPassLoading(false);

      if (!res.ok) {
        setPassError(data.error || 'Gagal memperbarui kata sandi.');
        return;
      }

      setPassSuccess('✓ Kata sandi berhasil diperbarui dengan aman!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPassSuccess(null), 4000);
    } catch (err: any) {
      setPassLoading(false);
      setPassError(err.message || 'Terjadi kesalahan sistem.');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Sliders className="size-7 text-primary" /> Pengaturan &amp; Brand Kit
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Kelola watermark slide, logo brand, profil akun, dan preferensi konten Anda.
          </p>
        </div>

        {/* Plan Status Pill */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {isOwner ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30 text-xs font-black uppercase tracking-wider">
              <Crown className="size-3.5 text-amber-600 dark:text-amber-400" /> OWNER ACCESS
            </span>
          ) : isPro ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-900 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-500/30 text-xs font-black uppercase tracking-wider">
              <Sparkles className="size-3.5 text-primary" /> {user.plan} MEMBER
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold">
              FREE TRIAL
            </span>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('BRAND')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0',
            activeTab === 'BRAND'
              ? 'bg-white dark:bg-slate-800 text-primary shadow-sm ring-1 ring-slate-200 dark:ring-slate-700'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          )}
        >
          <Palette className="size-4" />
          <span>Brand Kit &amp; Watermark</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('ACCOUNT')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0',
            activeTab === 'ACCOUNT'
              ? 'bg-white dark:bg-slate-800 text-primary shadow-sm ring-1 ring-slate-200 dark:ring-slate-700'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          )}
        >
          <User className="size-4" />
          <span>Profil &amp; Keamanan</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('BILLING')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0',
            activeTab === 'BILLING'
              ? 'bg-white dark:bg-slate-800 text-primary shadow-sm ring-1 ring-slate-200 dark:ring-slate-700'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          )}
        >
          <Zap className="size-4" />
          <span>Paket &amp; Kuota</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('PREFS')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0',
            activeTab === 'PREFS'
              ? 'bg-white dark:bg-slate-800 text-primary shadow-sm ring-1 ring-slate-200 dark:ring-slate-700'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          )}
        >
          <Sliders className="size-4" />
          <span>Preferensi AI</span>
        </button>
      </div>

      {/* ─── TAB 1: BRAND KIT & WATERMARK ─── */}
      {activeTab === 'BRAND' && (
        <form onSubmit={handleSaveBrand} className="space-y-6 animate-fade-in">
          {brandToast && (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2.5">
              <CheckCircle2 className="size-4.5 text-emerald-600 shrink-0" />
              <span>{brandToast}</span>
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            {/* Form Fields */}
            <div className="space-y-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div>
                <Label htmlFor="handle" className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Watermark Akun / Handle
                </Label>
                <div className="relative mt-1">
                  <Input
                    id="handle"
                    value={handle}
                    onChange={(e) => setHandle(e.target.value)}
                    placeholder="@namabrandkamu"
                    className="h-10 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 font-mono font-bold text-slate-900 dark:text-white"
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  Handle ini otomatis tercetak di pojok setiap slide carousel Anda.
                </p>
              </div>

              <div>
                <Label htmlFor="displayName" className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Nama Brand / Publikasi
                </Label>
                <div className="relative mt-1">
                  <Input
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Newsly Media Daily"
                    className="h-10 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="tagline" className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Tagline / CTA Slogan Slide Penutup
                </Label>
                <div className="relative mt-1">
                  <Input
                    id="tagline"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    placeholder="Follow untuk update berita &amp; insight harian"
                    className="h-10 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Upload Logo Brand */}
              <div>
                <Label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1">
                  Logo Brand (.PNG Transparan)
                </Label>
                <div className="flex items-center gap-3">
                  {logoUrl ? (
                    <div className="relative size-14 rounded-2xl bg-slate-950/80 border border-slate-800 p-2 flex items-center justify-center shrink-0">
                      <img src={logoUrl} alt="Logo Brand" className="max-h-full max-w-full object-contain" />
                      <button
                        type="button"
                        onClick={() => setLogoUrl(null)}
                        className="absolute -top-1.5 -right-1.5 size-5 rounded-full bg-red-600 text-white flex items-center justify-center shadow-md hover:bg-red-500"
                        title="Hapus Logo"
                      >
                        <Trash2 className="size-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="size-14 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-400 shrink-0">
                      <Upload className="size-5" />
                    </div>
                  )}

                  <div className="flex-1">
                    <label className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold cursor-pointer transition-colors">
                      <Upload className="size-3.5" />
                      <span>{logoUrl ? 'Ganti File Logo' : 'Unggah Logo PNG'}</span>
                      <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleLogoFileChange} className="hidden" />
                    </label>
                    <p className="text-[10px] text-slate-500 mt-1">Disarankan format PNG transparan, maks 2MB.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Visual Preview & PRO Feature Toggle */}
            <div className="space-y-4">
              {/* 🌟 EXCLUSIVE PRO FEATURE: HIDE NEWSLY WATERMARK */}
              <div
                className={cn(
                  'p-5 rounded-3xl border transition-all',
                  isPro
                    ? 'bg-gradient-to-br from-indigo-50/80 via-white to-purple-50/50 dark:from-indigo-950/60 dark:via-slate-900 dark:to-purple-950/40 border-primary/40 shadow-md'
                    : 'bg-slate-100/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 opacity-90'
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Sparkles className="size-3.5 text-primary" /> Sembunyikan Watermark Newsly AI
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-800 dark:text-amber-300 border border-amber-400/40 text-[9px] font-black uppercase">
                        PRO EXCLUSIVE
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                      Hilangkan tulisan bawaan <span className="font-mono text-slate-800 dark:text-slate-200 font-bold">&quot;⚡ Dibuat dengan Newsly AI&quot;</span> dari slide Anda. Hasil konten menjadi 100% murni brand milik Anda sendiri!
                    </p>
                  </div>

                  {/* Switch Toggle */}
                  <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                    <input
                      type="checkbox"
                      checked={hideNewslyWatermark}
                      disabled={!isPro}
                      onChange={(e) => isPro && setHideNewslyWatermark(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-300 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                {!isPro && (
                  <div className="mt-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-800 dark:text-amber-300 text-[11px] font-semibold flex items-center justify-between gap-2">
                    <span>Fitur ini terkunci. Berlangganan PRO untuk menghapus watermark.</span>
                    <Button asChild size="sm" className="h-7 text-[10px] font-bold rounded-lg bg-primary text-white shrink-0">
                      <Link href="/upgrade">Upgrade ➔</Link>
                    </Button>
                  </div>
                )}
              </div>

              {/* Live Preview Card */}
              <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800 text-white space-y-3 relative overflow-hidden shadow-xl">
                <div className="flex items-center justify-between text-[10px] text-slate-400 border-b border-slate-800 pb-2">
                  <span className="font-mono font-bold uppercase tracking-wider text-indigo-400">Pratinjau Footer Slide</span>
                  <span>Ukuran Skala 1:1</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                  <div className="h-14 flex items-center justify-center text-xs text-slate-500 italic border border-dashed border-slate-800 rounded-xl">
                    (Area Konten Utama Slide Carousel)
                  </div>

                  {/* Footer Bar Preview */}
                  <div className="flex items-center justify-between border-t border-slate-800 pt-2 text-xs">
                    <div className="flex items-center gap-2">
                      {logoUrl && <img src={logoUrl} alt="Logo" className="size-5 object-contain" />}
                      <span className="font-mono font-bold text-slate-200">{handle || '@namabrandkamu'}</span>
                    </div>

                    {!hideNewslyWatermark && (
                      <span className="text-[10px] font-semibold text-slate-500 font-mono">
                        ⚡ Made with Newsly AI
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              loading={brandLoading}
              className="h-11 px-8 rounded-xl bg-primary text-white font-bold text-xs shadow-lg shadow-primary/25"
            >
              <Check className="size-4 mr-1.5" /> Simpan Pengaturan Brand Kit
            </Button>
          </div>
        </form>
      )}

      {/* ─── TAB 2: PROFIL & KEAMANAN ─── */}
      {activeTab === 'ACCOUNT' && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid gap-6 md:grid-cols-2">
            {/* User Details */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <User className="size-4 text-primary" /> Informasi Akun Anda
              </h3>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-slate-500">Nama Tampilan</span>
                  <span className="font-bold text-slate-900 dark:text-white">{user.name || 'Pengguna Newsly'}</span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-slate-500">Alamat Email</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{user.email}</span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-slate-500">Status Akun</span>
                  <span className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
                    <ShieldCheck className="size-3.5" /> Terverifikasi
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-slate-500">Bergabung Sejak</span>
                  <span className="text-slate-700 dark:text-slate-300 font-mono">{formatDate(user.createdAt)}</span>
                </div>
              </div>
            </div>

            {/* Change Password Form */}
            <form onSubmit={handleChangePassword} className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Lock className="size-4 text-primary" /> Ubah Kata Sandi
              </h3>

              {passSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                  <span>{passSuccess}</span>
                </div>
              )}

              {passError && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="size-4 text-red-600 shrink-0" />
                  <span>{passError}</span>
                </div>
              )}

              <div>
                <Label htmlFor="currentPass" className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Kata Sandi Lama <span className="text-slate-400 font-normal">(kosongkan jika login via Google)</span>
                </Label>
                <div className="relative mt-1">
                  <Input
                    id="currentPass"
                    type={showPass ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Masukkan kata sandi saat ini..."
                    className="h-10 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="newPass" className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Kata Sandi Baru
                </Label>
                <div className="relative mt-1">
                  <Input
                    id="newPass"
                    type={showPass ? 'text' : 'password'}
                    required
                    minLength={8}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimal 8 karakter..."
                    className="h-10 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="confirmPass" className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Ulangi Kata Sandi Baru
                </Label>
                <div className="relative mt-1">
                  <Input
                    id="confirmPass"
                    type={showPass ? 'text' : 'password'}
                    required
                    minLength={8}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ketik ulang kata sandi baru..."
                    className="h-10 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1.5"
                >
                  {showPass ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                  <span>{showPass ? 'Sembunyikan' : 'Tampilkan'} Sandi</span>
                </button>

                <Button type="submit" loading={passLoading} className="h-10 px-5 text-xs font-bold rounded-xl bg-primary text-white">
                  Perbarui Kata Sandi
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── TAB 3: PAKET & KUOTA ─── */}
      {activeTab === 'BILLING' && (
        <div className="space-y-6 animate-fade-in">
          <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-900 via-slate-900 to-purple-950 text-white border border-slate-800 shadow-xl space-y-6 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400 font-mono">
                  STATUS LANGGANAN AKTIF
                </span>
                <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                  {isOwner ? (
                    <>
                      <Crown className="size-6 text-amber-400" /> VIP Owner (Akses Tanpa Batas)
                    </>
                  ) : isPro ? (
                    <>
                      <Sparkles className="size-6 text-primary" /> Paket {user.plan} Active
                    </>
                  ) : (
                    <>Free Trial Plan</>
                  )}
                </h2>
                <p className="text-xs text-slate-300">
                  {isOwner
                    ? 'Anda memiliki hak akses VIP Owner tanpa batasan kuota ke seluruh fitur AI dan template.'
                    : 'Gunakan kuota Anda untuk menghasilkan carousel berita & artikel media sosial berkualitas tinggi.'}
                </p>
              </div>

              <Button asChild className="h-11 px-6 rounded-xl bg-gradient-to-r from-primary to-indigo-600 text-white font-bold text-xs shadow-lg shadow-primary/30 shrink-0">
                <Link href="/upgrade" className="flex items-center gap-1.5">
                  <span>Lihat Katalog Paket</span> <ArrowRight className="size-3.5" />
                </Link>
              </Button>
            </div>

            {/* Quota Progress Meter */}
            {!isOwner && (
              <div className="space-y-2 p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-300">Sisa Kuota Pembuatan Carousel</span>
                  <span className="text-primary font-mono">{quotaRemaining} / {quotaTotal} Kuota Tersedia</span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-indigo-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(5, (quotaRemaining / quotaTotal) * 100))}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Quick Metrics */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Konten Dibuat</span>
              <p className="text-2xl font-black text-slate-900 dark:text-white font-mono">{user.generateCount} Carousel</p>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Masa Aktif Paket</span>
              <p className="text-base font-black text-slate-900 dark:text-white font-mono">
                {user.trialEndsAt ? formatDate(user.trialEndsAt) : 'Tanpa Batas Waktu'}
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status Watermark</span>
              <p className="text-base font-black text-emerald-600 dark:text-emerald-400">
                {hideNewslyWatermark ? '✓ 100% Clean Brand' : 'Standar Newsly AI'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 4: PREFERENSI AI ─── */}
      {activeTab === 'PREFS' && (
        <div className="space-y-6 animate-fade-in">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Sliders className="size-4 text-primary" /> Preferensi Tampilan &amp; Generator AI
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Tema Aplikasi</h4>
                  <p className="text-[11px] text-slate-500">Pilih mode tampilan gelap atau terang.</p>
                </div>
                <ThemeToggle />
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Engine AI</h4>
                  <p className="text-[11px] text-slate-500">Google Gemini 2.5 Turbo (Aktif &amp; Berkecepatan Tinggi).</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                  ⚡ Online
                </span>
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Versi Platform</h4>
                  <p className="text-[11px] text-slate-500">Newsly AI Content Studio — Build 2026.08.29</p>
                </div>
                <span className="font-mono text-xs font-bold text-slate-400">v2.5 Pro</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
