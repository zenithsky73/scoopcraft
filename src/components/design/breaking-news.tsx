import type { RenderData } from '@/server/design/types';
import { layoutFor, fitHeadline } from '@/server/design/layout';
import { tokensFor } from '@/server/design/tokens';
import { clampLines, formatMeta } from '@/components/design/canvas';
import { PointSlide, OutroSlide, SlideImage } from '@/components/design/slides';

/**
 * Gaya Breaking News: foto penuh bingkai, scrim gelap agar teks terbaca,
 * banner merah, tipografi berat yang menempel ke bawah.
 */
export function BreakingNewsTemplate(data: RenderData) {
  const t = tokensFor('BREAKING_NEWS');

  if (data.slide.type === 'POINT') return <PointSlide data={data} t={t} />;
  if (data.slide.type === 'OUTRO') return <OutroSlide data={data} t={t} />;

  const l = layoutFor('BREAKING_NEWS', data.format, 'COVER');
  const headlineSize = fitHeadline(data.slide.title, l.headline);

  return (
    <div style={{ position: 'absolute', inset: 0, background: t.bg, color: t.fg }}>
      {/* Scrim ikut digambar SlideImage — tanpa itu teks putih hilang di foto terang. */}
      <SlideImage data={data} t={t} mode="full" />

      {l.badge && t.badgeText && (
        <div
          style={{
            position: 'absolute',
            top: l.badge.top,
            left: l.badge.left,
            background: t.accent,
            color: t.accentFg,
            fontSize: l.badge.size,
            fontWeight: 800,
            letterSpacing: '0.14em',
            padding: `${Math.round(l.badge.size * 0.42)}px ${Math.round(l.badge.size * 0.8)}px`,
            borderRadius: 4,
          }}
        >
          {t.badgeText}
        </div>
      )}

      <div
        style={{
          position: 'absolute',
          top: l.content.top,
          left: l.content.left,
          right: l.content.right,
          bottom: l.content.bottom,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: headlineSize,
            lineHeight: l.headline.lineHeight,
            fontWeight: t.headlineWeight,
            letterSpacing: t.headlineTracking,
            textShadow: '0 2px 24px rgba(0,0,0,.35)',
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
              color: 'rgba(255,255,255,.82)',
              ...clampLines(l.feedCopy.maxLines),
            }}
          >
            {data.slide.body}
          </p>
        )}

        <div style={{ marginTop: Math.round(l.gap * 1.6) }}>
          <div style={{ height: 1, background: t.rule, marginBottom: Math.round(l.gap * 0.8) }} />
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 24 }}>
            <span style={{ fontSize: l.meta.size, color: t.muted, fontWeight: 500 }}>
              {formatMeta(data.source, data.publishedAt)}
            </span>
            <span style={{ fontSize: l.meta.size, color: t.muted, fontWeight: 600 }}>
              {data.handle}
              {data.slide.total > 1 && `  ·  ${data.slide.index + 1}/${data.slide.total}`}
            </span>
          </div>
          {l.cta && data.cta && data.slide.total === 1 && (
            <div style={{ marginTop: Math.round(l.gap * 0.8), fontSize: l.cta.size, color: t.fg, fontWeight: 700 }}>
              {data.cta} →
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
