import { NextResponse } from 'next/server';
import { DesignStyle, type Prisma } from '@prisma/client';
import { getViewer } from '@/server/viewer';
import { db } from '@/server/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const PAGE_SIZE = 24;

/**
 * Daftar riwayat untuk grid di /content. Hanya mengirim satu aset cover per
 * run sebagai thumbnail — memuat seluruh slide untuk 24 kartu sekaligus
 * membuat respons membengkak tanpa dipakai.
 */
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
      article: { select: { title: true, source: true } },
      generatedContent: {
        select: {
          id: true,
          headline: true,
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
    runs: page.map((run) => ({
      id: run.id,
      status: run.status,
      createdAt: run.createdAt,
      sourceUrl: run.sourceUrl,
      styles: run.requestedStyles,
      formats: run.requestedFormats,
      slides: run.requestedSlides,
      progress: { done: run.stepsDone, total: run.stepsTotal },
      title: run.article?.title ?? run.generatedContent?.headline ?? null,
      source: run.article?.source ?? null,
      assetCount: run.generatedContent?._count.assets ?? 0,
      thumbnail: run.generatedContent?.assets[0] ?? null,
    })),
    nextCursor: hasMore ? page[page.length - 1].id : null,
  });
}
