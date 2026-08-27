import type { Metadata } from 'next';
import { ContentGrid } from '@/components/history/content-grid';

export const metadata: Metadata = { title: 'Riwayat' };

export default function ContentHistoryPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">Riwayat konten</h2>
        <p className="mt-1 text-sm text-muted">Semua konten yang pernah kamu buat.</p>
      </div>

      <ContentGrid />
    </div>
  );
}
