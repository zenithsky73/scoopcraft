import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Crown, Users, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { getViewer } from '@/server/viewer';
import { APP } from '@/config/app';
import { MasterUsersTable } from '@/components/admin/master-users-table';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Master Pengguna & Injector Kuota',
  description: 'Pusat kendali dan manajemen pengguna terdaftar Newsly AI.',
};

export default async function AdminUsersPage() {
  const viewer = await getViewer();
  if (!viewer) redirect('/login');

  const isOwner =
    viewer.user.email === APP.ownerEmail ||
    (viewer.user.email && APP.ownerEmail.toLowerCase() === viewer.user.email.toLowerCase()) ||
    viewer.user.role === 'OWNER';

  if (!isOwner) {
    redirect('/dashboard');
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800/80 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30 text-[10px] font-mono font-black uppercase">
              <Crown className="size-3 text-amber-600 dark:text-amber-400" /> GOD-MODE OWNER COMMAND
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Users className="size-7 text-indigo-600" /> Master Pengguna Platform
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Daftar lengkap pengguna yang terdaftar di Newsly AI. Anda dapat melihat metrik penggunaan dan menyuntikkan kuota langganan secara instan 1-klik.
          </p>
        </div>

        <Button asChild variant="secondary" size="sm" className="text-xs font-bold rounded-xl self-start sm:self-auto bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <Link href="/dashboard" className="flex items-center gap-1.5">
            <ArrowLeft className="size-4" /> Kembali ke Generator
          </Link>
        </Button>
      </div>

      {/* Master Users Management Table */}
      <MasterUsersTable />
    </div>
  );
}
