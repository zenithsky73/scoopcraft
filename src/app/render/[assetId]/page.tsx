import { notFound } from 'next/navigation';
import { db } from '@/server/db';
import { DesignCanvas } from '@/components/design/canvas';
import { verifyRenderToken } from '@/server/design/token';
import { buildDeck } from '@/server/design/deck';
import { slidesFromJson } from '@/server/design/slides-json';
import { APP } from '@/config/app';

export const dynamic = 'force-dynamic';

/**
 * Kanvas untuk satu DesignAsset. Dibuka oleh Chromium headless yang tidak
 * punya sesi, jadi aksesnya dijaga token HMAC berumur pendek — bukan publik.
 */
export default async function RenderAssetPage({
  params,
  searchParams,
}: {
  params: { assetId: string };
  searchParams: { token?: string };
}) {
  if (!verifyRenderToken(params.assetId, searchParams.token)) notFound();

  const asset = await db.designAsset.findUnique({
    where: { id: params.assetId },
    include: {
      generatedContent: {
        include: {
          article: { include: { user: { select: { brandKit: true } } } },
          visuals: true,
        },
      },
    },
  });

  if (!asset) notFound();

  const content = asset.generatedContent;
  const article = content.article;
  const brand = article.user.brandKit;

  // Deck disusun ulang dari naskah yang sama, lalu diambil slide yang
  // sesuai indeks aset ini — supaya urutan konsisten antar-format.
  const deck = buildDeck(
    {
      headline: content.headline,
      feedCopy: content.feedCopy,
      cta: content.cta,
      slides: slidesFromJson(content.slides),
    },
    // Jumlah slide diambil dari aset yang benar-benar dibuat.
    await db.designAsset.count({
      where: { generatedContentId: content.id, style: asset.style, format: asset.format },
    }),
  );

  const slide = deck[asset.slideIndex] ?? deck[0];

  // Tiap slide punya gambarnya sendiri; kalau belum ada, template menggambar
  // latar cadangan — bukan memakai gambar slide lain.
  const visual = content.visuals.find((item) => item.slideIndex === asset.slideIndex);

  return (
    <DesignCanvas
      style={asset.style}
      format={asset.format}
      width={asset.width}
      height={asset.height}
      slide={{
        type: asset.slideType,
        index: asset.slideIndex,
        total: deck.length,
        title: slide.title,
        body: slide.body,
      }}
      cta={content.cta}
      source={article.source}
      publishedAt={article.publishedAt?.toISOString() ?? null}
      imageUrl={visual?.imageUrl ?? null}
      handle={brand?.handle || APP.handle}
      displayName={brand?.displayName ?? null}
    />
  );
}
