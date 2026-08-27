import type { ExtractedArticle } from '@/server/scraper/types';
import { ScrapeError } from '@/server/scraper/errors';

export function isYouTubeUrl(url: string | URL): boolean {
  try {
    const u = typeof url === 'string' ? new URL(url) : url;
    const host = u.hostname.toLowerCase().replace(/^www\./, '');
    return host === 'youtube.com' || host === 'youtu.be' || host === 'm.youtube.com';
  } catch {
    return false;
  }
}

export function extractYouTubeVideoId(url: string | URL): string | null {
  try {
    const u = typeof url === 'string' ? new URL(url) : url;
    const host = u.hostname.toLowerCase().replace(/^www\./, '');

    if (host === 'youtu.be') {
      return u.pathname.slice(1).split('/')[0] || null;
    }

    if (host === 'youtube.com' || host === 'm.youtube.com') {
      if (u.pathname.startsWith('/shorts/')) {
        return u.pathname.replace('/shorts/', '').split('/')[0] || null;
      }
      return u.searchParams.get('v') || null;
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Ekstraksi transkrip & metadata video YouTube tanpa API Key berbayar.
 * Mengambil oEmbed info + subtitle/caption timedtext dari player response.
 */
export async function extractYouTubeVideo(urlStr: string): Promise<ExtractedArticle> {
  const startedAt = Date.now();
  const videoId = extractYouTubeVideoId(urlStr);

  if (!videoId) {
    throw new ScrapeError('INVALID_URL', 'URL YouTube tidak valid atau ID video tidak ditemukan.');
  }

  const cleanUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const warnings: string[] = [];

  let title = 'Video YouTube';
  let author = 'YouTube Creator';
  let description = '';
  let transcript = '';

  // 1. Fetch metadata via oEmbed
  try {
    const oembedRes = await fetch(
      `https://www.youtube.com/oembed?url=${encodeURIComponent(cleanUrl)}&format=json`,
      {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Scoopcraft/1.0' },
        signal: AbortSignal.timeout(10_000),
      },
    );
    if (oembedRes.ok) {
      const oembed = (await oembedRes.json()) as { title?: string; author_name?: string };
      if (oembed.title) title = oembed.title;
      if (oembed.author_name) author = oembed.author_name;
    }
  } catch (err) {
    warnings.push('Gagal mengambil metadata oEmbed YouTube.');
  }

  // 2. Fetch video page HTML untuk mencari transkrip subtitle & description
  try {
    const pageRes = await fetch(cleanUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'id,en-US;q=0.9,en;q=0.8',
      },
      signal: AbortSignal.timeout(15_000),
    });

    if (pageRes.ok) {
      const html = await pageRes.text();

      // Cari short description
      const descMatch = html.match(/"shortDescription":"([^"]*)"/);
      if (descMatch && descMatch[1]) {
        description = descMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"');
      }

      // Cari caption tracks URL
      const captionMatch = html.match(/"captionTracks":\s*(\[[^\]]+\])/);
      if (captionMatch && captionMatch[1]) {
        try {
          const tracks = JSON.parse(captionMatch[1]) as Array<{ baseUrl?: string; languageCode?: string }>;
          // Prioritaskan bahasa Indonesia atau Inggris
          const selectedTrack =
            tracks.find((t) => t.languageCode === 'id') ||
            tracks.find((t) => t.languageCode === 'en') ||
            tracks[0];

          if (selectedTrack?.baseUrl) {
            const captionRes = await fetch(selectedTrack.baseUrl, { signal: AbortSignal.timeout(10_000) });
            if (captionRes.ok) {
              const xml = await captionRes.text();
              // Parse XML <text> tags
              const lines = Array.from(xml.matchAll(/<text[^>]*>([^<]*)<\/text>/g))
                .map((m) =>
                  m[1]
                    .replace(/&amp;/g, '&')
                    .replace(/&quot;/g, '"')
                    .replace(/&#39;/g, "'")
                    .replace(/&lt;/g, '<')
                    .replace(/&gt;/g, '>')
                    .trim(),
                )
                .filter(Boolean);

              transcript = lines.join(' ');
            }
          }
        } catch {
          warnings.push('Parsing subtitle caption YouTube gagal.');
        }
      }
    }
  } catch (err) {
    warnings.push('Gagal mengambil halaman video YouTube.');
  }

  // Gabungkan konten untuk AI
  let fullContent = '';
  if (transcript.length > 50) {
    fullContent = `Transkrip Video:\n${transcript}\n\nDeskripsi Video:\n${description}`;
  } else if (description.length > 30) {
    fullContent = `Deskripsi Video:\n${description}`;
    warnings.push('Transkrip subtitle tidak tersedia; menggunakan deskripsi video.');
  } else {
    fullContent = `Video oleh ${author}: ${title}.`;
    warnings.push('Transkrip & deskripsi video minim.');
  }

  // Thumbnail YouTube HD
  const imageUrl = `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;

  const wordCount = fullContent.split(/\s+/).filter(Boolean).length;

  return {
    url: cleanUrl,
    requestedUrl: urlStr,
    title,
    content: fullContent,
    contentHtml: `<p>${fullContent.replace(/\n/g, '<br/>')}</p>`,
    excerpt: description.slice(0, 200) || title,
    author,
    publishedAt: new Date().toISOString(),
    source: `YouTube · ${author}`,
    imageUrl,
    lang: 'id',
    wordCount,
    scrapedVia: 'readability',
    durationMs: Date.now() - startedAt,
    warnings,
  };
}
