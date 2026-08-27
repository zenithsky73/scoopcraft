import { NextResponse } from 'next/server';
import { z } from 'zod';
import { DesignStyle, OutputFormat } from '@prisma/client';
import { getViewer, getOrCreateGuest } from '@/server/viewer';
import { db } from '@/server/db';
import { rateLimit } from '@/server/rate-limit';
import { getQuotaState, QUOTA_MESSAGES, isQuotaError } from '@/server/billing/quota';
import { GUEST } from '@/config/trial';
import { createRun } from '@/server/pipeline/run-service';
import { normalizeUrl } from '@/server/scraper/url-guard';
import { isScrapeError } from '@/server/scraper';
import { AVAILABLE_STYLES, DEFAULT_STYLE } from '@/config/styles';
import { DEFAULT_FORMATS } from '@/config/formats';
import { SLIDES } from '@/server/design/deck';

export const runtime = 'nodejs';

const bodySchema = z.object({
  url: z.string().trim().min(1, 'URL wajib diisi').max(2048),
  styles: z.array(z.nativeEnum(DesignStyle)).min(1).max(4).optional(),
  formats: z.array(z.nativeEnum(OutputFormat)).min(1).max(3).optional(),
  /** 1 = gambar tunggal, >1 = carousel (cover + poin + penutup). */
  slides: z.number().int().min(SLIDES.min).max(SLIDES.max).optional(),
});

const AVAILABLE = new Set(AVAILABLE_STYLES.map((style) => style.id));

export async function POST(req: Request) {
  // Pengunjung yang belum punya akun dibuatkan akun tamu di sini — bukan saat
  // membuka halaman — supaya tidak ada baris User sampah dari orang yang cuma
  // lewat. Kuotanya kecil dan dijaga pagar IP di bawah.
  let viewer = await getViewer();
  if (!viewer) {
    if (!GUEST.enabled) {
      return NextResponse.json({ error: 'Silakan masuk terlebih dahulu.' }, { status: 401 });
    }

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
    const ipLimit = rateLimit(`guest-ip:${ip}`, GUEST.perIpPerDay, 86_400_000);
    if (!ipLimit.allowed) {
      return NextResponse.json(
        { error: 'Percobaan gratis dari jaringan ini sudah habis hari ini. Daftar gratis untuk lanjut.', code: 'GUEST_LIMIT' },
        { status: 429 },
      );
    }

    try {
      viewer = await getOrCreateGuest();
    } catch (err) {
      console.error('[generate] gagal membuat akun tamu', err);
      const detail = err instanceof Error ? err.message : String(err);
      return NextResponse.json(
        {
          error: detail.includes('database') || detail.includes('relation') || detail.includes('connect')
            ? 'Koneksi database cloud belum terhubung. Pastikan DATABASE_URL sudah diatur di Vercel dan tabel sudah dibuat (prisma db push).'
            : 'Layanan database sedang bermasalah. Coba lagi sebentar lagi.',
          code: 'UNAVAILABLE',
        },
        { status: 503 },
      );
    }
  }

  const limit = rateLimit(`generate:${viewer.user.id}`, 10, 60_000);
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
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Data tidak valid.', code: 'BAD_REQUEST' }, { status: 400 });
  }

  // Validasi URL lebih awal supaya kuota tidak terpakai untuk URL yang
  // jelas-jelas tidak bisa diproses.
  let url: string;
  try {
    url = normalizeUrl(parsed.data.url).href;
  } catch (err) {
    const message = isScrapeError(err) ? err.message : 'URL tidak valid.';
    return NextResponse.json({ error: message, code: 'INVALID_URL' }, { status: 400 });
  }

  const styles = (parsed.data.styles ?? [DEFAULT_STYLE]).filter((style) => AVAILABLE.has(style));
  if (styles.length === 0) {
    return NextResponse.json({ error: 'Gaya desain yang dipilih belum tersedia.', code: 'STYLE_UNAVAILABLE' }, { status: 400 });
  }
  const formats = parsed.data.formats ?? DEFAULT_FORMATS;

  const user = viewer.user;
  const quota = getQuotaState(user);
  if (!quota.allowed && quota.reason) {
    return NextResponse.json(
      { error: QUOTA_MESSAGES[quota.reason], code: quota.reason, quota },
      { status: 403 },
    );
  }

  try {
    const run = await createRun({
      userId: user.id,
      url,
      styles,
      formats,
      slides: parsed.data.slides,
    });

    return NextResponse.json(
      { runId: run.id, status: run.status, stepsTotal: run.stepsTotal, slides: run.requestedSlides },
      { status: 202 },
    );
  } catch (err) {
    if (isQuotaError(err)) {
      return NextResponse.json({ error: err.message, code: err.reason, quota: err.state }, { status: 403 });
    }

    console.error('[generate]', err);
    const detail = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      {
        error: detail || 'Gagal memulai proses.',
        code: 'UNKNOWN',
      },
      { status: 500 },
    );
  }
}
