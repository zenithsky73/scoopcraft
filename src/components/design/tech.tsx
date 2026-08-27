import type { RenderData } from '@/server/design/types';
import { layoutFor, fitHeadline } from '@/server/design/layout';
import { tokensFor } from '@/server/design/tokens';
import { clampLines, formatMeta } from '@/components/design/canvas';
import { PointSlide, OutroSlide, SlideFooter, SlideImage } from '@/components/design/slides';

/**
 * Gaya Tech HUD: Estetika futuristik / cyberpunk / HackerNews / AI Digest.
 * Monospace typography, aksen neon emerald & cyan, terminal tags, dan grid garis futuristik.
 */
export function TechTemplate(data: RenderData) {
  const t = tokensFor('TECH');

  if (data.slide.type === 'POINT') return <PointSlide data={data} t={t} />;
  if (data.slide.type === 'OUTRO') return <OutroSlide data={data} t={t} />;

  const l = layoutFor('TECH', data.format, 'COVER');
  const headlineSize = fitHeadline(data.slide.title, l.headline);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: t.bg,
        color: t.fg,
        fontFamily: t.fontFamily ?? "'JetBrains Mono', 'Fira Code', monospace",
      }}
    >
      <SlideImage data={data} t={t} mode="full" />

      {/* Cyberpunk Grid Overlay & HUD Corners */}
      <div
        style={{
          position: 'absolute',
          top: 30,
          left: 30,
          width: 36,
          height: 36,
          borderTop: `3px solid ${t.accent}`,
          borderLeft: `3px solid ${t.accent}`,
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 30,
          right: 30,
          width: 36,
          height: 36,
          borderTop: `3px solid ${t.accent}`,
          borderRight: `3px solid ${t.accent}`,
          pointerEvents: 'none',
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
        {/* Terminal Command Prompt Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: l.gap }}>
          <div
            style={{
              padding: '6px 12px',
              border: `1px solid ${t.accent}`,
              background: 'rgba(16, 185, 129, 0.15)',
              color: t.accent,
              fontSize: 16,
              fontWeight: 800,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              boxShadow: '0 0 15px rgba(16, 185, 129, 0.3)',
            }}
          >
            {t.badgeText ?? 'SYS://FEED'}
          </div>
          <span style={{ fontSize: 15, color: t.muted, letterSpacing: '0.05em' }}>
            [SRC: {data.source?.toUpperCase() ?? 'TECH_DISPATCH'}]
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
            textShadow: '0 0 20px rgba(0,0,0,0.8), 0 0 35px rgba(16,185,129,0.4)',
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
              textShadow: '0 2px 10px rgba(0,0,0,0.8)',
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
              &gt; {formatMeta(data.source, data.publishedAt)}
            </span>
            {l.cta && data.cta && data.slide.total === 1 && (
              <span style={{ fontSize: l.cta.size, color: t.accent, fontWeight: 700, whiteSpace: 'nowrap' }}>
                EXECUTE {data.cta} _
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
