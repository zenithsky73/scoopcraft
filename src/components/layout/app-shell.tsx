import { Sidebar } from '@/components/layout/sidebar';
import { BottomNav } from '@/components/layout/bottom-nav';
import { Topbar } from '@/components/layout/topbar';
import Link from 'next/link';
import { UserPlus, Sparkles } from 'lucide-react';
import { QuotaMeter } from '@/components/billing/quota-meter';
import { Button } from '@/components/ui/button';
import type { QuotaState } from '@/server/billing/quota';

/**
 * Desktop (>=lg): sidebar kiri + area kerja.
 * Mobile: single column, navigasi pindah ke bottom tab bar.
 */
export function AppShell({
  title,
  email,
  quota,
  children,
}: {
  title: string;
  email?: string | null;
  quota: QuotaState;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <Sidebar quota={quota} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar title={title} email={email} quota={quota} />

        <main className="flex-1 px-4 pb-24 pt-6 sm:px-6 lg:px-8 lg:pb-12">
          {/* Banner Ajakan Daftar untuk Tamu */}
          {quota.isGuest && (
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-primary/30 bg-primary/10 dark:bg-gradient-to-r dark:from-primary/15 dark:to-indigo-900/20 px-5 py-3.5 shadow-lg backdrop-blur-md">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Sparkles className="size-4 text-primary" />
                  Anda sedang dalam Mode Tamu ({quota.remaining} percobaan tersisa)
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  Daftarkan akun gratis Anda (kuota 20x) agar seluruh carousel tersimpan rapi dan bisa diakses kapan saja.
                </p>
              </div>
              <Button asChild size="sm" className="bg-primary hover:bg-primary/90 text-white font-bold text-xs rounded-xl">
                <Link href="/register">
                  <UserPlus className="size-3.5 mr-1" /> Daftar Akun Gratis
                </Link>
              </Button>
            </div>
          )}

          <div className="mb-6 lg:hidden">
            <QuotaMeter quota={quota} compact />
          </div>

          {children}
        </main>
      </div>

      <BottomNav />
    </div>
  );
}
