/**
 * Fast Native Article & Video Scraper (Zero-Dependency & 100% Vercel Serverless Compatible).
 * Mengekstrak judul, deskripsi, gambar utama, gambar sekunder (multi-photo), dan isi teks artikel berita atau video YouTube
 * tanpa membebani server dengan jsdom atau playwright.
 */

export type FastScrapedArticle = {
  url: string;
  title: string;
  content: string;
  source: string;
  imageUrl: string | null;
  images: string[];
  author: string;
};

export async function scrapeArticleFast(targetUrl: string): Promise<FastScrapedArticle> {
  const cleanUrl = targetUrl.trim();
  const urlObj = new URL(cleanUrl.startsWith('http') ? cleanUrl : `https://${cleanUrl}`);
  const domain = urlObj.hostname.replace(/^www\./, '');

  // ─── A. KHUSUS LINK YOUTUBE (WATCH, SHORTS, LIVE, EMBED, YOUTU.BE) ───
  if (domain.includes('youtube.com') || domain.includes('youtu.be')) {
    let videoId = '';
    if (domain.includes('youtu.be')) {
      videoId = urlObj.pathname.replace(/^\//, '').split(/[/?#]/)[0];
    } else if (urlObj.pathname.includes('/shorts/')) {
      videoId = urlObj.pathname.split('/shorts/')[1]?.split(/[/?#]/)[0] || '';
    } else if (urlObj.pathname.includes('/live/')) {
      videoId = urlObj.pathname.split('/live/')[1]?.split(/[/?#]/)[0] || '';
    } else if (urlObj.pathname.includes('/embed/')) {
      videoId = urlObj.pathname.split('/embed/')[1]?.split(/[/?#]/)[0] || '';
    } else {
      videoId = urlObj.searchParams.get('v') || '';
    }

    if (videoId) {
      let videoTitle = '';
      let authorName = 'Kreator YouTube';
      let videoDesc = '';
      let videoTranscript = '';
      const hqThumbnail = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
      const maxThumbnail = `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;
      const mqThumbnail = `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`;

      // Eksekusi paralel oEmbed resmi & HTML video page dengan timeout cepat (3.5s)
      await Promise.allSettled([
        // 1. YouTube oEmbed Resmi (cepat & terjamin tidak diblokir)
        (async () => {
          try {
            const oembedRes = await fetch(
              `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`,
              { signal: AbortSignal.timeout(3500) }
            );
            if (oembedRes.ok) {
              const oembed = await oembedRes.json();
              if (oembed.title) videoTitle = oembed.title.trim();
              if (oembed.author_name) authorName = oembed.author_name.trim();
            }
          } catch (e) {
            console.warn('[FastScraper YouTube oEmbed]:', e);
          }
        })(),

        // 2. HTML Video Page (untuk transkrip ucapan & deskripsi lengkap)
        (async () => {
          try {
            const pageRes = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
              headers: {
                'User-Agent':
                  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                'Accept-Language': 'id-ID,id;q=0.9,en;q=0.8',
              },
              signal: AbortSignal.timeout(3500),
            });
            if (pageRes.ok) {
              const html = await pageRes.text();

              // Ekstraksi ytInitialPlayerResponse untuk deskripsi komprehensif & caption tracks
              const playerMatch = html.match(/ytInitialPlayerResponse\s*=\s*({.+?});(?:\s*var|\s*<\/script>)/s)
                || html.match(/ytInitialPlayerResponse\s*=\s*({.+?});/);

              if (playerMatch?.[1]) {
                try {
                  const player = JSON.parse(playerMatch[1]);
                  const shortDesc = player?.videoDetails?.shortDescription;
                  if (shortDesc && shortDesc.trim().length > 0) {
                    videoDesc = shortDesc.trim();
                  }
                  if (!authorName && player?.videoDetails?.author) {
                    authorName = player.videoDetails.author;
                  }
                  if (!videoTitle && player?.videoDetails?.title) {
                    videoTitle = player.videoDetails.title;
                  }

                  // Ekstraksi Transkrip Otomatis / Manual dari Caption Tracks
                  const captionTracks = player?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
                  if (Array.isArray(captionTracks) && captionTracks.length > 0) {
                    // Prioritaskan bahasa Indonesia ('id') atau Inggris ('en')
                    const selectedTrack =
                      captionTracks.find((t: any) => t.languageCode === 'id') ||
                      captionTracks.find((t: any) => t.languageCode === 'en') ||
                      captionTracks[0];

                    if (selectedTrack?.baseUrl) {
                      try {
                        const transcriptRes = await fetch(selectedTrack.baseUrl, {
                          signal: AbortSignal.timeout(2500),
                        });
                        if (transcriptRes.ok) {
                          const xml = await transcriptRes.text();
                          const textSnippets = Array.from(xml.matchAll(/<text[^>]*>([^<]+)<\/text>/g))
                            .map((m) => m[1])
                            .filter(Boolean);
                          if (textSnippets.length > 0) {
                            videoTranscript = textSnippets
                              .map((t) =>
                                t
                                  .replace(/&amp;/g, '&')
                                  .replace(/&quot;/g, '"')
                                  .replace(/&#39;/g, "'")
                                  .replace(/&lt;/g, '<')
                                  .replace(/&gt;/g, '>')
                              )
                              .join(' ')
                              .replace(/\s+/g, ' ')
                              .trim();
                          }
                        }
                      } catch (tErr) {
                        console.warn('[FastScraper YouTube Transcript Fetch]:', tErr);
                      }
                    }
                  }
                } catch (pErr) {
                  console.warn('[FastScraper YouTube Player Parse]:', pErr);
                }
              }

              // Fallback Meta Tags
              if (!videoDesc) {
                const descMatch =
                  html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i) ||
                  html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i);
                if (descMatch?.[1]) videoDesc = descMatch[1].trim();
              }
              if (!videoTitle) {
                const ogTitle = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i);
                if (ogTitle?.[1]) videoTitle = ogTitle[1].replace(/ - YouTube$/, '').trim();
              }
            }
          } catch (pageErr) {
            console.warn('[FastScraper YouTube HTML Fetch]:', pageErr);
          }
        })(),
      ]);

      if (!videoTitle) {
        videoTitle = `Ulasan Video YouTube (${videoId})`;
      }

      // Susun konten yang kaya dan informatif untuk Gemini AI
      let content = `JUDUL VIDEO YOUTUBE: "${videoTitle}"
SALURAN / KREATOR: ${authorName}
SUMBER TAUTAN: https://www.youtube.com/watch?v=${videoId}
`;

      if (videoTranscript) {
        content += `\nTRANSKRIP ISI UCAPAN KREATOR DALAM VIDEO:\n${videoTranscript.slice(0, 5000)}\n`;
      }

      if (videoDesc) {
        content += `\nDESKRIPSI & RINCIAN MATERI VIDEO:\n${videoDesc.slice(0, 2500)}\n`;
      }

      content += `\nINSTRUKSI KHUSUS ANALISIS YOUTUBE:
Anda adalah kurator edukasi carousel media sosial. Rangkumlah materi dan topik video ini ke dalam slide carousel yang edukatif, memikat, dan terstruktur. Jabarkan poin-poin utama, data/fakta penting, solusi konkret, dan wawasan berharga dari video ini.`;

      return {
        url: urlObj.href,
        title: videoTitle,
        content,
        source: `YouTube (${authorName})`,
        imageUrl: hqThumbnail,
        images: [hqThumbnail, maxThumbnail, mqThumbnail],
        author: authorName,
      };
    }
  }

  // ─── B. ARTIKEL BERITA WEB STANDAR (DETIK, KOMPAS, CNN, DSB) ───
  let html = '';
  try {
    const res = await fetch(urlObj.href, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'id-ID,id;q=0.9,en;q=0.8',
      },
      signal: AbortSignal.timeout(6000),
    });

    if (res.ok) {
      html = await res.text();
    }
  } catch (err: any) {
    console.warn('[FastScraper] Fetch warning (using slug/meta):', err?.message);
  }

  // 1. Ekstrak Metadata (og:title, og:image, og:site_name, dsb.)
  const ogTitleMatch = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i)
    || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i);
  const titleTagMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);

  const ogImageMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
    || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
  const twitterImageMatch = html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i);

  const ogDescMatch = html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i)
    || html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i);

  const ogSiteMatch = html.match(/<meta[^>]+property=["']og:site_name["'][^>]+content=["']([^"']+)["']/i);

  // 2. Resolve Judul
  let title = (ogTitleMatch?.[1] || titleTagMatch?.[1] || '').trim();
  if (title.includes('|')) title = title.split('|')[0].trim();
  if (title.includes(' - ')) title = title.split(' - ')[0].trim();

  // Jika title kosong, gunakan URL Slug
  if (!title) {
    const segments = urlObj.pathname.split('/').filter(Boolean);
    const last = segments.pop() || domain;
    title = decodeURIComponent(last).replace(/[-_]/g, ' ');
    title = title.charAt(0).toUpperCase() + title.slice(1);
  }

  // 3. Resolve Semua Foto (Multi-Photo Scraper)
  const images: string[] = [];
  const primaryImg = ogImageMatch?.[1] || twitterImageMatch?.[1] || null;
  if (primaryImg) {
    try {
      const resolved = new URL(primaryImg, urlObj.origin).href;
      images.push(resolved);
    } catch {}
  }

  // Ekstrak tag <img> di dalam body artikel
  if (html) {
    const imgMatches = html.matchAll(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi);
    for (const match of imgMatches) {
      const src = match[1];
      if (
        src &&
        !src.includes('avatar') &&
        !src.includes('logo') &&
        !src.includes('icon') &&
        !src.includes('tracker') &&
        (src.endsWith('.jpg') || src.endsWith('.jpeg') || src.endsWith('.png') || src.endsWith('.webp') || src.includes('image'))
      ) {
        try {
          const resolved = new URL(src, urlObj.origin).href;
          if (!images.includes(resolved) && images.length < 4) {
            images.push(resolved);
          }
        } catch {}
      }
    }
  }

  const imageUrl = images[0] || null;

  // 4. Resolve Teks Isi Artikel
  let paragraphs: string[] = [];
  if (html) {
    const cleanHtml = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, '')
      .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, '')
      .replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, '');

    const pMatches = cleanHtml.matchAll(/<p[^>]*>([^<]+)<\/p>/gi);
    for (const match of pMatches) {
      const text = match[1].replace(/&[a-z]+;/gi, ' ').replace(/\s+/g, ' ').trim();
      if (text.length > 35 && !text.toLowerCase().includes('baca juga') && !text.toLowerCase().includes('copyright')) {
        paragraphs.push(text);
      }
    }
  }

  const desc = (ogDescMatch?.[1] || '').trim();
  if (paragraphs.length === 0 && desc) {
    paragraphs.push(desc);
  }

  const content = paragraphs.length > 0
    ? paragraphs.slice(0, 10).join('\n\n')
    : `Artikel berita dari sumber: ${domain}. Judul: "${title}". Buatkan analisis terstruktur untuk carousel media sosial.`;

  const source = ogSiteMatch?.[1] || domain.toUpperCase();

  return {
    url: urlObj.href,
    title,
    content,
    source,
    imageUrl,
    images,
    author: 'Redaksi',
  };
}
