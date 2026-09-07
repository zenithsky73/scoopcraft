import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getViewer } from '@/server/viewer';
import { db } from '@/server/db';
import { ContentCalendar } from '@/components/schedule/content-calendar';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'Kalender & Auto-Schedule | Newsly AI',
  description: 'Jadwalkan dan publikasikan postingan carousel media sosial otomatis tepat waktu.',
};

export default async function CalendarPage() {
  const viewer = await getViewer();
  if (!viewer?.user) {
    redirect('/login');
  }

  const posts = await db.scheduledPost.findMany({
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
  });

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

  return (
    <div className="mx-auto max-w-6xl">
      <ContentCalendar initialPosts={serializedPosts} />
    </div>
  );
}
