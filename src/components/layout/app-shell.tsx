import { Sidebar } from '@/components/layout/sidebar';
import { BottomNav } from '@/components/layout/bottom-nav';
import { Topbar } from '@/components/layout/topbar';
import Link from 'next/link';
import { UserPlus } from 'lucide-react';
import { QuotaMeter } from '@/components/billing/quota-meter';
import { Button } from '@/components/ui/button';
import type { QuotaState } from '@/server/billing/quota';

/**
 * Desktop (>=lg): sidebar kiri + area kerja.
 * Mobile: single column, navigasi pindah ke bottom tab bar,
 * QuotaMeter naik ke atas konten karena sidebar tidak tampil.
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
    <div className="flex min-h-dvh bg-bg">
      <Sidebar quota={quota} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar title={title} email={email} />

        <main className="flex-1 px-4 pb-24 pt-5 lg:px-6 lg:pb-10">
          {/* Tamu perlu tahu kontennya belum aman. Ditaruh di atas isi, bukan
              hanya di sidebar, karena di layar kecil sidebar tidak terlihat. */}
          {quota.isGuest && (
            <div className="mb-4 flex flex-wrap items-center gap-3 rounded-lg border border-accent/25 bg-accent-soft px-4 py-3">
              <p className="min-w-0 flex-1 text-sm">
                Kamu sedang mencoba tanpa akun.{' '}
                <span className="text-muted">Daftar gratis supaya hasilnya tersimpan dan bisa dibuka lagi nanti.</span>
              </p>
              <Button asChild size="sm">
                <Link href="/register">
                  <UserPlus aria-hidden /> Daftar gratis
                </Link>
              </Button>
            </div>
          )}

          <div className="mb-4 lg:hidden">
            <QuotaMeter quota={quota} compact />
          </div>
          {children}
        </main>
      </div>

      <BottomNav />
    </div>
  );
}
