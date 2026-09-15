import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getViewer } from '@/server/viewer';
import { db } from '@/server/db';
import { ContentCalendar } from '@/components/schedule/content-calendar';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'Kalender & Auto-Schedule | InstaDeck PRO',
  description: 'Jadwalkan dan publikasikan postingan carousel media sosial otomatis tepat waktu.',
};

export default async function CalendarPage() {
  const viewer = await getViewer();
  if (!viewer?.user) {
    redirect('/login');
  }

  const [posts, socialAccounts, recentContents] = await Promise.all([
    db.scheduledPost.findMany({
      where: { userId: viewer.user.id },
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
    }),
    db.socialAccount.findMany({
      where: { userId: viewer.user.id },
      select: {
        id: true,
        accountName: true,
        accountHandle: true,
        avatarUrl: true,
        platform: true,
        isConnected: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
    db.generatedContent.findMany({
      where: {
        article: {
          userId: viewer.user.id,
        },
      },
      include: {
        assets: {
          orderBy: { slideIndex: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
  ]);

  const serializedPosts = posts.map((post) => ({
    id: post.id,
    platform: post.platform,
    status: post.status,
    scheduledAt: post.scheduledAt.toISOString(),
    publishedAt: post.publishedAt?.toISOString() || null,
    caption: post.caption,
    hashtags: post.hashtags,
    mediaUrls: post.mediaUrls,
    format: post.format,
    style: post.style,
    externalPostId: post.externalPostId,
    externalPostUrl: post.externalPostUrl,
    errorMessage: post.errorMessage,
    isSimulated: post.isSimulated,
    socialAccount: post.socialAccount,
    generatedContent: post.generatedContent,
  }));

  const serializedRecentContents = recentContents.map((gc) => {
    const cover = gc.assets?.find((a) => a.slideIndex === 0) || gc.assets?.[0];
    const assetUrls = (gc.assets || []).map((a) => a.imageUrl).filter(Boolean) as string[];
    const slidesCount = Array.isArray(gc.slides) ? (gc.slides as any[]).length : (assetUrls.length || 5);

    return {
      id: gc.id,
      headline: gc.headline,
      coverUrl: cover?.imageUrl || gc.visualUrl || null,
      mediaUrls: assetUrls.length > 0 ? assetUrls : (gc.visualUrl ? [gc.visualUrl] : []),
      format: (cover?.format || 'FEED_PORTRAIT') as string,
      style: cover?.style || null,
      totalSlides: slidesCount,
      hasRenderedAssets: assetUrls.length > 0,
    };
  });

  return (
    <div className="w-full">
      <ContentCalendar
        initialPosts={serializedPosts}
        socialAccounts={socialAccounts}
        recentContents={serializedRecentContents}
      />
    </div>
  );
}
