import type { RenderData } from '@/server/design/types';
import { layoutFor, fitHeadline } from '@/server/design/layout';
import { tokensFor } from '@/server/design/tokens';
import { clampLines } from '@/components/design/canvas';
import { PointSlide, OutroSlide, SlideFooter, SlideImage } from '@/components/design/slides';

/**
 * Gaya Artisanal & Kuliner Asli:
 * Khas restoran legendaris (ala Rumah Makan Padang, warung nusantara, roastery kopi klasik).
 * Latar kertas hangat, bingkai elegan, tipografi serif berwibawa, dan cita rasa autentik.
 */
export function EditorialTemplate(data: RenderData) {
  const t = tokensFor('EDITORIAL');

  if (data.slide.type === 'POINT') return <PointSlide data={data} t={t} />;
  if (data.slide.type === 'OUTRO') return <OutroSlide data={data} t={t} />;

  const l = layoutFor('EDITORIAL', data.format, 'COVER');
  const image = l.image.mode === 'band' ? l.image : null;
  const headlineSize = fitHeadline(data.slide.title, l.headline);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: t.bg,
        color: t.fg,
        fontFamily: t.fontFamily ?? "Georgia, 'Times New Roman', serif",
      }}
    >
      {image && <SlideImage data={data} t={t} mode="band" />}

      {/* Frame border klasik khas kuliner & brand legendaris */}
      <div
        style={{
          position: 'absolute',
          top: 24,
          left: 24,
          right: 24,
          bottom: 24,
          border: '1px solid rgba(180, 83, 9, 0.2)',
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
        {/* Dateline & Tag Merek */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: l.gap }}>
          <span
            style={{
              fontSize: 16,
              fontWeight: 800,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: t.accent,
            }}
          >
            {t.badgeText ?? '🍛 KISAH RASA'}
          </span>
          <div style={{ flex: 1, height: 1, background: t.rule }} />
          <span style={{ fontSize: 15, color: t.fg, fontWeight: 700, letterSpacing: '0.04em' }}>
            {data.handle || '@kulinerasli'}
          </span>
        </div>

        <h1
          style={{
            margin: 0,
            fontSize: headlineSize,
            lineHeight: l.headline.lineHeight,
            fontWeight: t.headlineWeight,
            letterSpacing: t.headlineTracking,
            fontFamily: t.headlineFont ?? t.fontFamily,
            color: '#1A1817',
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
              color: '#57534E',
              fontWeight: 400,
              fontStyle: 'italic',
              ...clampLines(l.feedCopy.maxLines),
            }}
          >
            “{data.slide.body}”
          </p>
        )}

        <div style={{ marginTop: 'auto', paddingTop: l.gap }}>
          <div style={{ height: 2, borderTop: `1px solid ${t.rule}`, borderBottom: `1px solid ${t.rule}`, marginBottom: Math.round(l.gap * 0.7) }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>
            <span style={{ fontSize: l.meta.size, color: t.muted, fontWeight: 600 }}>
              {data.displayName || '100% Rempah Pilihan & Halal'}
            </span>
            {l.cta && data.cta && data.slide.total === 1 && (
              <span style={{ fontSize: l.cta.size, color: t.accent, fontWeight: 700, fontStyle: 'italic' }}>
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
