import type { RenderData } from '@/server/design/types';
import type { StyleTokens } from '@/server/design/tokens';
import { layoutFor, fitHeadline, imageModeFor } from '@/server/design/layout';
import { clampLines } from '@/components/design/canvas';

/**
 * Slide isi dan penutup dipakai bersama oleh semua gaya — geometrinya sama,
 * yang berbeda hanya token warna. Ini menjaga carousel tetap konsisten dan rapi.
 */

/** Penanda "2 / 5" + akun brand. */
export function SlideFooter({ data, t, size }: { data: RenderData; t: StyleTokens; size: number }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        fontSize: size,
        color: t.muted,
        fontWeight: 600,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontWeight: 700, color: t.fg }}>{data.handle || '@brandbisnis'}</span>
        {data.slide.total > 1 && data.slide.index + 1 < data.slide.total && (
          <span style={{ fontSize: Math.round(size * 0.85), color: t.accent }}>· Geser ➔</span>
        )}
      </div>
      {data.slide.total > 1 && (
        <span
          style={{
            fontVariantNumeric: 'tabular-nums',
            fontWeight: 700,
            background: 'rgba(128,128,128,0.15)',
            padding: '2px 8px',
            borderRadius: 0,
          }}
        >
          {data.slide.index + 1} / {data.slide.total}
        </span>
      )}
    </div>
  );
}

/**
 * Gambar slide. Tiap slide punya gambarnya sendiri — kalau belum jadi,
 * yang tampil latar cadangan gaya itu.
 */
export function SlideImage({ data, t, mode }: { data: RenderData; t: StyleTokens; mode: 'band' | 'full' }) {
  const l = layoutFor(data.style, data.format, data.slide.type);
  const band = l.image.mode === 'band' ? l.image : null;

  const box: React.CSSProperties =
    mode === 'full'
      ? { position: 'absolute', inset: 0 }
      : { position: 'absolute', left: 0, right: 0, top: band?.top ?? 0, height: band?.height ?? 0 };

  return (
    <>
      <div style={{ ...box, overflow: 'hidden' }}>
        {data.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={data.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', background: t.fallbackBg }} />
        )}
      </div>
      {/* Scrim saat teks duduk di atas gambar */}
      {mode === 'full' && <div style={{ position: 'absolute', inset: 0, background: t.scrim }} />}
    </>
  );
}

export function PointSlide({ data, t }: { data: RenderData; t: StyleTokens }) {
  const l = layoutFor(data.style, data.format, 'POINT');
  const titleSize = fitHeadline(data.slide.title, l.headline);
  const mode = imageModeFor(data.style, 'POINT');
  const overImage = mode === 'full';

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: t.bg,
        color: t.fg,
        fontFamily: t.fontFamily ?? "'Inter', system-ui, sans-serif",
      }}
    >
      {mode !== 'none' && <SlideImage data={data} t={t} mode={overImage ? 'full' : 'band'} />}

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
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: overImage ? 'flex-end' : 'center',
          }}
        >
          {/* Header Baris Atas: Nomor Urut & Stat/Pill Highlight */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: Math.round(l.gap * 0.6) }}>
            {l.number && (
              <span
                style={{
                  fontSize: l.number.size,
                  lineHeight: 1,
                  fontWeight: 900,
                  color: t.accent,
                  letterSpacing: '-0.04em',
                  ...(overImage
                    ? { background: t.accent, color: t.accentFg, padding: '2px 14px 4px', borderRadius: 0 }
                    : {}),
                }}
              >
                {String(data.slide.index).padStart(2, '0')}
              </span>
            )}
            {data.handle && !overImage && (
              <span style={{ fontSize: 15, color: t.muted, fontWeight: 600 }}>
                {data.handle}
              </span>
            )}
          </div>

          <h2
            style={{
              margin: 0,
              fontSize: titleSize,
              lineHeight: l.headline.lineHeight,
              fontWeight: t.headlineWeight,
              letterSpacing: t.headlineTracking,
              fontFamily: t.headlineFont ?? t.fontFamily,
              textShadow: overImage ? '0 2px 24px rgba(0,0,0,.5)' : undefined,
              ...clampLines(l.headline.maxLines),
            }}
          >
            {data.slide.title}
          </h2>

          {l.feedCopy && data.slide.body && (
            <p
              style={{
                margin: `${l.gap}px 0 0`,
                fontSize: l.feedCopy.size,
                lineHeight: l.feedCopy.lineHeight,
                color: overImage ? 'rgba(255,255,255,.9)' : t.muted,
                fontWeight: 450,
                textShadow: overImage ? '0 2px 12px rgba(0,0,0,.5)' : undefined,
                ...clampLines(l.feedCopy.maxLines),
              }}
            >
              {data.slide.body}
            </p>
          )}
        </div>

        <div style={{ paddingTop: l.gap }}>
          <div style={{ height: 1, background: t.rule, marginBottom: Math.round(l.gap * 0.7) }} />
          <SlideFooter data={data} t={t} size={l.meta.size} />
        </div>
      </div>
    </div>
  );
}

export function OutroSlide({ data, t }: { data: RenderData; t: StyleTokens }) {
  const l = layoutFor(data.style, data.format, 'OUTRO');

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: t.bg,
        color: t.fg,
        fontFamily: t.fontFamily ?? "'Inter', system-ui, sans-serif",
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: l.content.top,
          left: l.content.left,
          right: l.content.right,
          bottom: l.content.bottom,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Accent Bar */}
        <div style={{ width: 64, height: 6, background: t.accent, borderRadius: 0, marginBottom: l.gap }} />

        {/* CTA Hook Headline */}
        <h2
          style={{
            margin: 0,
            fontSize: l.headline.size,
            lineHeight: l.headline.lineHeight,
            fontWeight: t.headlineWeight,
            letterSpacing: t.headlineTracking,
            fontFamily: t.headlineFont ?? t.fontFamily,
            ...clampLines(l.headline.maxLines),
          }}
        >
          {data.slide.title}
        </h2>

        {/* Subhead / Description */}
        {l.feedCopy && data.slide.body && (
          <p
            style={{
              margin: `${l.gap}px 0 0`,
              fontSize: l.feedCopy.size,
              lineHeight: l.feedCopy.lineHeight,
              color: t.muted,
              maxWidth: '90%',
              ...clampLines(l.feedCopy.maxLines),
            }}
          >
            {data.slide.body}
          </p>
        )}

        {/* Business Conversion Box */}
        <div
          style={{
            marginTop: Math.round(l.gap * 1.8),
            width: '100%',
            background: 'rgba(128,128,128,0.08)',
            border: `1px solid ${t.rule}`,
            borderRadius: 0,
            padding: '20px 24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <div
            style={{
              fontSize: l.meta.size * 1.1,
              fontWeight: 800,
              color: t.accent,
            }}
          >
            {data.cta || '👉 Order Sekarang via Link di Bio / WhatsApp'}
          </div>

          <div style={{ fontSize: l.meta.size, fontWeight: 700, color: t.fg }}>
            {data.handle || '@brandbisnis'}
          </div>

          <div style={{ fontSize: Math.round(l.meta.size * 0.85), color: t.muted, fontWeight: 500 }}>
            {data.displayName || '📌 Simpan postingan ini & tag temanmu!'}
          </div>
        </div>
      </div>
    </div>
  );
}
