import type { RenderData } from '@/server/design/types';
import { layoutFor, fitHeadline } from '@/server/design/layout';
import { tokensFor } from '@/server/design/tokens';
import { clampLines } from '@/components/design/canvas';
import { PointSlide, OutroSlide, SlideFooter, SlideImage } from '@/components/design/slides';

/**
 * Gaya Modern Cafe & Brand:
 * Estetika cafe kekinian (ala Fore Coffee), resto kontemporer & retail modern.
 * Gambar band bersih, badge menu/promo cerah, dan layout yang sangat elegan.
 */
export function ModernTemplate(data: RenderData) {
  const t = tokensFor('MODERN');

  if (data.slide.type === 'POINT') return <PointSlide data={data} t={t} />;
  if (data.slide.type === 'OUTRO') return <OutroSlide data={data} t={t} />;

  const l = layoutFor('MODERN', data.format, 'COVER');
  const image = l.image.mode === 'band' ? l.image : null;
  const headlineSize = fitHeadline(data.slide.title, l.headline);

  return (
    <div style={{ position: 'absolute', inset: 0, background: t.bg, color: t.fg }}>
      {image && <SlideImage data={data} t={t} mode="band" />}

      <div
        style={{
          position: 'absolute',
          top: l.content.top,
          left: l.content.left,
          right: l.content.right,
          bottom: l.content.bottom,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Modern Pill Badge & Brand Handle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: l.gap }}>
          <div
            style={{
              padding: '6px 14px',
              borderRadius: 8,
              background: t.accent,
              color: t.accentFg,
              fontSize: 15,
              fontWeight: 900,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              boxShadow: '0 2px 10px rgba(14,165,233,0.3)',
            }}
          >
            {t.badgeText ?? '✨ MENU SPESIAL'}
          </div>
          <span style={{ fontSize: 16, color: '#38BDF8', fontWeight: 700 }}>
            {data.handle || '@brandbisnis'}
          </span>
        </div>

        <h1
          style={{
            margin: 0,
            fontSize: headlineSize,
            lineHeight: l.headline.lineHeight,
            fontWeight: t.headlineWeight,
            letterSpacing: t.headlineTracking,
            ...clampLines(l.headline.maxLines),
          }}
        >
          {data.slide.title}
        </h1>

        {l.feedCopy && data.slide.body && (
          <p
            style={{
              margin: `${l.gap}px 0 0`,
              fontSize: l.feedCopy.size,
              lineHeight: l.feedCopy.lineHeight,
              color: '#CBD5E1',
              fontWeight: 400,
              ...clampLines(l.feedCopy.maxLines),
            }}
          >
            {data.slide.body}
          </p>
        )}

        <div style={{ marginTop: 'auto', paddingTop: l.gap }}>
          <div style={{ height: 1, background: t.rule, marginBottom: Math.round(l.gap * 0.7) }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>
            <span style={{ fontSize: l.meta.size, color: t.muted, fontWeight: 600 }}>
              {data.displayName || 'Tersedia Dine-In & Delivery'}
            </span>
            {l.cta && data.cta && data.slide.total === 1 && (
              <span style={{ fontSize: l.cta.size, color: t.accent, fontWeight: 800, whiteSpace: 'nowrap' }}>
                {data.cta} →
              </span>
            )}
          </div>
          {data.slide.total > 1 && (
            <div style={{ marginTop: Math.round(l.gap * 0.6) }}>
              <SlideFooter data={data} t={t} size={l.meta.size} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
