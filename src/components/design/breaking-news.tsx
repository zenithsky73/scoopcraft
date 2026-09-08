import type { RenderData } from '@/server/design/types';
import { layoutFor, fitHeadline } from '@/server/design/layout';
import { tokensFor } from '@/server/design/tokens';
import { clampLines } from '@/components/design/canvas';
import { PointSlide, OutroSlide, SlideImage } from '@/components/design/slides';

/**
 * Gaya Promo Kilat & Flash Sale:
 * Foto hero menggugah selera / produk penuh bingkai, badge diskon/promo merah membara,
 * tipografi tebal berwibawa, dan branding bisnis yang tegas.
 */
export function BreakingNewsTemplate(data: RenderData) {
  const t = tokensFor('BREAKING_NEWS');

  if (data.slide.type === 'POINT') return <PointSlide data={data} t={t} />;
  if (data.slide.type === 'OUTRO') return <OutroSlide data={data} t={t} />;

  const l = layoutFor('BREAKING_NEWS', data.format, 'COVER');
  const headlineSize = fitHeadline(data.slide.title, l.headline);

  return (
    <div style={{ position: 'absolute', inset: 0, background: t.bg, color: t.fg }}>
      {/* Scrim ikut digambar SlideImage — teks putih tetap kontras di atas foto */}
      <SlideImage data={data} t={t} mode="full" />

      {/* Promo Badge */}
      <div
        style={{
          position: 'absolute',
          top: l.badge?.top ?? 64,
          left: l.badge?.left ?? 64,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <div
          style={{
            background: t.accent,
            color: t.accentFg,
            fontSize: l.badge?.size ?? 22,
            fontWeight: 900,
            letterSpacing: '0.08em',
            padding: `${Math.round((l.badge?.size ?? 22) * 0.45)}px ${Math.round((l.badge?.size ?? 22) * 0.85)}px`,
            borderRadius: 8,
            boxShadow: '0 4px 20px rgba(239,68,68,.45)',
            textTransform: 'uppercase',
          }}
        >
          {t.badgeText ?? '🔥 PROMO SPESIAL'}
        </div>
        {data.handle && (
          <div
            style={{
              padding: '6px 14px',
              borderRadius: 8,
              background: 'rgba(15,23,42,0.75)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: '#FFFFFF',
              fontSize: 16,
              fontWeight: 700,
            }}
          >
            {data.handle}
          </div>
        )}
      </div>

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
            textShadow: '0 2px 28px rgba(0,0,0,.6)',
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
              color: 'rgba(255,255,255,.9)',
              textShadow: '0 2px 14px rgba(0,0,0,.5)',
              ...clampLines(l.feedCopy.maxLines),
            }}
          >
            {data.slide.body}
          </p>
        )}

        <div style={{ marginTop: Math.round(l.gap * 1.5) }}>
          <div style={{ height: 1, background: t.rule, marginBottom: Math.round(l.gap * 0.8) }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>
            <span style={{ fontSize: l.meta.size, color: t.muted, fontWeight: 600 }}>
              {data.displayName || 'Tersedia di Outlet & Online'}
            </span>
            <div
              style={{
                fontSize: l.meta.size,
                color: '#FFFFFF',
                fontWeight: 800,
                background: 'rgba(255,255,255,0.12)',
                padding: '4px 12px',
                borderRadius: 6,
                border: '1px solid rgba(255,255,255,0.2)',
              }}
            >
              {data.slide.total > 1 ? `Slide 1/${data.slide.total} ➔` : data.cta || 'Order Sekarang ➔'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
