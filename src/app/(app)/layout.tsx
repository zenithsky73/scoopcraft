import { redirect } from 'next/navigation';
import { getViewer } from '@/server/viewer';
import { getQuotaState } from '@/server/billing/quota';
import { AppShell } from '@/components/layout/app-shell';

// Layout ini yang menyuntik user + quota ke seluruh area aplikasi.
// Quota dibaca dari DB (bukan dari JWT) supaya selalu segar setelah generate.
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  // Tamu ikut masuk ke sini: ia sudah punya baris User sendiri, jadi seluruh
  // halaman bekerja apa adanya — yang berbeda hanya kuota dan ajakan mendaftar.
  const viewer = await getViewer();
  if (!viewer) redirect('/login');

  const { user, isGuest } = viewer;
  const quota = getQuotaState(user);

  return (
    <AppShell title="Scoopcraft" email={isGuest ? null : user.email} quota={quota}>
      {children}
    </AppShell>
  );
}
