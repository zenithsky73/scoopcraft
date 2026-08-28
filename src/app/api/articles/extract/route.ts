import { NextResponse } from 'next/server';
import { auth } from '@/server/auth';
import { rateLimit } from '@/server/rate-limit';
import { extractArticle, isScrapeError } from '@/server/scraper';
import { extractRequestSchema } from '@/server/scraper/types';
import { upsertArticle } from '@/server/scraper/persist';
import { z } from 'zod';

// jsdom & playwright butuh Node runtime, bukan Edge.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const bodySchema = extractRequestSchema.extend({
  /** Simpan hasilnya ke tabel Article milik user. */
  save: z.boolean().optional(),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Silakan masuk terlebih dahulu.' }, { status: 401 });
  }

  // Scraping memanggil server pihak ketiga — batasi agar tidak jadi
  // alat abuse dan tidak membuat IP kita diblokir portal berita.
  const limit = rateLimit(`extract:${session.user.id}`, 20, 60_000);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: 'Terlalu banyak permintaan. Coba lagi sebentar lagi.', code: 'RATE_LIMITED' },
      { status: 429, headers: { 'retry-after': String(limit.retryAfterSec) } },
    );
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: 'Body harus JSON.', code: 'BAD_REQUEST' }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Data tidak valid.', code: 'BAD_REQUEST' },
      { status: 400 },
    );
  }

  try {
    const article = await extractArticle(parsed.data);

    let articleId: string | undefined;
    if (parsed.data.save) {
      const saved = await upsertArticle(session.user.id, article);
      articleId = saved.id;
    }

    return NextResponse.json(
      { article, articleId },
      { headers: { 'x-ratelimit-remaining': String(limit.remaining) } },
    );
  } catch (err) {
    if (isScrapeError(err)) {
      // detail hanya untuk log; klien cukup dapat pesan yang bisa ditindaklanjuti.
      console.warn('[extract]', err.code, err.detail ?? '', parsed.data.url);
      return NextResponse.json({ error: err.message, code: err.code }, { status: err.status });
    }

    console.error('[extract] unexpected', err);
    return NextResponse.json({ error: 'Gagal memproses artikel.', code: 'UNKNOWN' }, { status: 500 });
  }
}
