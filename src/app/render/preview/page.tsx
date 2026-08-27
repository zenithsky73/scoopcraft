import { DesignStyle, OutputFormat, SlideType } from '@prisma/client';
import { DesignCanvas } from '@/components/design/canvas';
import { buildDeck } from '@/server/design/deck';
import { FORMAT_SPECS } from '@/config/formats';
import { APP } from '@/config/app';

export const dynamic = 'force-dynamic';

/**
 * Kanvas dengan data contoh — untuk menyetel desain tanpa perlu database
 * atau menjalankan pipeline. Semua bidang bisa ditimpa lewat query.
 *
 *   /render/preview?style=BREAKING_NEWS&format=STORY&slides=5&slide=2&guides=1
 */
const FIXTURE = {
  headline: 'BI tahan suku bunga acuan di level 5,75 persen',
  feedCopy:
    'Keputusan diambil dalam Rapat Dewan Gubernur untuk menjaga stabilitas nilai tukar rupiah di tengah tekanan global.',
  cta: 'Simak selengkapnya',
  source: 'ANTARA',
  publishedAt: '2026-08-26T18:15:56.000Z',
  imageUrl: null as string | null,
  slides: [
    {
      title: 'Suku bunga tetap 5,75%',
      body: 'Bank Indonesia menahan BI-Rate untuk bulan keempat berturut-turut sejak Mei 2026.',
      visualPrompt: '',
    },
    {
      title: 'Alasannya: rupiah',
      body: 'Bank sentral menilai pelonggaran terlalu cepat berisiko menekan nilai tukar di tengah tekanan global.',
      visualPrompt: '',
    },
    {
      title: 'Dampak ke kredit',
      body: 'Bunga kredit perbankan diperkirakan bertahan, sehingga cicilan KPR dan kredit usaha belum turun.',
      visualPrompt: '',
    },
    {
      title: 'Apa yang ditunggu',
      body: 'Arah kebijakan berikutnya bergantung pada inflasi dan keputusan suku bunga bank sentral AS.',
      visualPrompt: '',
    },
  ],
};

function pick<T extends string>(value: string | undefined, allowed: readonly T[], fallback: T): T {
  return allowed.includes(value as T) ? (value as T) : fallback;
}

export default function RenderPreviewPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const get = (key: string) => {
    const value = searchParams[key];
    return Array.isArray(value) ? value[0] : value;
  };

  const style = pick(get('style'), Object.values(DesignStyle), 'MINIMAL');
  const format = pick(get('format'), Object.values(OutputFormat), 'FEED_SQUARE');
  const spec = FORMAT_SPECS[format];

  const deck = buildDeck(
    {
      headline: get('headline') ?? FIXTURE.headline,
      feedCopy: get('feedCopy') ?? FIXTURE.feedCopy,
      cta: get('cta') ?? FIXTURE.cta,
      slides: FIXTURE.slides,
    },
    Number(get('slides') ?? 1),
  );

  const index = Math.min(Math.max(0, Number(get('slide') ?? 0)), deck.length - 1);
  const slide = deck[index];

  // ?images=a.png,b.png,... memberi gambar berbeda per slide, meniru hasil
  // sungguhan di mana tiap slide punya visualnya sendiri.
  const perSlide = get('images')?.split(',').filter(Boolean);
  const imageUrl = perSlide?.length ? (perSlide[index] ?? null) : (get('image') ?? FIXTURE.imageUrl);

  return (
    <DesignCanvas
      style={style}
      format={format}
      width={spec.width}
      height={spec.height}
      slide={{
        type: slide.type as SlideType,
        index,
        total: deck.length,
        title: slide.title,
        body: slide.body,
      }}
      cta={get('cta') ?? FIXTURE.cta}
      source={get('source') ?? FIXTURE.source}
      publishedAt={get('publishedAt') ?? FIXTURE.publishedAt}
      imageUrl={imageUrl}
      handle={get('handle') ?? APP.handle}
      displayName={get('displayName') ?? null}
      guides={get('guides') === '1'}
    />
  );
}
