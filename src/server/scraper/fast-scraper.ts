/**
 * Fast Native Article Scraper (Zero-Dependency & 100% Vercel Serverless Compatible).
 * Mengekstrak judul, deskripsi, gambar utama, dan isi teks artikel berita
 * tanpa membebani server dengan jsdom atau playwright.
 */

export type FastScrapedArticle = {
  url: string;
  title: string;
  content: string;
  source: string;
  imageUrl: string | null;
  author: string;
};

export async function scrapeArticleFast(targetUrl: string): Promise<FastScrapedArticle> {
  const cleanUrl = targetUrl.trim();
  const urlObj = new URL(cleanUrl.startsWith('http') ? cleanUrl : `https://${cleanUrl}`);
  const domain = urlObj.hostname.replace(/^www\./, '');

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

  // 3. Resolve Foto
  let imageUrl = ogImageMatch?.[1] || null;
  if (imageUrl && !imageUrl.startsWith('http')) {
    try {
      imageUrl = new URL(imageUrl, urlObj.origin).href;
    } catch {
      imageUrl = null;
    }
  }

  // 4. Resolve Teks Isi Artikel
  let paragraphs: string[] = [];
  if (html) {
    // Buang script, style, nav, footer, header
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
    author: 'Redaksi',
  };
}
