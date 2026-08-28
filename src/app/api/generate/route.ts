import { NextResponse } from 'next/server';
import { z } from 'zod';
import { DesignStyle, OutputFormat } from '@prisma/client';
import { getViewer, getOrCreateGuest } from '@/server/viewer';
import { getQuotaState, QUOTA_MESSAGES, isQuotaError } from '@/server/billing/quota';
import { generateDirect } from '@/server/ai/direct-generator';
import { SLIDES } from '@/server/design/deck';
import { db } from '@/server/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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
    // 1. Resolve User / Viewer with extreme resilience
    let user: any = null;
    try {
      const viewer = await getViewer();
      if (viewer?.user) {
        user = viewer.user;
      }
    } catch (e) {
      console.warn('[generate] getViewer error:', e);
    }

    if (!user) {
      try {
        const guestViewer = await getOrCreateGuest();
        user = guestViewer.user;
      } catch (err: any) {
        console.warn('[generate] getOrCreateGuest failed, fallback to finding/creating guest user:', err);
        // Direct DB fallback
        user = await db.user.findFirst({ where: { isGuest: true } });
        if (!user) {
          user = await db.user.create({
            data: {
              email: `guest-${Date.now()}@scoopcraft.local`,
              isGuest: true,
              plan: 'TRIAL',
              subscriptionStatus: 'TRIALING',
            },
          });
        }
      }
    }

    if (!user) {
      return NextResponse.json({ error: 'Gagal mendeteksi sesi pengguna. Silakan muat ulang halaman.' }, { status: 401 });
    }

    // 2. Parse payload safely
    let raw: unknown;
    try {
      raw = await req.json();
    } catch {
      return NextResponse.json({ error: 'Data request tidak valid (bukan JSON).' }, { status: 400 });
    }

    const parsed = bodySchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Data input tidak valid.' },
        { status: 400 },
      );
    }

    const data = parsed.data;

    // 3. Check Quota
    try {
      const quota = getQuotaState(user);
      if (!quota.allowed && quota.reason) {
        return NextResponse.json(
          { error: QUOTA_MESSAGES[quota.reason] || 'Batas kuota akun Anda sudah habis. Silakan upgrade paket.' },
          { status: 403 },
        );
      }
    } catch (quotaErr: any) {
      console.warn('[generate] quota check error (allowing user to proceed):', quotaErr);
    }

    // 4. Determine style & format
    const chosenStyle = data.styles?.[0] || data.style || 'BREAKING_NEWS';
    const chosenFormat = data.formats?.[0] || data.format || 'FEED_PORTRAIT';

    // 5. Run Direct Synchronous Generation
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

    return NextResponse.json({
      success: true,
      runId: result.runId,
      status: 'COMPLETED',
      article: result.article,
      content: result.content,
      generatedContent: result.content,
      run: { id: result.runId },
      style: result.style,
      format: result.format,
    });
  } catch (err: any) {
    console.error('[generate] Unhandled API error:', err);

    if (isQuotaError(err)) {
      return NextResponse.json({ error: err.message, code: err.reason }, { status: 403 });
    }

    const message = err?.message || String(err);
    return NextResponse.json(
      {
        error: message.includes('API_KEY')
          ? 'Kunci API Gemini belum terhubung di server. Silakan hubungi admin.'
          : message || 'Terjadi kesalahan saat memproses AI. Silakan coba kembali.',
        detail: message,
      },
      { status: 500 },
    );
  }
}
