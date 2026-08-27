/**
 * Metadata artikel diambil berlapis, dari yang paling terpercaya:
 * JSON-LD (schema.org) → OpenGraph/Twitter → meta name biasa → heuristik DOM.
 * Readability sendiri sering meleset untuk penulis & tanggal di situs berita ID.
 */

type Meta = {
  title: string | null;
  author: string | null;
  publishedAt: string | null;
  imageUrl: string | null;
  source: string | null;
  lang: string | null;
};

function attr(doc: Document, selector: string, name = 'content'): string | null {
  const value = doc.querySelector(selector)?.getAttribute(name)?.trim();
  return value || null;
}

function firstMeta(doc: Document, keys: string[]): string | null {
  for (const key of keys) {
    const value =
      attr(doc, `meta[property="${key}"]`) ??
      attr(doc, `meta[name="${key}"]`) ??
      attr(doc, `meta[itemprop="${key}"]`);
    if (value) return value;
  }
  return null;
}

function toIso(value: string | null | undefined): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  // Tanggal di masa depan (lebih dari sehari) hampir pasti salah parse.
  if (date.getTime() > Date.now() + 86_400_000) return null;
  return date.toISOString();
}

/**
 * Banyak portal mengisi meta penulis/publisher dengan URL sosial media
 * (mis. article:author = https://facebook.com/…). Nilai seperti itu lebih
 * buruk daripada kosong, jadi dibuang.
 */
function sanitizeText(value: string | null | undefined, maxLen = 120): string | null {
  if (!value) return null;
  const text = value.replace(/\s+/g, ' ').trim();
  if (!text || text.length > maxLen) return null;
  if (/^(https?:)?\/\//i.test(text) || /^www\./i.test(text) || /\S+@\S+\.\S+/.test(text)) return null;
  return text;
}

function absolute(url: string | null, base: URL): string | null {
  if (!url) return null;
  try {
    return new URL(url, base).href;
  } catch {
    return null;
  }
}

function pickName(value: unknown): string | null {
  if (!value) return null;
  if (typeof value === 'string') return value.trim() || null;
  if (Array.isArray(value)) {
    const names = value.map(pickName).filter(Boolean);
    return names.length ? names.slice(0, 3).join(', ') : null;
  }
  if (typeof value === 'object' && 'name' in (value as Record<string, unknown>)) {
    return pickName((value as Record<string, unknown>).name);
  }
  return null;
}

function pickImage(value: unknown): string | null {
  if (!value) return null;
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return pickImage(value[0]);
  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    return pickImage(obj.url ?? obj.contentUrl);
  }
  return null;
}

const ARTICLE_TYPES = ['NewsArticle', 'Article', 'BlogPosting', 'ReportageNewsArticle', 'OpinionNewsArticle'];

/** Menelusuri JSON-LD termasuk bentuk @graph dan array. */
function readJsonLd(doc: Document): Partial<Meta> {
  const scripts = Array.from(doc.querySelectorAll('script[type="application/ld+json"]'));

  for (const script of scripts) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(script.textContent ?? '');
    } catch {
      continue; // JSON-LD rusak itu lumrah — lewati diam-diam
    }

    const candidates: Record<string, unknown>[] = [];
    const push = (node: unknown) => {
      if (!node || typeof node !== 'object') return;
      if (Array.isArray(node)) return node.forEach(push);
      const obj = node as Record<string, unknown>;
      if (Array.isArray(obj['@graph'])) (obj['@graph'] as unknown[]).forEach(push);
      candidates.push(obj);
    };
    push(parsed);

    for (const node of candidates) {
      const rawType = node['@type'];
      const types = Array.isArray(rawType) ? rawType : [rawType];
      if (!types.some((t) => typeof t === 'string' && ARTICLE_TYPES.includes(t))) continue;

      return {
        title: pickName(node.headline ?? node.name),
        author: pickName(node.author ?? node.creator),
        publishedAt: toIso(
          (node.datePublished ?? node.dateCreated ?? node.dateModified) as string | undefined,
        ),
        imageUrl: pickImage(node.image ?? node.thumbnailUrl),
        source: pickName((node.publisher as Record<string, unknown>)?.name ?? node.publisher),
      };
    }
  }

  return {};
}

export function extractMetadata(doc: Document, baseUrl: URL): Meta {
  const ld = readJsonLd(doc);

  const title =
    ld.title ??
    firstMeta(doc, ['og:title', 'twitter:title']) ??
    doc.querySelector('h1')?.textContent?.trim() ??
    doc.title?.trim() ??
    null;

  const author =
    sanitizeText(ld.author) ??
    sanitizeText(firstMeta(doc, ['article:author', 'author', 'og:article:author', 'twitter:creator', 'dc.creator'])) ??
    sanitizeText(doc.querySelector('[rel="author"], .author, .penulis, [itemprop="author"]')?.textContent);

  const publishedAt =
    ld.publishedAt ??
    toIso(
      firstMeta(doc, [
        'article:published_time',
        'og:article:published_time',
        'datePublished',
        'publishdate',
        'pubdate',
        'date',
        'dc.date.issued',
      ]),
    ) ??
    toIso(doc.querySelector('time[datetime]')?.getAttribute('datetime'));

  const imageUrl = absolute(
    ld.imageUrl ?? firstMeta(doc, ['og:image', 'og:image:secure_url', 'twitter:image', 'twitter:image:src']),
    baseUrl,
  );

  // Publisher dari JSON-LD didahulukan: og:site_name di sebagian situs
  // berisi nama rubrik ("nasional"), bukan nama media.
  const hostname = baseUrl.hostname.replace(/^www\./, '');
  const sectionSlug = baseUrl.pathname.split('/').filter(Boolean)[0]?.toLowerCase();
  const siteName = sanitizeText(firstMeta(doc, ['og:site_name', 'application-name']), 60);
  const source =
    sanitizeText(ld.source, 60) ??
    (siteName && siteName.toLowerCase() !== sectionSlug ? siteName : null) ??
    hostname;

  const lang =
    doc.documentElement.getAttribute('lang')?.split('-')[0]?.toLowerCase() ??
    firstMeta(doc, ['og:locale'])?.split('_')[0]?.toLowerCase() ??
    null;

  return {
    title: title || null,
    // Buang prefiks yang sering ikut terbawa dari DOM.
    author: sanitizeText(author?.replace(/^(oleh|by|penulis)\s*[:\-]?\s*/i, '')),
    publishedAt: publishedAt ?? null,
    imageUrl,
    source: source || null,
    lang,
  };
}
