import type { RenderData } from '@/server/design/types';
import { layoutFor, fitHeadline } from '@/server/design/layout';
import { tokensFor } from '@/server/design/tokens';
import { clampLines } from '@/components/design/canvas';
import { PointSlide, OutroSlide, SlideImage } from '@/components/design/slides';

/**
 * Gaya Mega Sale & Launching:
 * Khas peluncuran produk baru, grand opening toko/outlet, flash deal, dan diskon besar.
 * Latar kontras tinggi, aksen kuning menyala, tipografi sangat tebal bertenaga.
 */
export function BoldTemplate(data: RenderData) {
  const t = tokensFor('BOLD');

  if (data.slide.type === 'POINT') return <PointSlide data={data} t={t} />;
  if (data.slide.type === 'OUTRO') return <OutroSlide data={data} t={t} />;

  const l = layoutFor('BOLD', data.format, 'COVER');
  const headlineSize = fitHeadline(data.slide.title, l.headline);

  return (
    <div style={{ position: 'absolute', inset: 0, background: t.bg, color: t.fg }}>
      <SlideImage data={data} t={t} mode="full" />

      {/* Badge Kicker Kuning Menyala */}
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
            borderRadius: 6,
            boxShadow: '0 4px 20px rgba(250,204,21,.4)',
            textTransform: 'uppercase',
          }}
        >
          {t.badgeText ?? '⚡ DISKON HARI INI'}
        </div>
        {data.handle && (
          <div
            style={{
              padding: '6px 14px',
              borderRadius: 6,
              background: 'rgba(0,0,0,0.8)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: '#FFFFFF',
              fontSize: 16,
              fontWeight: 800,
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
            lineHeight: 1.05,
            fontWeight: t.headlineWeight,
            letterSpacing: t.headlineTracking,
            textShadow: '0 3px 28px rgba(0,0,0,.7)',
            ...clampLines(l.headline.maxLines),
          }}
        >
          {data.slide.title}
        </h1>

        {/* Garis aksen kuning memisahkan judul */}
        <div
          style={{
            width: 100,
            height: 6,
            background: t.accent,
            borderRadius: 3,
            margin: `${l.gap}px 0`,
          }}
        />

        {l.feedCopy && data.slide.body && (
          <p
            style={{
              margin: 0,
              fontSize: l.feedCopy.size,
              lineHeight: l.feedCopy.lineHeight,
              color: 'rgba(255,255,255,.9)',
              textShadow: '0 2px 14px rgba(0,0,0,.6)',
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
              {data.displayName || 'Promo Eksklusif Toko & Sosmed'}
            </span>
            <div
              style={{
                fontSize: l.meta.size,
                color: t.accent,
                fontWeight: 800,
                background: 'rgba(0,0,0,0.6)',
                padding: '4px 12px',
                borderRadius: 6,
                border: '1px solid rgba(250,204,21,0.4)',
              }}
            >
              {data.slide.total > 1 ? `Slide 1/${data.slide.total} ➔` : data.cta || 'Klaim Sekarang ➔'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
