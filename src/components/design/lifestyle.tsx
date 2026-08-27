import type { RenderData } from '@/server/design/types';
import { layoutFor, fitHeadline } from '@/server/design/layout';
import { tokensFor } from '@/server/design/tokens';
import { clampLines, formatMeta } from '@/components/design/canvas';
import { PointSlide, OutroSlide, SlideFooter, SlideImage } from '@/components/design/slides';

/**
 * Gaya Lifestyle Pastel: Hangat, lembut, dan fotogenik.
 * Latar pastel rose/peach, sudut melengkung halus, aksen rose gold, dan estetika majalah gaya hidup.
 */
export function LifestyleTemplate(data: RenderData) {
  const t = tokensFor('LIFESTYLE');

  if (data.slide.type === 'POINT') return <PointSlide data={data} t={t} />;
  if (data.slide.type === 'OUTRO') return <OutroSlide data={data} t={t} />;

  const l = layoutFor('LIFESTYLE', data.format, 'COVER');
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
        {/* Soft Pastel Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: l.gap }}>
          <div
            style={{
              padding: '6px 14px',
              borderRadius: 20,
              background: t.accent,
              color: '#FFFFFF',
              fontSize: 15,
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            {t.badgeText ?? 'LIFESTYLE'}
          </div>
          <span style={{ fontSize: 16, color: t.muted, fontWeight: 600 }}>
            {data.source ?? 'SCOOPCRAFT'}
          </span>
        </div>

        <h1
          style={{
            margin: 0,
            fontSize: headlineSize,
            lineHeight: l.headline.lineHeight,
            fontWeight: t.headlineWeight,
            letterSpacing: t.headlineTracking,
            color: '#4C0519',
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
              color: '#881337',
              fontWeight: 400,
              ...clampLines(l.feedCopy.maxLines),
            }}
          >
            {data.slide.body}
          </p>
        )}

        <div style={{ marginTop: 'auto', paddingTop: l.gap }}>
          <div style={{ height: 1, background: t.rule, marginBottom: Math.round(l.gap * 0.7) }} />
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 24 }}>
            <span style={{ fontSize: l.meta.size, color: t.muted, fontWeight: 500 }}>
              {formatMeta(data.source, data.publishedAt)}
            </span>
            {l.cta && data.cta && data.slide.total === 1 && (
              <span style={{ fontSize: l.cta.size, color: t.accent, fontWeight: 700, whiteSpace: 'nowrap' }}>
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
