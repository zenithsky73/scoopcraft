import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';
import type { DesignStyle, OutputFormat } from '@prisma/client';

export type CampaignDayPost = {
  day: number;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  title: string;
  headline: string;
  category: string;
  slides: {
    index: number;
    title: string;
    body: string;
    statHighlight?: string;
  }[];
  caption: string;
  hashtags: string[];
  cta: string;
  photoQuery: string;
};

export type CampaignInput = {
  topic: string;
  durationDays?: number; // 7, 14, or 30 (default 30)
  startDate?: string; // YYYY-MM-DD
  preferredTime?: string; // HH:mm (default "09:00")
  platform?: 'INSTAGRAM' | 'FACEBOOK' | 'THREADS';
  style?: DesignStyle;
  format?: OutputFormat;
};

export type CampaignResult = {
  topic: string;
  durationDays: number;
  platform: 'INSTAGRAM' | 'FACEBOOK' | 'THREADS';
  days: CampaignDayPost[];
};

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
}

export async function generateCampaignPlan(input: CampaignInput): Promise<CampaignResult> {
  const duration = Math.min(Math.max(input.durationDays || 30, 7), 30);
  const preferredTime = input.preferredTime || '09:00';
  const platform = input.platform || 'INSTAGRAM';

  // Tentukan tanggal mulai (default: besok)
  let start = new Date();
  if (input.startDate) {
    const parsed = new Date(input.startDate);
    if (!isNaN(parsed.getTime())) start = parsed;
    else start.setDate(start.getDate() + 1);
  } else {
    start.setDate(start.getDate() + 1);
  }

  const prompt = `Anda adalah Direktur Konten Media Sosial dan Pakar Kalender Editorial Carousel Instagram/LinkedIn.
Tugas Anda: Buatlah rencana kampanye konten terstruktur selama ${duration} HARI BERTURUT-TURUT untuk tema: "${input.topic}".

=== ATURAN PENTING ===
1. Harus ada persis ${duration} hari (Hari 1 sampai Hari ${duration}), masing-masing dengan topik variasi yang BERBEDA dan UNIK, tidak boleh ada yang berulang.
2. Setiap hari adalah konten CAROUSEL 3-4 slide:
   - Slide 0 (Cover): Judul menarik + pengantar rasa penasaran
   - Slide 1 (Isi Utama/Poin 1): Bahan/langkah/poin penting pertama
   - Slide 2 (Isi Pendukung/Poin 2): Tips rahasia, variasi, atau data penting
   - Slide 3 (Outro/CTA): Ajakan simpan postingan & interaksi
3. Format output WAJIB JSON persis seperti format berikut:
{
  "posts": [
    {
      "day": 1,
      "title": "Judul Menu / Topik Singkat",
      "headline": "Headline Menarik & Menggugah Selera untuk Cover",
      "category": "KULINER",
      "slides": [
        { "index": 0, "title": "Headline Slide Cover", "body": "Pengantar ringkas fakta/menu.", "statHighlight": "Menu Hari ke-1" },
        { "index": 1, "title": "Bahan & Bumbu Kunci", "body": "Daftar bahan utama dan bumbu rahasia.", "statHighlight": "Langkah 1" },
        { "index": 2, "title": "Cara Masak Praktis", "body": "Instruksi singkat memasak anti gagal.", "statHighlight": "Pro-Tip" },
        { "index": 3, "title": "Sajikan Hangat!", "body": "Cocok dinikmati bersama nasi pulen hangat.", "statHighlight": "Sajikan" }
      ],
      "caption": "Caption Instagram lengkap dengan hook emosional, resep ringkas, dan ajakan simpan postingan.",
      "hashtags": ["#ResepMasakan", "#KulinerRumahan", "#MenuHarian", "#InspirasiMasak"],
      "cta": "Simpan resep ini untuk menu besok & share ke keluarga ya!",
      "photoQuery": "delicious indonesian food recipe"
    }
  ]
}`;

  const ai = getGeminiClient();
  let posts: CampaignDayPost[] = [];

  if (ai) {
    const modelsToTry = [
      process.env.GEMINI_MODEL,
      'gemini-2.5-flash',
      'gemini-2.0-flash',
      'gemini-1.5-flash',
    ].filter(Boolean) as string[];

    for (const modelCandidate of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model: modelCandidate,
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          config: {
            responseMimeType: 'application/json',
          },
        });

        const parsed = JSON.parse(response.text || '{}');
        const rawPosts = parsed.posts || parsed.days || (Array.isArray(parsed) ? parsed : null);

        if (Array.isArray(rawPosts) && rawPosts.length >= Math.min(duration, 7)) {
          posts = rawPosts.slice(0, duration).map((p: any, idx: number) => {
            const dayDate = new Date(start);
            dayDate.setDate(dayDate.getDate() + idx);
            const dateStr = dayDate.toISOString().slice(0, 10);

            return {
              day: idx + 1,
              date: dateStr,
              time: preferredTime,
              title: p.title || `Hari ke-${idx + 1}: ${input.topic}`,
              headline: p.headline || p.title || `${input.topic} Hari ke-${idx + 1}`,
              category: p.category || 'KULINER',
              slides: Array.isArray(p.slides) && p.slides.length > 0
                ? p.slides.map((s: any, sIdx: number) => ({
                    index: sIdx,
                    title: s.title || `Poin ${sIdx + 1}`,
                    body: s.body || 'Pembahasan menarik untuk slide ini.',
                    statHighlight: s.statHighlight || `Slide ${sIdx + 1}`,
                  }))
                : defaultSlides(p.title || input.topic, idx + 1),
              caption: p.caption || `Inspirasi ${input.topic} untuk hari ini. Simpan postingan ini ya!`,
              hashtags: Array.isArray(p.hashtags) && p.hashtags.length > 0
                ? p.hashtags
                : ['#NewslyAI', '#KontenHarian', '#InspirasiHariIni'],
              cta: p.cta || 'Simpan postingan ini & bagikan ke teman Anda!',
              photoQuery: p.photoQuery || `${input.topic} photography`,
            };
          });
          break;
        }
      } catch (err: any) {
        console.warn(`[Campaign Generator]: Model ${modelCandidate} gagal:`, err?.message);
      }
    }
  }

  // Jika AI belum menghasilkan (atau error), gunakan smart fallback generator lokal
  if (posts.length === 0) {
    posts = generateLocalCampaignFallback(input.topic, duration, start, preferredTime);
  }

  return {
    topic: input.topic,
    durationDays: posts.length,
    platform,
    days: posts,
  };
}

