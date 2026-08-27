import type { RenderData } from '@/server/design/types';
import { layoutFor, fitHeadline } from '@/server/design/layout';
import { tokensFor } from '@/server/design/tokens';
import { clampLines, formatMeta } from '@/components/design/canvas';
import { PointSlide, OutroSlide, SlideImage } from '@/components/design/slides';

/**
 * Gaya Bold: latar nyaris hitam, satu warna aksen mencolok, tipografi sangat
 * tebal, dan gambar berbeda di setiap slide.
 *
 * Slide pembuka memakai gambar penuh bingkai; slide isi membelah kanvas —
 * gambar di atas, panel gelap dengan nomor besar di bawah. Pembagian itu
 * membuat teks selalu terbaca tanpa bergantung pada terang-gelapnya foto.
 */
export function BoldTemplate(data: RenderData) {
  const t = tokensFor('BOLD');

  if (data.slide.type === 'POINT') return <PointSlide data={data} t={t} />;
  if (data.slide.type === 'OUTRO') return <OutroSlide data={data} t={t} />;

  const l = layoutFor('BOLD', data.format, 'COVER');
  const headlineSize = fitHeadline(data.slide.title, l.headline);
  const kicker = data.source?.toUpperCase() ?? 'SCOOPCRAFT';

  return (
    <div style={{ position: 'absolute', inset: 0, background: t.bg, color: t.fg }}>
      <SlideImage data={data} t={t} mode="full" />

      {/* Kicker berupa blok warna solid — penanda merek yang terbaca
          sekilas di feed, bahkan pada thumbnail kecil. */}
      <div
        style={{
          position: 'absolute',
          top: l.badge?.top ?? 72,
          left: l.badge?.left ?? 72,
          background: t.accent,
          color: t.accentFg,
          fontSize: l.badge?.size ?? 26,
          fontWeight: 900,
          letterSpacing: '0.12em',
          padding: `${Math.round((l.badge?.size ?? 26) * 0.4)}px ${Math.round((l.badge?.size ?? 26) * 0.75)}px`,
          borderRadius: 4,
        }}
      >
        {kicker.slice(0, 18)}
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
            lineHeight: 1.02,
            fontWeight: t.headlineWeight,
            letterSpacing: t.headlineTracking,
            textShadow: '0 2px 28px rgba(0,0,0,.45)',
            ...clampLines(l.headline.maxLines),
          }}
        >
          {data.slide.title}
        </h1>

        {/* Garis aksen tebal memisahkan judul dari teks pendukung —
            khas carousel edukasi yang harus terbaca sambil di-scroll. */}
        <div
          style={{
            width: 120,
            height: 8,
            background: t.accent,
            borderRadius: 4,
            margin: `${l.gap}px 0`,
          }}
        />

        {l.feedCopy && data.slide.body && (
          <p
            style={{
              margin: 0,
              fontSize: l.feedCopy.size,
              lineHeight: l.feedCopy.lineHeight,
              color: 'rgba(255,255,255,.86)',
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
            <span style={{ fontSize: l.meta.size, color: t.accent, fontWeight: 700 }}>
              {data.handle}
              {data.slide.total > 1 && `  ·  ${data.slide.index + 1}/${data.slide.total}`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
