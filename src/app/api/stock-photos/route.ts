import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

// Koleksi foto kurasi beresolusi tinggi dari Unsplash untuk berbagai topik umum
const CURATED_STOCKS: Record<string, { url: string; alt: string; photographer: string }[]> = {
  bisnis: [
    {
      url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1080&q=80',
      alt: 'Gedung pencakar langit modern distrik bisnis',
      photographer: 'Sean Pollock',
    },
    {
      url: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1080&q=80',
      alt: 'Diskusi rapat tim bisnis profesional',
      photographer: 'Austin Distel',
    },
    {
      url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1080&q=80',
      alt: 'Perencanaan analisis bisnis di atas meja kerja',
      photographer: 'Scott Graham',
    },
    {
      url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1080&q=80',
      alt: 'Kolaborasi tim kreatif startup',
      photographer: 'Annie Spratt',
    },
  ],
  teknologi: [
    {
      url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1080&q=80',
      alt: 'Papan sirkuit mikroprosesor teknologi modern',
      photographer: 'Alexandre Debiève',
    },
    {
      url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1080&q=80',
      alt: 'Kode biner data koding matriks',
      photographer: 'Markus Spiske',
    },
    {
      url: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=1080&q=80',
      alt: 'Laptop dan gadget workspace futuristik',
      photographer: 'Tianyi Ma',
    },
    {
      url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1080&q=80',
      alt: 'Gelombang digital AI abstrak neon',
      photographer: 'Milad Fakurian',
    },
  ],
  keuangan: [
    {
      url: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=1080&q=80',
      alt: 'Grafik saham dan pasar keuangan hijau',
      photographer: 'Maxim Hopman',
    },
    {
      url: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=1080&q=80',
      alt: 'Koin tabungan dan investasi cuan',
      photographer: 'Micheile Henderson',
    },
    {
      url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1080&q=80',
      alt: 'Trading crypto dan grafik pasar aset',
      photographer: 'Nicholas Cappello',
    },
  ],
  berita: [
    {
      url: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1080&q=80',
      alt: 'Koran dan media cetak warta berita',
      photographer: 'Roman Kraft',
    },
    {
      url: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1080&q=80',
      alt: 'Berita pers breaking news mikrofon',
      photographer: 'AbsolutVision',
    },
    {
      url: 'https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=1080&q=80',
      alt: 'Membaca portal berita di tablet',
      photographer: 'Filip Mishevski',
    },
  ],
  lifestyle: [
    {
      url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1080&q=80',
      alt: 'Secangkir kopi espresso hangat di kafe',
      photographer: 'Nolan Issac',
    },
    {
      url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1080&q=80',
      alt: 'Diskusi mahasiswa tentang kampus dan belajar',
      photographer: 'Headway',
    },
    {
      url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1080&q=80',
      alt: 'Work from cafe setup produktif',
      photographer: 'Christopher Gower',
    },
  ],
};

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = (searchParams.get('query') || 'bisnis').toLowerCase().trim();

    // 1. Jika ada API Key Unsplash di environment
    const unsplashKey = process.env.UNSPLASH_ACCESS_KEY;
    if (unsplashKey) {
      try {
        const res = await fetch(
          `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=12&orientation=squarish`,
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

    // 2. Intelligent Category Matching from Curated Stocks
    let matchedCategory = 'bisnis';
    if (query.includes('tech') || query.includes('ai') || query.includes('gadget') || query.includes('ponsel') || query.includes('komputer')) {
      matchedCategory = 'teknologi';
    } else if (query.includes('cuan') || query.includes('saham') || query.includes('uang') || query.includes('finansial') || query.includes('investasi') || query.includes('crypto')) {
      matchedCategory = 'keuangan';
    } else if (query.includes('berita') || query.includes('politik') || query.includes('koran') || query.includes('hukum') || query.includes('kasus')) {
      matchedCategory = 'berita';
    } else if (query.includes('kopi') || query.includes('kampus') || query.includes('kuliah') || query.includes('santai') || query.includes('hidup')) {
      matchedCategory = 'lifestyle';
    }

    const primaryList = CURATED_STOCKS[matchedCategory] || CURATED_STOCKS.bisnis;
    const allStocks = [
      ...primaryList,
      ...Object.values(CURATED_STOCKS)
        .flat()
        .filter((item) => !primaryList.includes(item)),
    ];

    return NextResponse.json({
      success: true,
      photos: allStocks.slice(0, 10),
    });
  } catch (err: any) {
    console.error('[stock-photos] error:', err);
    return NextResponse.json(
      { error: err?.message || 'Gagal mencari foto stok.' },
      { status: 500 },
    );
  }
}
