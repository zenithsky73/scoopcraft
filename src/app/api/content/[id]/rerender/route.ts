import { NextResponse } from 'next/server';
import { getViewer } from '@/server/viewer';
import { db } from '@/server/db';
import { rateLimit } from '@/server/rate-limit';
import { rerenderContent } from '@/server/pipeline/run-service';

export const runtime = 'nodejs';

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const viewer = await getViewer();
  if (!viewer) {
    return NextResponse.json({ error: 'Silakan masuk terlebih dahulu.' }, { status: 401 });
  }

  // Render memakai Chromium; batasi agar tombol yang ditekan berkali-kali
  // tidak menumpuk antrean.
  const limit = rateLimit(`rerender:${viewer.user.id}`, 10, 60_000);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: 'Terlalu sering render ulang. Tunggu sebentar.', code: 'RATE_LIMITED' },
      { status: 429, headers: { 'retry-after': String(limit.retryAfterSec) } },
    );
  }

  const owned = await db.generatedContent.findFirst({
    where: { id: params.id, article: { userId: viewer.user.id } },
    select: { id: true },
  });
  if (!owned) return NextResponse.json({ error: 'Konten tidak ditemukan.' }, { status: 404 });

  try {
    const result = await rerenderContent(params.id, viewer.user.id);
    return NextResponse.json(result, { status: 202 });
  } catch (err) {
    console.error('[rerender]', err);
    return NextResponse.json({ error: 'Gagal memulai render ulang.' }, { status: 500 });
  }
}
