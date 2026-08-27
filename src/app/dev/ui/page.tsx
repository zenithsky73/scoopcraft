import { notFound } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { ResultView } from '@/components/result/result-view';
import type { RunStatusResponse } from '@/lib/run-status';
import type { QuotaState } from '@/server/billing/quota';
import { FORMAT_SPECS } from '@/config/formats';

export const dynamic = 'force-dynamic';

/**
 * Halaman pratinjau UI dengan data contoh — tanpa database, tanpa login.
 *
 * Ada karena panel hasil adalah bagian paling rumit di aplikasi ini
 * (dua kolom, tab mobile, carousel, editor teks) dan menyetelnya lewat
 * pipeline sungguhan berarti menunggu scrape + AI + render tiap kali.
 * Diblokir di produksi.
 */
const QUOTA: QuotaState = {
  allowed: true,
  reason: null,
  isTrial: true,
  isOwner: false,
  isGuest: false,
  plan: 'TRIAL',
  resetsAt: null,
  daysLeft: 11,
  used: 4,
  limit: 10,
  remaining: 6,
};

const SLIDE_COPY = [
  { title: 'Suku bunga tetap 5,75%', body: 'Bank Indonesia menahan BI-Rate untuk bulan keempat berturut-turut sejak Mei 2026.' },
  { title: 'Alasannya: rupiah', body: 'Bank sentral menilai pelonggaran terlalu cepat berisiko menekan nilai tukar di tengah tekanan global.' },
  { title: 'Dampak ke kredit', body: 'Bunga kredit perbankan diperkirakan bertahan, sehingga cicilan KPR dan kredit usaha belum turun.' },
];

const SLIDE_TYPES = ['COVER', 'POINT', 'POINT', 'POINT', 'OUTRO'] as const;

function assets() {
  return (['FEED_SQUARE', 'STORY'] as const).flatMap((format) =>
    SLIDE_TYPES.map((slideType, index) => {
      const spec = FORMAT_SPECS[format];
      const file = format === 'FEED_SQUARE' ? 'breaking_news-feed_square' : 'breaking_news-story';
      return {
        id: `${format}-${index}`,
        style: 'BREAKING_NEWS' as const,
        format,
        slideIndex: index,
        slideType,
        status: 'READY' as const,
        imageUrl: `/generated/demo/${file}-s${index + 1}.png`,
        width: spec.width,
        height: spec.height,
        error: null,
      };
    }),
  );
}

const FIXTURE: RunStatusResponse = {
  id: 'demo-run',
  status: 'DONE',
  stepsDone: 14,
  stepsTotal: 14,
  error: null,
  sourceUrl: 'https://www.antaranews.com/berita/5712712/contoh-artikel',
  requestedStyles: ['BREAKING_NEWS'],
  requestedFormats: ['FEED_SQUARE', 'STORY'],
  requestedSlides: 5,
  steps: [
    { type: 'SCRAPE', label: 'Ambil artikel', status: 'DONE', done: 1, total: 1, error: null, durationMs: 1689 },
    { type: 'ANALYZE', label: 'Analisis', status: 'DONE', done: 1, total: 1, error: null, durationMs: 4820 },
    { type: 'GENERATE_CONTENT', label: 'Tulis konten', status: 'DONE', done: 1, total: 1, error: null, durationMs: 6110 },
    { type: 'GENERATE_IMAGE', label: 'Siapkan visual', status: 'DONE', done: 1, total: 1, error: null, durationMs: 2400 },
    { type: 'RENDER_DESIGN', label: 'Render desain', status: 'DONE', done: 10, total: 10, error: null, durationMs: 14200 },
  ],
  article: {
    id: 'demo-article',
    title: 'BI tahan suku bunga acuan di level 5,75 persen',
    source: 'ANTARA',
    wordCount: 386,
  },
  content: {
    id: 'demo-content',
    headline: 'BI tahan suku bunga acuan di level 5,75 persen',
    feedCopy:
      'Keputusan diambil dalam Rapat Dewan Gubernur untuk menjaga stabilitas nilai tukar rupiah di tengah tekanan global.',
    caption:
      'Bank Indonesia kembali menahan suku bunga acuan di 5,75 persen pada Rapat Dewan Gubernur bulan ini.\n\nKeputusan itu diambil untuk menjaga stabilitas nilai tukar rupiah di tengah tekanan pasar keuangan global. Bagi masyarakat, artinya bunga kredit perbankan diperkirakan belum turun dalam waktu dekat.',
    hashtags: ['bankindonesia', 'sukubunga', 'ekonomi', 'rupiah', 'birate', 'beritaekonomi', 'infoterkini'],
    cta: 'Simak selengkapnya',
    angle: 'Apa artinya buat masyarakat',
    slides: SLIDE_COPY,
    imageSource: 'ARTICLE',
    visualUrl: '/generated/demo/breaking_news-feed_square-s1.png',
    assets: assets(),
  },
};

export default function DevUiPage() {
  if (process.env.NODE_ENV === 'production') notFound();

  return (
    <AppShell title="Pratinjau UI" email="demo@scoopcraft.test" quota={QUOTA}>
      <ResultView initial={FIXTURE} />
    </AppShell>
  );
}
