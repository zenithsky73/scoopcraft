import { NextResponse } from 'next/server';
import { TOPIC_PHOTO_COLLECTION, detectCategoryFromText } from '@/server/images/contextual-photos';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = (searchParams.get('query') || 'bisnis').toLowerCase().trim();

    // 1. Jika ada API Key Unsplash di environment
    const unsplashKey = process.env.UNSPLASH_ACCESS_KEY;
    if (unsplashKey) {
      try {
        const res = await fetch(
          `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=15&orientation=squarish`,
          {
            headers: {
              Authorization: `Client-ID ${unsplashKey}`,
            },
          },
        );
        if (res.ok) {
          const data = await res.json();
          if (data.results && data.results.length > 0) {
            const photos = data.results.map((item: any) => ({
              url: item.urls.regular,
              alt: item.alt_description || query,
              photographer: item.user?.name || 'Unsplash Photographer',
            }));
            return NextResponse.json({ success: true, photos });
          }
        }
      } catch (apiErr) {
        console.warn('[unsplash] API search error, using curated fallback:', apiErr);
      }
    }

    // 2. Intelligent Category Matching from Extensive Topic Collections
    const detectedCategory = detectCategoryFromText(query);
    const primaryUrls = TOPIC_PHOTO_COLLECTION[detectedCategory] || TOPIC_PHOTO_COLLECTION.KULINER || [];

    const primaryPhotos = primaryUrls.map((url, i) => ({
      url,
      alt: `${query} photo #${i + 1}`,
      photographer: 'InstaDeck HD Stock',
    }));

    // Kumpulkan foto pelengkap dari kategori terdekat
    const fallbackCategory =
      detectedCategory.includes('RENDANG') || detectedCategory.includes('NASI') || detectedCategory.includes('AYAM') || detectedCategory.includes('SATE') || detectedCategory.includes('BAKSO')
        ? 'KULINER'
        : detectedCategory.includes('AI') || detectedCategory.includes('CODING')
        ? 'DESIGN_UIUX'
        : detectedCategory.includes('FITNESS') || detectedCategory.includes('RUNNING')
        ? 'DIET_NUTRISI'
        : detectedCategory.includes('SKINCARE')
        ? 'FASHION'
        : 'BISNIS';

    const fallbackUrls = (TOPIC_PHOTO_COLLECTION[fallbackCategory] || []).filter((u) => !primaryUrls.includes(u));
    const fallbackPhotos = fallbackUrls.map((url, i) => ({
      url,
      alt: `${query} stock #${i + 1}`,
      photographer: 'InstaDeck HD Stock',
    }));

    const allPhotos = [...primaryPhotos, ...fallbackPhotos];

    return NextResponse.json({
      success: true,
      photos: allPhotos.slice(0, 12),
    });
  } catch (err: any) {
    console.error('[stock-photos] error:', err);
    return NextResponse.json(
      { error: err?.message || 'Gagal mencari foto stok.' },
      { status: 500 },
    );
  }
}
