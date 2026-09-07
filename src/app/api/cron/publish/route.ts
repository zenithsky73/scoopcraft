import { NextResponse } from 'next/server';
import { db } from '@/server/db';
import { executeScheduledPost } from '@/server/social/publisher';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Cron Worker Endpoint: Dieksekusi otomatis oleh Vercel Cron atau external scheduler (e.g. per 1 atau 5 menit)
 * URL: /api/cron/publish
 */
export async function GET(req: Request) {
  // Verifikasi otorisasi Cron (CRON_SECRET) jika diset
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    // Izinkan juga jika di lingkungan development lokal
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Tidak diizinkan' }, { status: 401 });
    }
  }

  const now = new Date();

  try {
    // Ambil postingan dengan status PENDING yang jadwalnya sudah tiba
    const pendingPosts = await db.scheduledPost.findMany({
      where: {
        status: 'PENDING',
        scheduledAt: {
          lte: now,
        },
      },
      take: 10, // Batch per eksekusi
      orderBy: { scheduledAt: 'asc' },
    });

    if (pendingPosts.length === 0) {
      return NextResponse.json({
        message: 'Tidak ada postingan yang jatuh tempo saat ini.',
        count: 0,
        timestamp: now.toISOString(),
      });
    }

    const results = [];
    for (const post of pendingPosts) {
      const result = await executeScheduledPost(post.id);
      results.push({
        postId: post.id,
        platform: post.platform,
        result,
      });
    }

    return NextResponse.json({
      message: `Berhasil memproses ${results.length} postingan.`,
      count: results.length,
      results,
      timestamp: now.toISOString(),
    });
  } catch (error: any) {
    console.error('[Cron Publish Error]:', error);
    return NextResponse.json(
      { error: error?.message || 'Gagal mengeksekusi cron publish.' },
      { status: 500 }
    );
  }
}