function defaultSlides(title: string, day: number) {
  return [
    {
      index: 0,
      title: `Hari ke-${day}: ${title}`,
      body: 'Inspirasi harian pilihan praktis yang mudah dibuat di rumah.',
      statHighlight: `Day ${day}`,
    },
    {
      index: 1,
      title: 'Bahan & Persiapan Kunci',
      body: 'Siapkan bahan segar berkualitas untuk hasil masakan yang maksimal dan lezat.',
      statHighlight: 'Bahan',
    },
    {
      index: 2,
      title: 'Langkah Pembuatan Praktis',
      body: 'Tumis bumbu hingga harum, masukkan bahan utama, lalu masak dengan api sedang hingga matang sempurna.',
      statHighlight: 'Proses',
    },
    {
      index: 3,
      title: 'Sajikan Selagi Hangat',
      body: 'Nikmati bersama keluarga tersayang. Selamat mencoba resep hari ini!',
      statHighlight: 'Sajikan',
    },
  ];
}

/**
 * Smart local generator if external AI API is unavailable
 * Menghasilkan hingga 30 variasi menu / topik harian secara cerdas
 */
function generateLocalCampaignFallback(
  topic: string,
  duration: number,
  start: Date,
  preferredTime: string
): CampaignDayPost[] {
  const isFood = /resep|makan|masak|kuliner|kue|dapur/i.test(topic);

  const foodTitles = [
    { title: 'Ayam Goreng Mentega Gurih Manis', query: 'butter chicken delicious' },
    { title: 'Sayur Asem Segar Khas Jawa', query: 'indonesian vegetable soup' },
    { title: 'Tumis Kangkung Terasi Pedas Gurih', query: 'stir fry water spinach' },
    { title: 'Sop Iga Sapi Kuah Bening Rempah', query: 'beef ribs soup indonesian' },
    { title: 'Tempe Bacem Legit Bumbu Meresap', query: 'tempeh traditional food' },
    { title: 'Udang Bakar Madu Pedas Manis', query: 'grilled honey shrimp' },
    { title: 'Capcay Kuah Kental Komplit Sayur', query: 'capcay mixed vegetables' },
    { title: 'Ikan Gurame Asam Manis Krispi', query: 'sweet sour crispy fish' },
    { title: 'Telur Balado Padang Merah Merona', query: 'spicy chili eggs balado' },
    { title: 'Cumi Saus Tiram Pedas Gurih', query: 'squid oyster sauce stirfry' },
    { title: 'Rawon Daging Sapi Kuah Hitam Khas Jatim', query: 'rawon black soup beef' },
    { title: 'Tahu Goreng Crispy Cabai Garam', query: 'crispy tofu salt pepper' },
    { title: 'Soto Ayam Lamongan Koya Gurih', query: 'soto ayam yellow soup' },
    { title: 'Buncis Krispi Telur Asin', query: 'salted egg green beans' },
    { title: 'Dendeng Balado Basah Daun Jeruk', query: 'indonesian spicy beef jerky' },
    { title: 'Pindang Patin Kuah Nanas Asam Segar', query: 'fish pineapple soup spicy' },
    { title: 'Bakwan Sayur Renyah Tahan Lama', query: 'crispy vegetable fritter' },
    { title: 'Nasi Goreng Kampung Spesial Telur Ceplok', query: 'fried rice egg traditional' },
    { title: 'Gulai Daun Singkong Teri Medan', query: 'cassava leaves curry' },
    { title: 'Ayam Rica-Rica Kemangi Pedas Nampol', query: 'spicy rica rica chicken' },
    { title: 'Sup Jagung Manis Kepiting Lembut', query: 'sweet corn crab soup' },
    { title: 'Oseng Mercon Daging Kikil Pedas Gila', query: 'super spicy beef stirfry' },
    { title: 'Sambal Goreng Kentang Ati Ampela', query: 'spicy potato chicken liver' },
    { title: 'Mie Goreng Seafood Spesial Resto', query: 'fried noodles seafood' },
    { title: 'Sop Buntut Sapi Kuah Kaldu Gurih', query: 'oxtail soup indonesian' },
    { title: 'Tongseng Kambing Tanpa Santan Gurih', query: 'mutton stew tongseng' },
    { title: 'Ayam Bakar Bumbu Rujak Manis Legit', query: 'grilled chicken spicy sweet' },
    { title: 'Perkedel Kentang Daging Lembut Anti Hancur', query: 'potato fritters indonesian' },
    { title: 'Gado-Gado Siram Bumbu Kacang Kental', query: 'gado gado salad peanut sauce' },
    { title: 'Es Teler Alpukat Nangka Segar Penutup', query: 'es teler avocado dessert' },
  ];

  const generalTopics = [
    'Pondasi & Mindset Dasar',
    'Strategi Praktis Langkah Demi Langkah',
    'Kesalahan Fatal yang Sering Terjadi',
    '3 Alat & Tools Rahasia Terbaik',
    'Studi Kasus Nyata & Pembelajaran',
    'Tips Menghemat Waktu & Tenaga',
    'Cara Meningkatkan Efisiensi 2x Lipat',
    'Mitos Populer vs Fakta Sebenarnya',
    'Daftar Checklist Harian Wajib',
    'Pertanyaan yang Sering Diajukan (FAQ)',
    'Kisah Inspiratif & Pelajaran Berharga',
    'Formula Rahasia yang Jarang Dibahas',
    'Review & Evaluasi Mingguan',
    'Panduan Lengkap untuk Pemula',
    'Trik Tingkat Lanjut untuk Ahli',
    'Cara Menghadapi Hambatan Terbesar',
    'Rekomendasi Terbaik Minggu Ini',
    'Peluang Baru yang Belum Banyak Diketahui',
    'Transformasi Nyata Sebelum dan Sesudah',
    'Wawancara & Insight Eksklusif',
    'Kebiasaan Kecil Berdampak Besar',
    'Kumpulan Template & Format Praktis',
    'Tantangan 7 Hari untuk Hasil Nyata',
    'Cara Mengukur Hasil dengan Akurat',
    'Strategi Mengatasi Rasa Jenuh & Malas',
    'Analisis Tren Terbaru & Prospek Masa Depan',
    'Solusi Cepat untuk Masalah Klasik',
    'Refleksi & Pelajaran Utama',
    'Rangkuman Intisari & Action Plan',
    'Visi Jangka Panjang & Rencana Bulan Depan',
  ];

  const list = [];
  for (let i = 0; i < duration; i++) {
    const dayDate = new Date(start);
    dayDate.setDate(dayDate.getDate() + i);
    const dateStr = dayDate.toISOString().slice(0, 10);

    const titleObj = isFood
      ? foodTitles[i % foodTitles.length]
      : { title: `${topic}: ${generalTopics[i % generalTopics.length]}`, query: `${topic} lifestyle` };

    list.push({
      day: i + 1,
      date: dateStr,
      time: preferredTime,
      title: titleObj.title,
      headline: isFood
        ? `Resep ${titleObj.title} Praktis & Lezat`
        : `Hari ke-${i + 1}: ${titleObj.title}`,
      category: isFood ? 'KULINER' : 'EDUKASI',
      slides: defaultSlides(titleObj.title, i + 1),
      caption: isFood
        ? `Yuk coba buat "${titleObj.title}" hari ini! Resep praktis, bahan mudah dicari, dan dijamin disukai seluruh keluarga. Jangan lupa simpan postingan ini ya! ❤️🍲`
        : `Hari ke-${i + 1}: Simak pembahasan penting seputar ${titleObj.title}. Bagikan dan simpan postingan ini jika bermanfaat! 💡`,
      hashtags: isFood
        ? ['#ResepHarian', '#MenuSehariHari', '#MasakanRumahan', '#KulinerIndonesia', '#InspirasiMasak']
        : ['#TipsBisnis', '#Edukasi', '#KontenHarian', '#Inspirasi', '#NewslyAI'],
      cta: 'Simpan postingan ini untuk referensi Anda!',
      photoQuery: titleObj.query,
    });
  }

  return list;
}
