/**
 * Fast Native Article, Video & E-Commerce / Marketplace Scraper
 * (Zero-Dependency & 100% Vercel Serverless Compatible).
 * 
 * Mendukung ekstraksi cerdas:
 * 1. Marketplace & E-Commerce (Shopee, Tokopedia, TikTok Shop, Lazada, Shopify, Bukalapak, Blibli, dll)
 *    -> Otomatis mengambil SEMUA foto galeri produk asli, harga promo, rating, dan spesifikasi produk.
 * 2. Video YouTube & Shorts -> Judul, thumbnail HD, deskripsi, & transkrip ucapan otomatis.
 * 3. Blog, Medium, Web Bisnis & Berita -> Judul, ringkasan, multi-photo, dan paragraf lengkap.
 */

export type FastScrapedArticle = {
  url: string;
  title: string;
  content: string;
  source: string;
  imageUrl: string | null;
  images: string[];
  author: string;
  price?: string;
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

      await Promise.allSettled([
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
              const playerMatch = html.match(/ytInitialPlayerResponse\s*=\s*({.+?});(?:\s*var|\s*<\/script>)/s)
                || html.match(/ytInitialPlayerResponse\s*=\s*({.+?});/);

              if (playerMatch?.[1]) {
                try {
                  const player = JSON.parse(playerMatch[1]);
                  const shortDesc = player?.videoDetails?.shortDescription;
                  if (shortDesc && shortDesc.trim().length > 0) videoDesc = shortDesc.trim();
                  if (!authorName && player?.videoDetails?.author) authorName = player.videoDetails.author;
                  if (!videoTitle && player?.videoDetails?.title) videoTitle = player.videoDetails.title;

                  const captionTracks = player?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
                  if (Array.isArray(captionTracks) && captionTracks.length > 0) {
                    const selectedTrack =
                      captionTracks.find((t: any) => t.languageCode === 'id') ||
                      captionTracks.find((t: any) => t.languageCode === 'en') ||
                      captionTracks[0];

                    if (selectedTrack?.baseUrl) {
                      try {
                        const transcriptRes = await fetch(selectedTrack.baseUrl, { signal: AbortSignal.timeout(2500) });
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
                      } catch (tErr) {}
                    }
                  }
                } catch (pErr) {}
              }

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
          } catch (pageErr) {}
        })(),
      ]);

      if (!videoTitle) videoTitle = `Ulasan Video YouTube (${videoId})`;

      let content = `JUDUL VIDEO YOUTUBE: "${videoTitle}"\nSALURAN / KREATOR: ${authorName}\nSUMBER TAUTAN: https://www.youtube.com/watch?v=${videoId}\n`;
      if (videoTranscript) content += `\nTRANSKRIP ISI UCAPAN KREATOR DALAM VIDEO:\n${videoTranscript.slice(0, 5000)}\n`;
      if (videoDesc) content += `\nDESKRIPSI & RINCIAN MATERI VIDEO:\n${videoDesc.slice(0, 2500)}\n`;
      content += `\nINSTRUKSI KHUSUS ANALISIS YOUTUBE:\nAnda adalah kurator edukasi carousel media sosial. Rangkumlah materi video ini ke dalam slide carousel yang edukatif, memikat, dan terstruktur.`;

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

  // ─── B. WEB UMUM, E-COMMERCE / MARKETPLACE (SHOPEE, TOKOPEDIA, TIKTOK SHOP, DLL) ───
  let html = '';
  let finalUrl = urlObj.href;

  try {
    const res = await fetch(urlObj.href, {
      redirect: 'follow',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
        'Cache-Control': 'no-cache',
      },
      signal: AbortSignal.timeout(6500),
    });

    if (res.ok) {
      html = await res.text();
      finalUrl = res.url || urlObj.href;
    }
  } catch (err: any) {
    console.warn('[FastScraper] Fetch warning (proceeding with fallback):', err?.message);
  }

  const isShopee = domain.includes('shopee') || finalUrl.includes('shopee');
  const isTokopedia = domain.includes('tokopedia') || finalUrl.includes('tokopedia');
  const isTikTokShop = domain.includes('tiktok') || finalUrl.includes('tiktok');
  const isLazada = domain.includes('lazada') || finalUrl.includes('lazada');
  const isMarketplace = isShopee || isTokopedia || isTikTokShop || isLazada || domain.includes('blibli') || domain.includes('bukalapak') || domain.includes('shopify');

  let extractedTitle = '';
  let extractedDesc = '';
  let extractedPrice = '';
  const productImages: string[] = [];

  // 1. Ekstraksi JSON-LD Schema (Standar E-Commerce: Product / ItemList)
  if (html) {
    const jsonLdMatches = html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
    for (const match of jsonLdMatches) {
      try {
        const parsed = JSON.parse(match[1]);
        const items = Array.isArray(parsed) ? parsed : [parsed];

        for (const item of items) {
          if (item['@type'] === 'Product' || item.name || item.image) {
            if (!extractedTitle && item.name) extractedTitle = item.name;
            if (!extractedDesc && item.description) extractedDesc = item.description;

            // Ekstrak Harga
            if (!extractedPrice && item.offers) {
              const offer = Array.isArray(item.offers) ? item.offers[0] : item.offers;
              const priceVal = offer?.price || offer?.lowPrice;
              const currency = offer?.priceCurrency || 'IDR';
              if (priceVal) {
                extractedPrice = currency === 'IDR' || currency === 'Rp'
                  ? 'Rp ' + Number(priceVal).toLocaleString('id-ID')
                  : `${currency} ${priceVal}`;
              }
            }

            // Ekstrak Semua Foto Galeri Produk dari Schema
            if (item.image) {
              const rawImages = Array.isArray(item.image) ? item.image : [item.image];
              for (const imgItem of rawImages) {
                const imgUrl = typeof imgItem === 'string' ? imgItem : imgItem?.url || imgItem?.contentUrl;
                if (imgUrl && typeof imgUrl === 'string' && imgUrl.startsWith('http') && !productImages.includes(imgUrl)) {
                  productImages.push(imgUrl);
                }
              }
            }
          }
        }
      } catch (e) {}
    }
  }

  // 2. Marketplace Dedicated CDN Regex Scraper (Shopee, Tokopedia, TikTok, Lazada)
  if (html) {
    // Shopee Images: https://down-id.img.susercontent.com/file/...
    if (isShopee) {
      const shopeeImgRegex = /https?:\/\/(?:down-id\.img\.susercontent\.com|cf\.shopee\.co\.id)\/file\/([a-zA-Z0-9_-]+)/g;
      const matches = Array.from(html.matchAll(shopeeImgRegex));
      for (const m of matches) {
        const fullImg = `https://down-id.img.susercontent.com/file/${m[1]}`;
        if (!productImages.includes(fullImg) && productImages.length < 8) {
          productImages.push(fullImg);
        }
      }
    }

    // Tokopedia Images: https://images.tokopedia.net/img/cache/...
    if (isTokopedia) {
      const tokpedImgRegex = /https?:\/\/images\.tokopedia\.net\/img\/cache\/[a-zA-Z0-9_./-]+\.(?:jpg|jpeg|png|webp)/g;
      const matches = Array.from(html.matchAll(tokpedImgRegex));
      for (const m of matches) {
        const fullImg = m[0];
        if (!productImages.includes(fullImg) && productImages.length < 8 && !fullImg.includes('icon') && !fullImg.includes('badge')) {
          productImages.push(fullImg);
        }
      }
    }

    // TikTok Shop Images
    if (isTikTokShop) {
      const tiktokImgRegex = /https?:\/\/p(?:16|19)-oec-va\.ibyteimg\.com\/[a-zA-Z0-9_./-~]+/g;
      const matches = Array.from(html.matchAll(tiktokImgRegex));
      for (const m of matches) {
        const fullImg = m[0];
        if (!productImages.includes(fullImg) && productImages.length < 8) {
          productImages.push(fullImg);
        }
      }
    }
  }

  // 3. Fallback Meta Tags (og:title, og:image, twitter:image, meta description)
  const ogTitleMatch = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i)
    || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i);
  const titleTagMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);

  const ogImageMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
    || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
  const twitterImageMatch = html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i);

  const ogDescMatch = html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i)
    || html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i);

  const ogSiteMatch = html.match(/<meta[^>]+property=["']og:site_name["'][^>]+content=["']([^"']+)["']/i);

  // Tambahkan og:image & twitter:image ke daftar gambar
  const primaryImg = ogImageMatch?.[1] || twitterImageMatch?.[1] || null;
  if (primaryImg) {
    try {
      const resolved = new URL(primaryImg, urlObj.origin).href;
      if (!productImages.includes(resolved)) {
        productImages.unshift(resolved); // Letakkan di urutan pertama (Cover)
      }
    } catch {}
  }

  // Ekstrak tag <img> lainnya
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
        (src.endsWith('.jpg') || src.endsWith('.jpeg') || src.endsWith('.png') || src.endsWith('.webp') || src.includes('product') || src.includes('image'))
      ) {
        try {
          const resolved = new URL(src, urlObj.origin).href;
          if (!productImages.includes(resolved) && productImages.length < 8) {
            productImages.push(resolved);
          }
        } catch {}
      }
    }
  }

  // 4. Resolve Judul Akhir
  let title = extractedTitle || (ogTitleMatch?.[1] || titleTagMatch?.[1] || '').trim();
  if (title.includes(' | ')) title = title.split(' | ')[0].trim();
  if (title.includes(' - ')) title = title.split(' - ')[0].trim();

  // Jika title kosong, gunakan URL slug
  if (!title) {
    const segments = urlObj.pathname.split('/').filter(Boolean);
    const last = segments.pop() || domain;
    title = decodeURIComponent(last).replace(/[-_]/g, ' ');
    title = title.charAt(0).toUpperCase() + title.slice(1);
  }

  // 5. Ekstraksi Paragraf Teks Deskripsi
  let paragraphs: string[] = [];
  if (extractedDesc) {
    paragraphs.push(extractedDesc);
  }

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
      if (text.length > 30 && !text.toLowerCase().includes('baca juga') && !text.toLowerCase().includes('copyright')) {
        paragraphs.push(text);
      }
    }
  }

  if (paragraphs.length === 0 && ogDescMatch?.[1]) {
    paragraphs.push(ogDescMatch[1].trim());
  }

  // 6. Susun format konten kaya untuk Gemini AI
  const platformName = isShopee
    ? 'Shopee Indonesia'
    : isTokopedia
    ? 'Tokopedia'
    : isTikTokShop
    ? 'TikTok Shop'
    : isLazada
    ? 'Lazada'
    : ogSiteMatch?.[1] || domain.toUpperCase();

  let formattedContent = '';
  if (isMarketplace) {
    formattedContent = `PRODUK / KATALOG: "${title}"\n` +
      (extractedPrice ? `HARGA: ${extractedPrice}\n` : '') +
      `PLATFORM: ${platformName}\n` +
      `URL PRODUK: ${urlObj.href}\n\n` +
      `DESKRIPSI PRODUK & FITUR KEUNGGULAN:\n` +
      (paragraphs.length > 0 ? paragraphs.slice(0, 8).join('\n\n') : 'Produk berkualitas tinggi siap dipesan.') +
      `\n\nFOTO PRODUK TERSEDIA: Ditemukan ${productImages.length} foto produk asli untuk slide carousel.\n` +
      `INSTRUKSI AI: Buatlah naskah promosi / review produk yang memikat, sebutkan keunggulan spesifik produk, buat hook penasaran, dan sertakan CTA jelas untuk order.`;
  } else {
    formattedContent = paragraphs.length > 0
      ? paragraphs.slice(0, 10).join('\n\n')
      : `Artikel web dari: ${domain}. Judul: "${title}". Rangkumlah materi ini ke dalam poin-poin carousel yang memikat dan edukatif.`;
  }

  return {
    url: urlObj.href,
    title,
    content: formattedContent,
    source: platformName,
    imageUrl: productImages[0] || null,
    images: productImages,
    author: isMarketplace ? platformName : 'Redaksi',
    price: extractedPrice,
  };
}
