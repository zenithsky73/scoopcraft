import { NextResponse } from 'next/server';
import { DesignStyle, type Prisma } from '@prisma/client';
import { getViewer } from '@/server/viewer';
import { db } from '@/server/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const PAGE_SIZE = 24;

function decodeHtmlEntities(str: string | null): string | null {
  if (!str) return null;
  return str
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ');
}

function extractThumbnail(run: any) {
  if (run.generatedContent?.assets?.[0]?.imageUrl) {
    return {
      imageUrl: run.generatedContent.assets[0].imageUrl,
      format: run.generatedContent.assets[0].format,
    };
  }
  if (run.generatedContent?.visualUrl) {
    return {
      imageUrl: run.generatedContent.visualUrl,
      format: run.requestedFormats?.[0] || 'FEED_PORTRAIT',
    };
  }
  if (run.article?.imageUrl) {
    return {
      imageUrl: run.article.imageUrl,
      format: run.requestedFormats?.[0] || 'FEED_PORTRAIT',
    };
  }
  const rawSlides = run.generatedContent?.slides;
  const slideList = Array.isArray(rawSlides?.slides)
    ? rawSlides.slides
    : Array.isArray(rawSlides)
    ? rawSlides
    : [];

  if (slideList[0]?.imageUrl) {
    return {
      imageUrl: slideList[0].imageUrl,
      format: run.requestedFormats?.[0] || 'FEED_PORTRAIT',
    };
  }
  return null;
}

export async function GET(req: Request) {
  const viewer = await getViewer();
  if (!viewer) {
    return NextResponse.json({ error: 'Silakan masuk terlebih dahulu.' }, { status: 401 });
  }

  const url = new URL(req.url);
  const cursor = url.searchParams.get('cursor');
  const styleParam = url.searchParams.get('style');
  const since = url.searchParams.get('since');
  const search = url.searchParams.get('q')?.trim();

  const where: Prisma.GenerationRunWhereInput = { userId: viewer.user.id };

  if (styleParam && styleParam in DesignStyle) {
    where.requestedStyles = { has: styleParam as DesignStyle };
  }

  if (since) {
    const days = Number(since);
    if (Number.isFinite(days) && days > 0) {
      where.createdAt = { gte: new Date(Date.now() - days * 86_400_000) };
    }
  }

  if (search) {
    where.OR = [
      { sourceUrl: { contains: search, mode: 'insensitive' } },
      { article: { title: { contains: search, mode: 'insensitive' } } },
      { generatedContent: { headline: { contains: search, mode: 'insensitive' } } },
    ];
  }

  const runs = await db.generationRun.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: PAGE_SIZE + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    select: {
      id: true,
      status: true,
      createdAt: true,
      sourceUrl: true,
      requestedStyles: true,
      requestedFormats: true,
      requestedSlides: true,
      stepsDone: true,
      stepsTotal: true,
      article: { select: { title: true, source: true, imageUrl: true } },
      generatedContent: {
        select: {
          id: true,
          headline: true,
          visualUrl: true,
          slides: true,
          _count: { select: { assets: true } },
          assets: {
            where: { slideIndex: 0, status: 'READY' },
            take: 1,
            select: { imageUrl: true, width: true, height: true, format: true },
          },
        },
      },
    },
  });

  const hasMore = runs.length > PAGE_SIZE;
  const page = hasMore ? runs.slice(0, PAGE_SIZE) : runs;

  return NextResponse.json({
    runs: page.map((run) => {
      const rawTitle = run.article?.title ?? run.generatedContent?.headline ?? null;
      return {
        id: run.id,
        status: run.status,
        createdAt: run.createdAt,
        sourceUrl: run.sourceUrl,
        styles: run.requestedStyles,
        formats: run.requestedFormats,
        slides: run.requestedSlides || 5,
        progress: { done: run.stepsDone, total: run.stepsTotal },
        title: decodeHtmlEntities(rawTitle),
        source: run.article?.source ?? null,
        assetCount: run.generatedContent?._count.assets ?? 0,
        thumbnail: extractThumbnail(run),
      };
    }),
    nextCursor: hasMore ? page[page.length - 1].id : null,
  });
}
