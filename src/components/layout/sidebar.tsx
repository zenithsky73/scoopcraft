'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles, Crown, Users } from 'lucide-react';
import { NAV_ITEMS, isActive } from '@/components/layout/nav-items';
import { QuotaMeter } from '@/components/billing/quota-meter';
import type { QuotaState } from '@/server/billing/quota';
import { cn } from '@/lib/utils';

export function Sidebar({ quota }: { quota: QuotaState }) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/90 backdrop-blur-xl lg:flex text-slate-900 dark:text-slate-200 transition-colors duration-200">
      {/* Brand Header */}
      <div className="flex h-18 items-center justify-between border-b border-slate-200 dark:border-slate-800/80 px-4 py-3">
        <Link href="/dashboard" className="flex items-center gap-2.5 group min-w-0">
          <div className="relative size-9 rounded-xl overflow-hidden shadow-md shadow-indigo-600/20 shrink-0 group-hover:scale-105 transition-transform bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center">
            <img
              src="/logo-icon.png"
              alt="Newsly AI Icon"
              className="size-7 object-contain"
            />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-black tracking-tight text-slate-900 dark:text-white block leading-tight">
                Newsly<span className="bg-gradient-to-r from-cyan-500 via-pink-500 to-amber-500 bg-clip-text text-transparent">AI</span>
              </span>
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate block">
              From News to Content
            </span>
          </div>
        </Link>

        {quota.isOwner ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30 text-[9px] font-black uppercase tracking-wider shadow-sm shrink-0">
            <Crown className="size-2.5 text-amber-600 dark:text-amber-400" /> OWNER
          </span>
        ) : (
          <span className="px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-[9px] font-black uppercase tracking-wider shrink-0">
            PRO
          </span>
        )}
      </div>

      {/* Navigation List */}
      <nav className="flex-1 space-y-1.5 p-3.5">
        <div className="px-3 py-1 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          Menu Utama
        </div>
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-bold transition-all duration-200',
                active
                  ? 'bg-indigo-600 dark:bg-indigo-600 text-white shadow-md shadow-indigo-600/30 scale-[1.01]'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900/80 hover:text-slate-950 dark:hover:text-white'
              )}
            >
              <div className="flex items-center gap-3 min-w-0">
                <item.icon className={cn('size-4 shrink-0', active ? 'text-white' : 'text-slate-500 dark:text-slate-400')} aria-hidden />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={cn(
                    'text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 ml-1.5',
                    active
                      ? 'bg-white/20 text-white'
                      : 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60'
                  )}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}

        {/* Master Users Command for Owner */}
        {quota.isOwner && (
          <div className="pt-2">
            <Link
              href="/admin/users"
              aria-current={pathname === '/admin/users' ? 'page' : undefined}
              className={cn(
                'flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-bold transition-all duration-200',
                pathname === '/admin/users'
                  ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30 scale-[1.01]'
                  : 'text-amber-800 dark:text-amber-300 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/40 hover:bg-amber-100 dark:hover:bg-amber-900/50'
              )}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Users className={cn('size-4 shrink-0', pathname === '/admin/users' ? 'text-white' : 'text-amber-600 dark:text-amber-400')} />
                <span className="truncate">Master Pengguna</span>
              </div>
              <span className="text-[9px] font-mono font-black px-2 py-0.5 rounded-full bg-amber-200/70 dark:bg-amber-500/20 text-amber-900 dark:text-amber-300 border border-amber-300/80 dark:border-amber-500/30">
                OWNER
              </span>
            </Link>
          </div>
        )}
      </nav>

      {/* Footer Quota Meter */}
      <div className="border-t border-slate-200 dark:border-slate-800/80 p-3.5 bg-slate-50 dark:bg-slate-900/40">
        <QuotaMeter quota={quota} />
      </div>
    </aside>
  );
}
