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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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
  const [filter, setFilter] = React.useState<'ALL' | 'PRO' | 'FREE' | 'OWNER'>('ALL');
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

      setToastMessage(`Sukses! ${user.email} kini aktif di paket ${targetPlan} (${quotaAmount} kuota).`);
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Terjadi kesalahan.');
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
  const filteredUsers = users.filter((user) => {
    const query = search.toLowerCase();
    const matchQuery =
      user.email.toLowerCase().includes(query) ||
      (user.name && user.name.toLowerCase().includes(query));

    if (!matchQuery) return false;

    if (filter === 'PRO') return user.plan === 'PRO' || user.plan === 'BUSINESS';
    if (filter === 'FREE') return user.plan === 'TRIAL' || user.plan === 'BASIC';
    if (filter === 'OWNER') return user.role === 'OWNER';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* ─── 1. TOP STATS HUD ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <span className="text-[11px] font-mono uppercase font-black text-slate-700 dark:text-slate-400 flex items-center gap-1.5">
            <Users className="size-3.5 text-indigo-600 dark:text-indigo-400" /> Total Pengguna
          </span>
          <span className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {totalUsersCount}
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
            placeholder="Cari nama atau email pengguna..."
            className="pl-10 h-10 text-xs bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-xl"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
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
            onClick={() => setFilter('FREE')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filter === 'FREE'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Free / Trial ({freeUsersCount})
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
                          {user.name || 'Pengguna'}
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
                        {user.email}
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
                    {!isOwnerUser && (
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
                      </>
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
