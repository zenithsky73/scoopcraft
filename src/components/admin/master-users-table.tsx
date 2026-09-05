'use client';

import * as React from 'react';
import {
  Crown,
  Users,
  Search,
  Zap,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Layers,
  TrendingUp,
  ShieldCheck,
  RefreshCw,
  KeyRound,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { notify } from '@/lib/notify';

export type UserItem = {
  id: string;
  name: string | null;
  email: string;
  role: 'USER' | 'OWNER';
  plan: 'TRIAL' | 'BASIC' | 'PRO' | 'BUSINESS';
  subscriptionStatus: 'TRIALING' | 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'EXPIRED';
  generateCount: number;
  createdAt: string;
  trialEndsAt: string | null;
  isGuest: boolean;
};

export function MasterUsersTable() {
  const [users, setUsers] = React.useState<UserItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [filter, setFilter] = React.useState<'ALL' | 'REGISTERED' | 'PRO' | 'GUEST' | 'OWNER'>('REGISTERED');
  const [actionLoadingId, setActionLoadingId] = React.useState<string | null>(null);
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error('Fetch users error:', err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchUsers();
  }, []);

  const handleInject = async (user: UserItem, targetPlan: 'STARTER' | 'PRO' | 'AGENCY') => {
    setActionLoadingId(`${user.id}-${targetPlan}`);
    setToastMessage(null);

    const quotaAmount = targetPlan === 'STARTER' ? 50 : targetPlan === 'PRO' ? 200 : 1000;

    try {
      const res = await fetch('/api/admin/inject-quota', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetEmail: user.email,
          plan: targetPlan,
          quotaAmount,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Gagal mengubah paket pengguna.');
      }

      // Optimistic state update
      const planEnum = targetPlan === 'AGENCY' ? 'BUSINESS' : targetPlan === 'STARTER' ? 'BASIC' : 'PRO';
      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id ? { ...u, plan: planEnum, subscriptionStatus: 'ACTIVE' } : u
        )
      );

      notify.success('Paket Berhasil Diaktifkan', `${user.email} kini aktif di paket ${targetPlan}.`);
      setToastMessage(`Sukses! ${user.email} kini aktif di paket ${targetPlan} (${quotaAmount} kuota).`);
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err: any) {
      notify.error('Gagal Mengaktifkan Paket', err.message || 'Terjadi kesalahan.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleAdminResetPassword = async (user: UserItem) => {
    const defaultNewPass = 'Newsly12345';
    const confirmPrompt = window.prompt(
      `Masukkan kata sandi baru untuk ${user.email} (atau gunakan default):`,
      defaultNewPass
    );
    if (!confirmPrompt) return;

    setActionLoadingId(`${user.id}-reset`);
    try {
      const res = await fetch('/api/admin/reset-user-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetUserId: user.id,
          newPassword: confirmPrompt,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal mereset password.');

      notify.success('Password Direset', `Password baru untuk ${user.email} berhasil diterapkan.`);
      setToastMessage(`🔑 Sukses! Password untuk ${user.email} diubah menjadi: "${confirmPrompt}".`);
      setTimeout(() => setToastMessage(null), 6000);
    } catch (err: any) {
      notify.error('Gagal Reset Password', err.message || 'Terjadi kesalahan.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCancelPlan = async (user: UserItem) => {
    const confirmCancel = window.confirm(
      `Yakin ingin membatalkan paket ${user.plan} untuk ${user.email} dan mengembalikannya ke status Free Trial?`
    );
    if (!confirmCancel) return;

    setActionLoadingId(`${user.id}-cancel`);
    try {
      const res = await fetch('/api/admin/inject-quota', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetEmail: user.email,
          plan: 'TRIAL',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal membatalkan paket.');

      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id ? { ...u, plan: 'TRIAL', subscriptionStatus: 'CANCELED' } : u
        )
      );

      notify.info('Paket Dibatalkan', `Paket untuk ${user.email} dikembalikan ke Free Trial.`);
      setToastMessage(`✓ Paket untuk ${user.email} berhasil dibatalkan (dikembalikan ke Free Trial).`);
      setTimeout(() => setToastMessage(null), 5000);
    } catch (err: any) {
      notify.error('Gagal Membatalkan Paket', err.message || 'Terjadi kesalahan.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Metrics calculation
  const totalUsersCount = users.length;
  const proUsersCount = users.filter((u) => u.plan === 'PRO' || u.plan === 'BUSINESS').length;
  const freeUsersCount = users.filter((u) => u.plan === 'TRIAL' || u.plan === 'BASIC').length;
  const totalGenerationsCount = users.reduce((acc, u) => acc + (u.generateCount || 0), 0);

  // Filtered users
  const isRealUser = (u: UserItem) => !u.isGuest && !u.email.includes('@guest.');

  const registeredUsersCount = users.filter(isRealUser).length;
  const guestUsersCount = users.filter((u) => !isRealUser(u)).length;

  const filteredUsers = users.filter((user) => {
    const query = search.toLowerCase();
    const matchQuery =
      user.email.toLowerCase().includes(query) ||
      (user.name && user.name.toLowerCase().includes(query));

    if (!matchQuery) return false;

    if (filter === 'REGISTERED') return isRealUser(user);
    if (filter === 'PRO') return user.plan === 'PRO' || user.plan === 'BUSINESS';
    if (filter === 'GUEST') return !isRealUser(user);
    if (filter === 'OWNER') return user.role === 'OWNER';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* ─── 1. TOP STATS HUD ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <span className="text-[11px] font-mono uppercase font-black text-slate-700 dark:text-slate-400 flex items-center gap-1.5">
            <Users className="size-3.5 text-indigo-600 dark:text-indigo-400" /> Pengguna Asli
          </span>
          <span className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {registeredUsersCount} <span className="text-xs font-normal text-slate-400 font-mono">({totalUsersCount} total)</span>
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-slate-900/80 border border-indigo-200 dark:border-indigo-800/60 shadow-sm flex flex-col justify-between">
          <span className="text-[11px] font-mono uppercase font-black text-indigo-800 dark:text-indigo-400 flex items-center gap-1.5">
            <Sparkles className="size-3.5 text-indigo-600" /> Pengguna PRO
          </span>
          <span className="text-2xl font-black text-indigo-700 dark:text-indigo-400 mt-1">
            {proUsersCount}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-cyan-50/70 dark:bg-slate-900/80 border border-cyan-200 dark:border-cyan-800/60 shadow-sm flex flex-col justify-between">
          <span className="text-[11px] font-mono uppercase font-black text-cyan-800 dark:text-cyan-400 flex items-center gap-1.5">
            <TrendingUp className="size-3.5 text-cyan-600" /> Total Generate
          </span>
          <span className="text-2xl font-black text-cyan-700 dark:text-cyan-400 mt-1">
            {totalGenerationsCount}x
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-slate-900/80 border border-amber-200 dark:border-amber-800/60 shadow-sm flex flex-col justify-between">
          <span className="text-[11px] font-mono uppercase font-black text-amber-800 dark:text-amber-400 flex items-center gap-1.5">
            <Crown className="size-3.5 text-amber-600" /> God-Mode Status
          </span>
          <span className="text-xs font-black text-amber-900 dark:text-amber-300 mt-2">
            Master Controller Live
          </span>
        </div>
      </div>

      {/* Toast Alert */}
      {toastMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fade-in shadow-md">
          <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ─── 2. SEARCH & FILTER TOOLBAR ─── */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama atau email terdaftar..."
            className="pl-10 h-10 text-xs bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-xl"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setFilter('REGISTERED')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filter === 'REGISTERED'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            ⭐ Akun Terdaftar ({registeredUsersCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filter === 'ALL'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Semua ({totalUsersCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter('PRO')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filter === 'PRO'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            PRO ({proUsersCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter('GUEST')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filter === 'GUEST'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Tamu Anonim ({guestUsersCount})
          </button>
          <button
            type="button"
            onClick={fetchUsers}
            disabled={loading}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800"
            title="Refresh Data"
          >
            <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* ─── 3. USERS DATA TABLE ─── */}
      <div className="rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-xs font-semibold flex flex-col items-center gap-2">
            <RefreshCw className="size-6 animate-spin text-indigo-600" />
            <span>Memuat daftar pengguna...</span>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs font-semibold">
            Tidak ada pengguna yang cocok dengan pencarian "{search}".
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {filteredUsers.map((user) => {
              const isOwnerUser = user.role === 'OWNER';
              const isPro = user.plan === 'PRO' || user.plan === 'BUSINESS';
              const isReal = isRealUser(user);
              const initial = (user.name || user.email).charAt(0).toUpperCase();

              return (
                <div
                  key={user.id}
                  className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors"
                >
                  {/* User Profile & Info */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`size-10 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 shadow-sm ${
                        isOwnerUser
                          ? 'bg-amber-500 text-white'
                          : isPro
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {initial}
                    </div>

                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-slate-900 dark:text-white truncate">
                          {user.name || (isReal ? 'Pengguna Terdaftar' : 'Pengunjung Tamu')}
                        </span>

                        {isOwnerUser ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30 text-[9px] font-black uppercase">
                            <Crown className="size-2.5 text-amber-600" /> OWNER
                          </span>
                        ) : user.plan === 'BUSINESS' ? (
                          <span className="px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-[9px] font-black uppercase">
                            AGENCY
                          </span>
                        ) : user.plan === 'PRO' ? (
                          <span className="px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-[9px] font-black uppercase">
                            PRO
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 text-[9px] font-bold uppercase">
                            {user.isGuest ? 'GUEST' : 'TRIAL'}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate font-mono">
                        {isReal ? user.email : 'Belum memasukkan email asli'}
                      </p>
                    </div>
                  </div>

                  {/* Metadata: Generates & Date */}
                  <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 shrink-0">
                    <div className="flex items-center gap-1 font-semibold">
                      <Layers className="size-3.5 text-slate-400" />
                      <span>{user.generateCount} carousel</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <Calendar className="size-3.5 text-slate-400" />
                      <span>{new Date(user.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
                    </div>
                  </div>

                  {/* 1-Click Action Buttons */}
                  <div className="flex items-center gap-1.5 flex-wrap shrink-0">
                    {!isOwnerUser && isReal && (
                      <>
                        <Button
                          size="sm"
                          variant="secondary"
                          disabled={actionLoadingId === `${user.id}-PRO`}
                          onClick={() => handleInject(user, 'PRO')}
                          className={`h-8 px-3 text-xs font-bold rounded-xl shadow-sm transition-all ${
                            user.plan === 'PRO'
                              ? 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-300'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-indigo-600 hover:text-white'
                          }`}
                        >
                          <Zap className="size-3 mr-1 fill-current" />
                          <span>{actionLoadingId === `${user.id}-PRO` ? '...' : user.plan === 'PRO' ? '+200 Kuota' : 'Suntik PRO'}</span>
                        </Button>

                        <Button
                          size="sm"
                          variant="secondary"
                          disabled={actionLoadingId === `${user.id}-AGENCY`}
                          onClick={() => handleInject(user, 'AGENCY')}
                          className="h-8 px-3 text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-purple-600 hover:text-white rounded-xl shadow-sm"
                        >
                          <span>Agency (1K)</span>
                        </Button>

                        <Button
                          size="sm"
                          variant="secondary"
                          disabled={actionLoadingId === `${user.id}-STARTER`}
                          onClick={() => handleInject(user, 'STARTER')}
                          className="h-8 px-2.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl"
                        >
                          <span>50x</span>
                        </Button>

                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={actionLoadingId === `${user.id}-reset`}
                          onClick={() => handleAdminResetPassword(user)}
                          className="h-8 px-2 text-xs font-bold text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-xl"
                          title="Reset kata sandi pengguna ini"
                        >
                          <KeyRound className="size-3.5 mr-1" />
                          <span>{actionLoadingId === `${user.id}-reset` ? '...' : 'Reset Sandi'}</span>
                        </Button>

                        {user.plan !== 'TRIAL' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={actionLoadingId === `${user.id}-cancel`}
                            onClick={() => handleCancelPlan(user)}
                            className="h-8 px-2 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl"
                            title="Batalkan paket berbayar & kembalikan ke Free Trial"
                          >
                            <RotateCcw className="size-3.5 mr-1" />
                            <span>{actionLoadingId === `${user.id}-cancel` ? '...' : 'Batalkan Paket'}</span>
                          </Button>
                        )}
                      </>
                    )}

                    {!isOwnerUser && !isReal && (
                      <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-900 px-3 py-1 rounded-xl border border-slate-200 dark:border-slate-800">
                        👤 Belum Daftar Email Asli
                      </span>
                    )}

                    {isOwnerUser && (
                      <span className="text-[11px] font-mono font-bold text-amber-600 dark:text-amber-400 px-3 py-1 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800">
                        Owner Account (Full Access)
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
