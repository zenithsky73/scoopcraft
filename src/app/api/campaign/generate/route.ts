import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getViewer } from '@/server/viewer';
import { db } from '@/server/db';
import { generateCampaignPlan } from '@/server/ai/campaign-generator';
import type { SocialPlatform, OutputFormat, DesignStyle } from '@prisma/client';

export const runtime = 'nodejs';
export const maxDuration = 60; // Allow up to 60s for 30-day generation

const campaignRequestSchema = z.object({
  topic: z.string().min(3, 'Topik campaign minimal 3 karakter'),
  durationDays: z.number().int().min(7).max(30).default(30),
  startDate: z.string().optional(),
  preferredTime: z.string().default('09:00'),
  platform: z.enum(['INSTAGRAM', 'LINKEDIN', 'FACEBOOK']).default('INSTAGRAM'),
  style: z.string().optional(),
  autoCommit: z.boolean().default(true),
});

export async function POST(req: Request) {
  const viewer = await getViewer();
  if (!viewer?.user) {
    return NextResponse.json({ error: 'Silakan login terlebih dahulu.' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const validated = campaignRequestSchema.parse(body);

    // 1. Generate rencana 30 hari via AI
    const campaign = await generateCampaignPlan({
      topic: validated.topic,
      durationDays: validated.durationDays,
      startDate: validated.startDate,
      preferredTime: validated.preferredTime,
      platform: validated.platform,
      style: validated.style as DesignStyle,
    });

    let scheduledPosts: any[] = [];

    // 2. Jika autoCommit = true, langsung kunci dan jadwalkan semua ke database
    if (validated.autoCommit && campaign.days.length > 0) {
      // Cari atau buat akun sosial untuk platform tersebut
      let socialAccount = await db.socialAccount.findFirst({
        where: {
          userId: viewer.user.id,
          platform: validated.platform as SocialPlatform,
          isConnected: true,
        },
      });

      if (!socialAccount) {
        socialAccount = await db.socialAccount.create({
          data: {
            userId: viewer.user.id,
            platform: validated.platform as SocialPlatform,
            accountName: `${viewer.user.name || 'Newsly User'} (${validated.platform})`,
            accountHandle: `@${(viewer.user.name || 'newsly').toLowerCase().replace(/\s+/g, '')}`,
            accessToken: 'demo_token',
            isConnected: true,
          },
        });
      }

      // Simpan setiap hari ke ScheduledPost
      for (const dayPost of campaign.days) {
        const scheduledDateTime = new Date(`${dayPost.date}T${dayPost.time}:00`);

        // Placeholder URL slide carousel
        const slideUrls = Array.from({ length: dayPost.slides.length || 4 }, (_, i) =>
          `https://newsly.ai/placeholder/${dayPost.category.toLowerCase()}-${i + 1}.png`
        );

        const created = await db.scheduledPost.create({
          data: {
            userId: viewer.user.id,
            socialAccountId: socialAccount.id,
            platform: validated.platform as SocialPlatform,
            status: 'PENDING',
            scheduledAt: scheduledDateTime,
            caption: dayPost.caption,
            hashtags: dayPost.hashtags,
            mediaUrls: slideUrls,
            format: 'FEED_PORTRAIT' as OutputFormat,
            style: (validated.style as DesignStyle) || 'CULINARY',
            isSimulated: true,
          },
        });

        scheduledPosts.push(created);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Berhasil menghasilkan kampanye konten ${campaign.days.length} hari!`,
      topic: campaign.topic,
      count: campaign.days.length,
      days: campaign.days,
      scheduledPosts,
    });
  } catch (error: any) {
    console.error('[Campaign API Error]:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues?.[0]?.message || 'Data input tidak valid.' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error?.message || 'Gagal menghasilkan kampanye konten.' },
      { status: 500 }
    );
  }
}
