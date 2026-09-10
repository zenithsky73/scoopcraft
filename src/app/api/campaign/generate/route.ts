import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getViewer, getOrCreateGuest } from '@/server/viewer';
import { db } from '@/server/db';
import { generateCampaignPlan } from '@/server/ai/campaign-generator';
import type { SocialPlatform, OutputFormat, DesignStyle, ScheduleStatus } from '@prisma/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Allow up to 60s for batch campaign generation

const campaignRequestSchema = z.object({
  topic: z.string().min(3, 'Topik campaign minimal 3 karakter'),
  durationDays: z.number().int().min(7).max(30).default(30),
  startDate: z.string().optional(),
  preferredTime: z.string().default('09:00'),
  platform: z.enum(['INSTAGRAM', 'FACEBOOK', 'THREADS']).default('INSTAGRAM'),
  niche: z.string().optional(),
  contentType: z.string().optional(),
  style: z.string().optional(),
  autoCommit: z.boolean().default(true),
});

export async function POST(req: Request) {
  // 1. Resilient Viewer Resolution (support logged-in or guest users)
  let user: any = null;
  try {
    const viewer = await getViewer();
    if (viewer?.user) {
      user = viewer.user;
    }
  } catch (e) {
    console.warn('[Campaign API] getViewer warning:', e);
  }

  if (!user) {
    try {
      const guestViewer = await getOrCreateGuest();
      user = guestViewer.user;
    } catch (err: any) {
      user = await db.user.findFirst({ where: { isGuest: true } });
      if (!user) {
        user = await db.user.create({
          data: {
            email: 'guest-' + Date.now() + '@scoopcraft.local',
            isGuest: true,
            plan: 'TRIAL',
            subscriptionStatus: 'TRIALING',
          },
        });
      }
    }
  }

  if (!user) {
    return NextResponse.json(
      { success: false, error: 'Sesi pengguna tidak ditemukan. Silakan login atau muat ulang halaman.' },
      { status: 401 }
    );
  }

  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Data request tidak valid (bukan JSON).' },
        { status: 400 }
      );
    }

    const validated = campaignRequestSchema.parse(body);

    // 2. Generate rencana 30 hari via AI (dengan fast fallback < 8s)
    const campaign = await generateCampaignPlan({
      topic: validated.topic,
      durationDays: validated.durationDays,
      startDate: validated.startDate,
      preferredTime: validated.preferredTime,
      platform: validated.platform,
      niche: validated.niche,
      contentType: validated.contentType,
      style: validated.style as DesignStyle,
    });

    let scheduledCount = 0;

    // 3. Jika autoCommit = true, simpan semua 30 hari ke ScheduledPost dalam 1 batch cepat
    if (validated.autoCommit && campaign.days.length > 0) {
      let socialAccount = await db.socialAccount.findFirst({
        where: {
          userId: user.id,
          platform: validated.platform as SocialPlatform,
          isConnected: true,
        },
      });

      if (!socialAccount) {
        socialAccount = await db.socialAccount.create({
          data: {
            userId: user.id,
            platform: validated.platform as SocialPlatform,
            accountName: (user.name || 'InstaDeck User') + ' (' + validated.platform + ')',
            accountHandle: '@' + (user.name || 'instadeck').toLowerCase().replace(/\s+/g, ''),
            accessToken: 'demo_token',
            isConnected: true,
          },
        });
      }

      // Siapkan data batch untuk createMany
      const postsToCreate = campaign.days.map((dayPost) => {
        const scheduledDateTime = new Date(dayPost.date + 'T' + dayPost.time + ':00');
        const slideUrls = Array.from({ length: dayPost.slides.length || 4 }, (_, i) =>
          'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1080&auto=format&fit=crop&q=80'
        );

        return {
          userId: user.id,
          socialAccountId: socialAccount.id,
          platform: validated.platform as SocialPlatform,
          status: 'PENDING' as ScheduleStatus,
          scheduledAt: scheduledDateTime,
          caption: dayPost.caption,
          hashtags: dayPost.hashtags,
          mediaUrls: slideUrls,
          format: 'FEED_PORTRAIT' as OutputFormat,
          style: (validated.style as DesignStyle) || 'CULINARY',
          isSimulated: true,
        };
      });

      const batchResult = await db.scheduledPost.createMany({
        data: postsToCreate,
      });

      scheduledCount = batchResult.count;
    }

    return NextResponse.json({
      success: true,
      message: 'Berhasil menghasilkan kampanye konten ' + campaign.days.length + ' hari!',
      topic: campaign.topic,
      count: campaign.days.length,
      scheduledCount,
      days: campaign.days,
    });
  } catch (error: any) {
    console.error('[Campaign API Error]:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.issues?.[0]?.message || 'Data input tidak valid.' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: error?.message || 'Gagal menghasilkan kampanye konten.' },
      { status: 500 }
    );
  }
}
