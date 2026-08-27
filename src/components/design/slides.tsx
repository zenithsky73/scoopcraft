import type { RenderData } from '@/server/design/types';
import type { StyleTokens } from '@/server/design/tokens';
import { layoutFor, fitHeadline, imageModeFor } from '@/server/design/layout';
import { clampLines } from '@/components/design/canvas';

/**
 * Slide isi dan penutup dipakai bersama oleh semua gaya — geometrinya sama,
 * yang berbeda hanya token warna. Ini menjaga carousel tetap konsisten:
 * pembaca tidak melihat tata letak berubah-ubah saat menggeser.
 */

/** Penanda "2 / 5" + akun. Muncul di setiap slide agar sumbernya jelas. */
export function SlideFooter({ data, t, size }: { data: RenderData; t: StyleTokens; size: number }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        gap: 24,
        fontSize: size,
        color: t.muted,
        fontWeight: 500,
      }}
    >
      <span style={{ fontWeight: 600 }}>{data.handle}</span>
      {data.slide.total > 1 && (
        <span style={{ fontVariantNumeric: 'tabular-nums' }}>
          {data.slide.index + 1} / {data.slide.total}
        </span>
      )}
    </div>
  );
}

/**
 * Gambar slide. Tiap slide punya gambarnya sendiri — kalau belum jadi,
 * yang tampil latar cadangan gaya itu, bukan gambar slide lain.
 */
export function SlideImage({ data, t, mode }: { data: RenderData; t: StyleTokens; mode: 'band' | 'full'; }) {
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
      {/* Scrim hanya saat teks duduk di atas gambar. */}
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
        {/* Blok teks ditengahkan vertikal saat gambar berupa pita; kalau
            teks duduk di atas gambar penuh, ia menempel ke bawah supaya
            tidak menutupi subjek foto. */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: overImage ? 'flex-end' : 'center',
          }}
        >
        {/* Nomor besar memberi ritme carousel dan memberi tahu posisi pembaca. */}
        {l.number && (
          <span
            style={{
              alignSelf: 'flex-start',
              fontSize: l.number.size,
              lineHeight: 1,
              fontWeight: 900,
              color: t.accent,
              letterSpacing: '-0.05em',
              marginBottom: Math.round(l.gap * 0.6),
              // Di atas foto, angka butuh jangkar visual supaya tidak hilang.
              ...(overImage
                ? { background: t.accent, color: t.accentFg, padding: '0 18px 8px', borderRadius: 8 }
                : {}),
            }}
          >
            {String(data.slide.index).padStart(2, '0')}
          </span>
        )}

        <h2
          style={{
            margin: 0,
            fontSize: titleSize,
            lineHeight: l.headline.lineHeight,
            fontWeight: t.headlineWeight,
            letterSpacing: t.headlineTracking,
            fontFamily: t.headlineFont ?? t.fontFamily,
            textShadow: overImage ? '0 2px 24px rgba(0,0,0,.4)' : undefined,
            ...clampLines(l.headline.maxLines),
          }}
        >
          {data.slide.title}
        </h2>

        {l.feedCopy && (
          <p
            style={{
              margin: `${l.gap}px 0 0`,
              fontSize: l.feedCopy.size,
              lineHeight: l.feedCopy.lineHeight,
              color: overImage ? 'rgba(255,255,255,.85)' : t.muted,
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
        <div style={{ width: 72, height: 5, background: t.accent, borderRadius: 3, marginBottom: l.gap }} />

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

        {l.feedCopy && (
          <p
            style={{
              margin: `${l.gap}px 0 0`,
              fontSize: l.feedCopy.size,
              lineHeight: l.feedCopy.lineHeight,
              color: t.muted,
              ...clampLines(l.feedCopy.maxLines),
            }}
          >
            {data.slide.body}
          </p>
        )}

        <div style={{ marginTop: Math.round(l.gap * 2.2), width: '100%' }}>
          <div style={{ fontSize: l.meta.size, fontWeight: 700, color: t.fg }}>{data.handle}</div>
          {data.displayName && (
            <div style={{ marginTop: 6, fontSize: Math.round(l.meta.size * 0.75), color: t.muted }}>
              {data.displayName}
            </div>
          )}
          {data.source && (
            <div style={{ marginTop: Math.round(l.gap * 0.7), fontSize: Math.round(l.meta.size * 0.7), color: t.muted }}>
              Sumber: {data.source}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
