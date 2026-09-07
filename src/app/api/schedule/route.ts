import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getViewer } from '@/server/viewer';
import { db } from '@/server/db';
import type { SocialPlatform, OutputFormat, DesignStyle } from '@prisma/client';

export const runtime = 'nodejs';

const createScheduleSchema = z.object({
  generatedContentId: z.string().optional().nullable(),
  platform: z.enum(['INSTAGRAM', 'LINKEDIN', 'FACEBOOK', 'THREADS', 'PINTEREST', 'TELEGRAM']),
  scheduledAt: z.string().datetime(),
  caption: z.string().min(1, 'Caption tidak boleh kosong'),
  hashtags: z.array(z.string()).default([]),
  mediaUrls: z.array(z.string()).min(1, 'Minimal satu gambar carousel diperlukan'),
  format: z.enum(['FEED_SQUARE', 'FEED_PORTRAIT', 'STORY']).default('FEED_PORTRAIT'),
  style: z.string().optional().nullable(),
  socialAccountId: z.string().optional().nullable(),
  isSimulated: z.boolean().default(false),
});

// GET: Ambil daftar jadwal postingan user
export async function GET(req: Request) {
  const viewer = await getViewer();
  if (!viewer?.user) {
    return NextResponse.json({ error: 'Silakan login terlebih dahulu.' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const month = searchParams.get('month'); // e.g. "2026-09"

  try {
    const whereClause: any = {
      userId: viewer.user.id,
    };

    if (status) {
      whereClause.status = status;
    }

    if (month) {
      const [yearStr, monthStr] = month.split('-');
      const year = parseInt(yearStr, 10);
      const m = parseInt(monthStr, 10) - 1;
      const startOfMonth = new Date(year, m, 1);
      const endOfMonth = new Date(year, m + 1, 0, 23, 59, 59, 999);
      whereClause.scheduledAt = {
        gte: startOfMonth,
        lte: endOfMonth,
      };
    }

    const posts = await db.scheduledPost.findMany({
      where: whereClause,
      include: {
        socialAccount: {
          select: {
            id: true,
            accountName: true,
            accountHandle: true,
            avatarUrl: true,
            platform: true,
          },
        },
        generatedContent: {
          select: {
            id: true,
            headline: true,
            visualUrl: true,
          },
        },
      },
      orderBy: { scheduledAt: 'asc' },
    });

    return NextResponse.json({ posts });
  } catch (error: any) {
    console.error('[Schedule API] Error fetching posts:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil daftar jadwal postingan.' },
      { status: 500 }
    );
  }
}

// POST: Buat jadwal postingan baru
export async function POST(req: Request) {
  const viewer = await getViewer();
  if (!viewer?.user) {
    return NextResponse.json({ error: 'Silakan login terlebih dahulu.' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const validated = createScheduleSchema.parse(body);

    const scheduleDate = new Date(validated.scheduledAt);

    // Cek apakah ada akun sosial yang ditentukan atau buat / gunakan akun default
    let accountId = validated.socialAccountId;
    if (!accountId) {
      // Cari akun pertama user untuk platform tersebut
      const existingAccount = await db.socialAccount.findFirst({
        where: {
          userId: viewer.user.id,
          platform: validated.platform as SocialPlatform,
          isConnected: true,
        },
      });

      if (existingAccount) {
        accountId = existingAccount.id;
      } else {
        // Otomatis buat akun simulasi/demo jika belum ada akun terhubung
        const newDemoAccount = await db.socialAccount.create({
          data: {
            userId: viewer.user.id,
            platform: validated.platform as SocialPlatform,
            accountName: `${viewer.user.name || 'Newsly User'} (${validated.platform})`,
            accountHandle: `@${(viewer.user.name || 'newsly').toLowerCase().replace(/\s+/g, '')}`,
            accessToken: 'demo_token',
            isConnected: true,
          },
        });
        accountId = newDemoAccount.id;
      }
    }

    const scheduledPost = await db.scheduledPost.create({
      data: {
        userId: viewer.user.id,
        generatedContentId: validated.generatedContentId || null,
        socialAccountId: accountId,
        platform: validated.platform as SocialPlatform,
        status: 'PENDING',
        scheduledAt: scheduleDate,
        caption: validated.caption,
        hashtags: validated.hashtags,
        mediaUrls: validated.mediaUrls,
        format: validated.format as OutputFormat,
        style: (validated.style as DesignStyle) || null,
        isSimulated: validated.isSimulated || true,
      },
      include: {
        socialAccount: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Postingan berhasil dijadwalkan!',
      post: scheduledPost,
    });
  } catch (error: any) {
    console.error('[Schedule API] Error creating schedule:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues?.[0]?.message || 'Data input tidak valid.' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error?.message || 'Gagal membuat jadwal postingan.' },
      { status: 500 }
    );
  }
}
