import type { RenderData } from '@/server/design/types';
import { layoutFor } from '@/server/design/layout';
import { MinimalTemplate } from '@/components/design/minimal';
import { BreakingNewsTemplate } from '@/components/design/breaking-news';
import { BoldTemplate } from '@/components/design/bold';
import { EditorialTemplate } from '@/components/design/editorial';
import { ModernTemplate } from '@/components/design/modern';
import { TechTemplate } from '@/components/design/tech';
import { FinanceTemplate } from '@/components/design/finance';
import { CorporateTemplate } from '@/components/design/corporate';
import { LifestyleTemplate } from '@/components/design/lifestyle';

const TEMPLATES: Record<string, React.ComponentType<RenderData>> = {
  MINIMAL: MinimalTemplate,
  BREAKING_NEWS: BreakingNewsTemplate,
  BOLD: BoldTemplate,
  EDITORIAL: EditorialTemplate,
  MODERN: ModernTemplate,
  TECH: TechTemplate,
  FINANCE: FinanceTemplate,
  CORPORATE: CorporateTemplate,
  LIFESTYLE: LifestyleTemplate,
};

/**
 * Satu titik masuk untuk semua gaya. Komponen yang sama dipakai dua kali:
 * di-screenshot Playwright untuk menghasilkan PNG, dan ditampilkan di iframe
 * ter-skala sebagai pratinjau di dashboard — jadi pratinjau selalu WYSIWYG.
 */
export function DesignCanvas(data: RenderData) {
  const Template = TEMPLATES[data.style] ?? MinimalTemplate;

  return (
    <div
      id="canvas"
      style={{
        width: data.width,
        height: data.height,
        position: 'relative',
        overflow: 'hidden',
        fontFamily: "'Inter', system-ui, sans-serif",
        fontFeatureSettings: "'cv02','cv03','cv04','cv11'",
        WebkitFontSmoothing: 'antialiased',
      }}
    >
      <Template {...data} />
      {data.guides && <SafeGuides {...data} />}
    </div>
  );
}

/** Overlay pratinjau: menandai area yang bisa tertutup UI platform. */
function SafeGuides({ style, format, width, height }: RenderData) {
  const layout = layoutFor(style, format);
  if (!layout.safe.top && !layout.safe.bottom) return null;

  const band = (side: 'top' | 'bottom', size: number) => (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        [side]: 0,
        height: size,
        background: 'repeating-linear-gradient(45deg, rgba(239,68,68,.16) 0 12px, transparent 12px 24px)',
        borderTop: side === 'bottom' ? '2px dashed rgba(239,68,68,.7)' : undefined,
        borderBottom: side === 'top' ? '2px dashed rgba(239,68,68,.7)' : undefined,
        display: 'flex',
        alignItems: side === 'top' ? 'flex-end' : 'flex-start',
        justifyContent: 'center',
        color: 'rgb(239,68,68)',
        fontSize: 20,
        fontWeight: 600,
        padding: 10,
      }}
    >
      safe zone {size}px
    </div>
  );

  return (
    <>
      {layout.safe.top > 0 && band('top', layout.safe.top)}
      {layout.safe.bottom > 0 && band('bottom', layout.safe.bottom)}
      <span style={{ position: 'absolute', right: 16, top: 16, fontSize: 18, color: 'rgb(239,68,68)', fontWeight: 600 }}>
        {width}×{height}
      </span>
    </>
  );
}

/** Potong jumlah baris tanpa meluber — dipakai kedua template. */
export function clampLines(lines: number): React.CSSProperties {
  return {
    display: '-webkit-box',
    WebkitLineClamp: lines,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  } as React.CSSProperties;
}

export function formatMeta(source: string | null, publishedAt: string | null) {
  const date = publishedAt
    ? new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Jakarta' }).format(
        new Date(publishedAt),
      )
    : null;
  return [source, date].filter(Boolean).join(' · ');
}
