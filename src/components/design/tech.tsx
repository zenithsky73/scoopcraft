import type { RenderData } from '@/server/design/types';
import { layoutFor, fitHeadline } from '@/server/design/layout';
import { tokensFor } from '@/server/design/tokens';
import { clampLines } from '@/components/design/canvas';
import { PointSlide, OutroSlide, SlideFooter, SlideImage } from '@/components/design/slides';

/**
 * Gaya SaaS & Otomasi UMKM:
 * Khas aplikasi bisnis, software CRM/POS kasir, tools AI produktivitas, dan automasi digital.
 * Monospace typography, aksen neon cyan & emerald, corner tags, dan nuansa tech cerdas.
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

      {/* Cyberpunk HUD Corners */}
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
        {/* Terminal Badge & Brand Handle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: l.gap }}>
          <div
            style={{
              padding: '6px 12px',
              border: `1px solid ${t.accent}`,
              background: 'rgba(6, 182, 212, 0.2)',
              color: t.accent,
              fontSize: 15,
              fontWeight: 800,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              boxShadow: '0 0 15px rgba(6, 182, 212, 0.35)',
            }}
          >
            {t.badgeText ?? '⚡ AUTOMASI BISNIS'}
          </div>
          <span style={{ fontSize: 15, color: '#38BDF8', letterSpacing: '0.05em', fontWeight: 700 }}>
            {data.handle || '@saasbiz.id'}
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
            textShadow: '0 0 20px rgba(0,0,0,0.8), 0 0 35px rgba(6,182,212,0.4)',
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>
            <span style={{ fontSize: l.meta.size, color: t.muted, fontWeight: 600 }}>
              {data.displayName || 'Trial Gratis 14 Hari · Akses Penuh'}
            </span>
            {l.cta && data.cta && data.slide.total === 1 && (
              <span style={{ fontSize: l.cta.size, color: t.accent, fontWeight: 700, whiteSpace: 'nowrap' }}>
                {data.cta} ➔
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
