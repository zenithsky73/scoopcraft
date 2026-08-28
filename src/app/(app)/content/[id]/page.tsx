import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getViewer } from '@/server/viewer';
import { db } from '@/server/db';
import { CarouselStudio } from '@/components/studio/carousel-studio';
import { ContentClientLoader } from '@/components/studio/content-client-loader';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Studio Konten & Carousel' };

export default async function ContentDetailPage({ params }: { params: { id: string } }) {
  const viewer = await getViewer();
  if (!viewer) redirect('/login');

  const user = await db.user.findUnique({
    where: { id: viewer.user.id },
    select: { role: true, plan: true },
  });
  const isProUser = user?.role === 'OWNER' || user?.plan === 'PRO' || user?.plan === 'BUSINESS';

  // ─── 1. CARI BERDASARKAN ID GENERATED CONTENT TERLEBIH DAHULU ───
  let content = await db.generatedContent.findUnique({
    where: { id: params.id },
    include: {
      article: true,
      run: true,
    },
  });

  // ─── 2. JIKA BUKAN CONTENT ID, CARI BERDASARKAN RUN ID ───
  if (!content) {
    const run = await db.generationRun.findFirst({
      where: { id: params.id },
      include: {
        generatedContent: {
          include: { article: true },
        },
        article: true,
      },
    });

    if (run?.generatedContent) {
      content = {
        ...run.generatedContent,
        article: run.article || run.generatedContent.article,
        run,
      } as any;
    }
  }

  // ─── 3. JIKA DITEMUKAN DI DATABASE, RENDER LANGSUNG KE CAROUSEL STUDIO ───
  if (content) {
    const rawSlides = content.slides as any;
    const slideList = Array.isArray(rawSlides?.slides)
      ? rawSlides.slides
      : Array.isArray(rawSlides)
      ? rawSlides
      : [];

    const requestedStyle = content.run?.requestedStyles?.[0] || 'BREAKING_NEWS';
    const requestedFormat = content.run?.requestedFormats?.[0] || 'FEED_PORTRAIT';

    return (
      <CarouselStudio
        initialContent={{
          headline: content.headline,
          caption: content.caption,
          hashtags: content.hashtags || [],
          cta: content.cta,
          angle: content.angle,
          slides: slideList,
        }}
        article={{
          title: content.article?.title || content.headline,
          source: content.article?.source || 'Newsly AI',
          url: content.article?.url,
          imageUrl: content.visualUrl || content.article?.imageUrl,
          author: content.article?.author || 'Redaksi',
        }}
        initialStyle={requestedStyle}
        initialFormat={requestedFormat}
        isProUser={isProUser}
      />
    );
  }

  // ─── 4. JIKA TIDAK DITEMUKAN DI DB, COBA LOAD DARI SESSION STORAGE CLIENT ───
  return <ContentClientLoader id={params.id} />;
}
