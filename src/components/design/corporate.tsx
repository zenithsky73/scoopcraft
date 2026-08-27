import type { RenderData } from '@/server/design/types';
import { layoutFor, fitHeadline } from '@/server/design/layout';
import { tokensFor } from '@/server/design/tokens';
import { clampLines, formatMeta } from '@/components/design/canvas';
import { PointSlide, OutroSlide, SlideFooter, SlideImage } from '@/components/design/slides';

/**
 * Gaya Corporate Pro: Standar publikasi bisnis & konsultan elit (McKinsey / HBR / BCG).
 * Deep navy background, bar biru royal tegas, kartu insight, dan tipografi otoritatif.
 */
export function CorporateTemplate(data: RenderData) {
  const t = tokensFor('CORPORATE');

  if (data.slide.type === 'POINT') return <PointSlide data={data} t={t} />;
  if (data.slide.type === 'OUTRO') return <OutroSlide data={data} t={t} />;

  const l = layoutFor('CORPORATE', data.format, 'COVER');
  const headlineSize = fitHeadline(data.slide.title, l.headline);

  return (
    <div style={{ position: 'absolute', inset: 0, background: t.bg, color: t.fg }}>
      <SlideImage data={data} t={t} mode="full" />

      {/* Corporate Left Accent Bar */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          width: 10,
          background: t.accent,
        }}
      />

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
        {/* Executive Category Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: l.gap }}>
          <div
            style={{
              padding: '6px 14px',
              borderRadius: 4,
              background: t.accent,
              color: '#FFFFFF',
              fontSize: 16,
              fontWeight: 800,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            {t.badgeText ?? 'EXECUTIVE SUMMARY'}
          </div>
          <span style={{ fontSize: 16, color: '#93C5FD', fontWeight: 600 }}>
            {data.source?.toUpperCase() ?? 'ANALYSIS'}
          </span>
        </div>

        <h1
          style={{
            margin: 0,
            fontSize: headlineSize,
            lineHeight: l.headline.lineHeight,
            fontWeight: t.headlineWeight,
            letterSpacing: t.headlineTracking,
            color: '#FFFFFF',
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
              color: '#E2E8F0',
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
            <span style={{ fontSize: l.meta.size, color: '#94A3B8', fontWeight: 500 }}>
              {formatMeta(data.source, data.publishedAt)}
            </span>
            {l.cta && data.cta && data.slide.total === 1 && (
              <span style={{ fontSize: l.cta.size, color: '#60A5FA', fontWeight: 700, whiteSpace: 'nowrap' }}>
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
