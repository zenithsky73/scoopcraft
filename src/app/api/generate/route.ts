import { NextResponse } from 'next/server';
import { z } from 'zod';
import { DesignStyle, OutputFormat } from '@prisma/client';
import { getViewer, getOrCreateGuest } from '@/server/viewer';
import { rateLimit } from '@/server/rate-limit';
import { getQuotaState, QUOTA_MESSAGES, isQuotaError } from '@/server/billing/quota';
import { GUEST } from '@/config/trial';
import { generateDirect } from '@/server/ai/direct-generator';
import { SLIDES } from '@/server/design/deck';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const bodySchema = z.object({
  mode: z.enum(['url', 'text', 'prompt']).default('url'),
  url: z.string().trim().max(2048).optional(),
  rawText: z.string().trim().max(50000).optional(),
  rawTitle: z.string().trim().max(500).optional(),
  prompt: z.string().trim().max(5000).optional(),
  tone: z.string().trim().max(100).optional(),
  style: z.nativeEnum(DesignStyle).default('BREAKING_NEWS'),
  format: z.nativeEnum(OutputFormat).default('FEED_PORTRAIT'),
  styles: z.array(z.nativeEnum(DesignStyle)).optional(),
  formats: z.array(z.nativeEnum(OutputFormat)).optional(),
  slides: z.number().int().min(SLIDES.min).max(SLIDES.max).default(5),
});

export async function POST(req: Request) {
  try {
    let viewer: any = null;
    try {
      viewer = await getViewer();
    } catch (e) {
      console.warn('[generate] getViewer error', e);
    }

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
              ? 'Koneksi database cloud belum terhubung. Pastikan DATABASE_URL sudah diatur di Vercel.'
              : `Gagal membuat sesi tamu: ${detail}`,
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

    const data = parsed.data;
    const user = viewer.user;

    // Check Quota
    const quota = getQuotaState(user);
    if (!quota.allowed && quota.reason) {
      return NextResponse.json(
        { error: QUOTA_MESSAGES[quota.reason], code: quota.reason, quota },
        { status: 403 },
      );
    }

    // Determine style & format
    const chosenStyle = data.styles?.[0] || data.style || 'BREAKING_NEWS';
    const chosenFormat = data.formats?.[0] || data.format || 'FEED_PORTRAIT';

    // Direct synchronous generation
    const result = await generateDirect({
      userId: user.id,
      mode: data.mode,
      url: data.url,
      rawText: data.rawText,
      rawTitle: data.rawTitle,
      prompt: data.prompt,
      tone: data.tone,
      style: chosenStyle,
      format: chosenFormat,
      slides: data.slides,
    });

    return NextResponse.json(
      {
        runId: result.runId,
        status: 'COMPLETED',
        article: result.article,
        content: result.content,
        style: result.style,
        format: result.format,
      },
      { status: 200 },
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
