'use client';

import * as React from 'react';
import { LogOut, User as UserIcon, Crown, Shield, Settings, Sparkles } from 'lucide-react';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function UserMenu({
  email,
  isOwner = false,
  isGuest = false,
}: {
  email?: string | null;
  isOwner?: boolean;
  isGuest?: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-800 dark:text-slate-200 transition-all cursor-pointer shadow-sm"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <div className="size-7 rounded-lg bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
          {isOwner ? '👑' : email ? email.charAt(0).toUpperCase() : 'G'}
        </div>
        <span className="text-xs font-semibold max-w-[100px] sm:max-w-[140px] truncate hidden sm:inline text-slate-700 dark:text-slate-300">
          {isOwner ? 'Owner' : email || 'Tamu'}
        </span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-12 w-60 animate-fade-in rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/95 p-2 shadow-2xl backdrop-blur-xl z-50 text-slate-800 dark:text-slate-200 transition-colors duration-200"
        >
          {/* User Info Header */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 mb-2">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                {isOwner ? 'Pemilik Sistem' : isGuest ? 'Sesi Tamu' : 'Pengguna Terdaftar'}
              </span>
              {isOwner && (
                <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-amber-500/15 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                  OWNER
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate font-mono">
              {email ?? 'Sesi Sementara'}
            </p>
          </div>

          <div className="space-y-1">
            <Link
              href="/templates"
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white"
            >
              <Sparkles className="size-3.5 text-primary" />
              Template Explorer
            </Link>

            <Link
              href="/settings"
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white"
            >
              <Settings className="size-3.5 text-slate-400" />
              Watermark & Setelan
            </Link>

            <div className="my-1.5 h-px bg-slate-200 dark:bg-slate-800" />

            {isGuest ? (
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-primary transition-colors hover:bg-primary/10"
              >
                <UserIcon className="size-3.5" />
                Masuk / Buat Akun
              </Link>
            ) : (
              <button
                role="menuitem"
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-red-600 dark:text-red-400 transition-colors hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-700 dark:hover:text-red-300"
              >
                <LogOut className="size-3.5" aria-hidden />
                Keluar
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
