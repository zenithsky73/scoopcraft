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
  niche?: string;
  contentType?: string;
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

  const prompt = [
    'Anda adalah Content Strategist & Growth Expert media sosial profesional di Instagram, Facebook & Threads.',
    'Buatlah rencana kalender kampanye konten ' + duration + ' HARI BERTURUT-TURUT untuk tema: "' + input.topic + '".',
    input.niche ? '- Target Niche / Industri: ' + input.niche : '',
    input.contentType ? '- Fokus Tipe Konten: ' + input.contentType : '',
    '',
    '=== INSTRUKSI OUTPUT CEPAT & PRESISI ===',
    '1. Hasilkan persis ' + duration + ' hari (Hari 1 sampai Hari ' + duration + '), masing-masing dengan sudut pandang (angle) dan topik unik yang bervariasi.',
    '2. Variasikan pilar konten: PROMOTION, EDUCATION, STORYTELLING, INTERACTION, TESTIMONIAL.',
    '3. Format output WAJIB JSON ringkas persis:',
    '{',
    '  "posts": [',
    '    {',
    '      "day": 1,',
    '      "title": "Judul Topik Harian",',
    '      "headline": "Headline Hook Cover Carousel",',
    '      "category": "KULINER",',
    '      "pillar": "PROMOTION",',
    '      "keyPoint1": "Poin utama atau keunggulan produk/menu",',
    '      "keyPoint2": "Detail rasa/fitur atau cara menikmati",',
    '      "caption": "Caption Instagram menarik dengan hook, isi singkat, dan ajakan interaksi.",',
    '      "hashtags": ["#Brand", "#Promo", "#Kuliner", "#Viral"],',
    '      "cta": "Simpan postingan ini & order via link di bio!",',
    '      "photoQuery": "food photography delicious gourmet"',
    '    }',
    '  ]',
    '}'
  ].filter(Boolean).join('\n');

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
        // Strict 8-second timeout guard so serverless execution never hangs on Vercel
        const geminiPromise = ai.models.generateContent({
          model: modelCandidate,
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          config: {
            responseMimeType: 'application/json',
          },
        });

        const timeoutPromise = new Promise<null>((resolve) =>
          setTimeout(() => resolve(null), 8000)
        );

        const response: any = await Promise.race([geminiPromise, timeoutPromise]);
        if (!response || !response.text) {
          console.warn('[Campaign Generator]: Gemini timeout or empty response, switching to fast fallback');
          break;
        }

        const parsed = JSON.parse(response.text || '{}');
        const rawPosts = parsed.posts || parsed.days || (Array.isArray(parsed) ? parsed : null);

        if (Array.isArray(rawPosts) && rawPosts.length >= Math.min(duration, 7)) {
          posts = rawPosts.slice(0, duration).map((p: any, idx: number) => {
            const dayDate = new Date(start);
            dayDate.setDate(dayDate.getDate() + idx);
            const dateStr = dayDate.toISOString().slice(0, 10);

            const dayTitle = p.title || ('Hari ke-' + (idx + 1) + ': ' + input.topic);
            const dayHeadline = p.headline || p.title || (input.topic + ' #' + (idx + 1));
            const key1 = p.keyPoint1 || p.body1 || 'Bahan segar pilihan dan keunggulan racikan khusus.';
            const key2 = p.keyPoint2 || p.body2 || 'Tekstur lembut dengan cita rasa yang bikin nagih.';
            const dayCta = p.cta || 'Simpan postingan ini & coba menu ini sekarang!';

            const slides = [
              {
                index: 0,
                title: dayHeadline,
                body: 'Sorotan menu & topik spesial hari ini untuk Anda.',
                statHighlight: 'Day ' + (idx + 1),
              },
              {
                index: 1,
                title: 'Sorotan & Keunggulan',
                body: key1,
                statHighlight: 'Poin 01',
              },
              {
                index: 2,
                title: 'Rahasia Kenikmatan',
                body: key2,
                statHighlight: 'Poin 02',
              },
              {
                index: 3,
                title: 'Ayo Coba Sekarang',
                body: dayCta,
                statHighlight: 'Action',
              },
            ];

            return {
              day: idx + 1,
              date: dateStr,
              time: preferredTime,
              title: dayTitle,
              headline: dayHeadline,
              category: p.category || 'KULINER',
              slides,
              caption: p.caption || ('Yuk nikmati ' + dayTitle + ' hari ini! Simpan postingan ini ya! ✨'),
              hashtags: Array.isArray(p.hashtags) && p.hashtags.length > 0
                ? p.hashtags
                : ['#InstaDeckPRO', '#KontenHarian', '#PromoSpesial', '#InspirasiBisnis'],
              cta: dayCta,
              photoQuery: p.photoQuery || (input.topic + ' aesthetic'),
            };
          });
          break;
        }
      } catch (err: any) {
        console.warn('[Campaign Generator]: Model ' + modelCandidate + ' error:', err?.message);
      }
    }
  }

  // Jika AI belum menghasilkan (atau timeout/error), gunakan smart fallback generator lokal
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

/**
 * Smart local generator if external AI API is unavailable / times out
 * Menghasilkan hingga 30 variasi menu / topik harian secara cerdas & instan (<50ms)
 */
function generateLocalCampaignFallback(
  topic: string,
  duration: number,
  start: Date,
  preferredTime: string
): CampaignDayPost[] {
  const isCoffee = /kopi|cafe|coffee|fore|latte|espresso|americano|cappuccino|minuman/i.test(topic);
  const isFood = isCoffee || /resep|makan|masak|kuliner|kue|dapur|padang|rendang|resto/i.test(topic);

  const coffeeTitles = [
    { title: 'Iced Aren Latte Creamy Spesial', sub: 'Espresso bold berpadu gula aren organik & susu segar', query: 'iced coffee latte milk aesthetic' },
    { title: 'Promo Buy 1 Get 1 Teman Nongkrong', sub: 'Beli 1 Signature Coffee Gratis 1 Refreshing Tea', query: 'two coffee cups cafe table' },
    { title: 'Pandan Latte Aromatik Khas Nusantara', sub: 'Sentuhan aroma pandan wangi dengan shot espresso mantap', query: 'green matcha coffee drink' },
    { title: 'Cold Brew 12 Jam Ekstra Halus', sub: 'Seduhan dingin rendah asam yang ramah di lambung', query: 'cold brew coffee glass ice' },
    { title: 'Caramel Macchiato Drizzle Manis Gurih', sub: 'Lapisan foam tebal dengan lelehan saus karamel lezat', query: 'caramel macchiato coffee cup' },
    { title: 'Croissant Butter Hangat Pendamping Kopi', sub: 'Pastry renyah berlapis dengan aroma butter wangi', query: 'croissant bakery cafe' },
    { title: 'Manual Brew V60 Single Origin Gayo', sub: 'Notes fruity & floral dari biji kopi arabika terbaik', query: 'pour over v60 coffee brewing' },
    { title: 'Avocado Coffee Float Lembut Menggoda', sub: 'Perpaduan alpukat creamy, espresso, dan es krim vanila', query: 'avocado coffee dessert' },
    { title: 'Diskon 30% Paket Sarapan Produktif', sub: 'Kopi favorit + Roti panggang untuk awali hari penuh energi', query: 'breakfast coffee toast cafe' },
    { title: 'Dark Mocha Chocolate Belgia Kaya Rasa', sub: 'Kombinasi cokelat hitam premium dan espresso pekat', query: 'mocha chocolate coffee cup' },
    { title: 'Rahasia Biji Kopi Fresh Roasted Kami', sub: 'Disangrai dengan profil medium roast untuk aroma maksimal', query: 'roasted coffee beans macro' },
    { title: 'Hazelnut Cream Frappe Dingin Segar', sub: 'Blended coffee dengan sensasi gurih kacang hazelnut', query: 'frappuccino whipped cream cup' },
    { title: 'Americano On The Rocks Pembakar Semangat', sub: 'Pilihan pas untuk Anda yang butuh fokus tinggi tanpa kalori', query: 'iced americano glass' },
    { title: 'Dirty Chai Latte Rempah Hangat Menenangkan', sub: 'Eksotisme rempah chai tea disiram espresso shot', query: 'chai latte spices cup' },
    { title: 'Voucher Khusus Follower Instagram Hari Ini', sub: 'Tunjukkan postingan ini ke barista dan klaim diskon 20%', query: 'barista making coffee cafe' },
    { title: 'Spanish Latte Manis Susu Kental Manis', sub: 'Gaya kopi khas Spanyol yang creamy dan disukai semua orang', query: 'spanish latte condensed milk glass' },
    { title: 'Behind The Scenes: Kebersihan Mesin Espresso', sub: 'Standar kalibrasi & sanitasi tinggi demi cita rasa konsisten', query: 'espresso machine cafe clean' },
    { title: 'Earl Grey Milk Tea Alternatif Segar', sub: 'Aroma teh bergamot wangi berpadu susu creamy lembut', query: 'milk tea boba glass' },
    { title: 'Kuis Tebak Menu Berhadiah Kopi Gratis', sub: 'Tulis tebakanmu di kolom komentar dan menangkan voucher', query: 'coffee beans hands holding' },
    { title: 'Affogato: Espresso Panas Guyur Gelato', sub: 'Dessert klasik Italia penutup makan siang yang mewah', query: 'affogato ice cream espresso' },
    { title: 'Promo Bundling 4 Cup Buat Sekantor', sub: 'Pesan rame-rame lebih hemat, free ongkir radius 3 km', query: 'multiple coffee cups table' },
    { title: 'Oat Milk Upgrade untuk Kamu yang Vegan', sub: 'Susu oat ramah lactose intolerance dengan rasa nutty gurih', query: 'oat milk latte pouring' },
    { title: 'Espresso Tonic Soda Dingin Menyegarkan', sub: 'Sensasi sparkling water segar berpadu crema espresso', query: 'espresso tonic glass lime' },
    { title: 'Review Jujur Pelanggan Setia Minggu Ini', sub: '"Kopinya selalu pas dan baristanya ramah banget!"', query: 'happy customer coffee shop' },
    { title: 'Trik Bikin Latte Art Sederhana di Rumah', sub: 'Teknik frothing susu tanpa mesin mahal untuk pemula', query: 'latte art heart coffee' },
    { title: 'Promo Happy Hour 14:00 - 17:00 WIB', sub: 'Sore santai makin hemat dengan potongan harga spesial', query: 'cafe interior cozy evening' },
    { title: 'Matcha Espresso Fusion Dua Warna Cantik', sub: 'Gradasi hijau matcha Uji dan cokelat espresso yang aesthetic', query: 'matcha espresso fusion layered' },
    { title: 'Perjalanan Petani Kopi Lokal Mitra Kami', sub: 'Mendukung kesejahteraan petani kopi lereng gunung lokal', query: 'coffee plantation farmer hands' },
    { title: 'Paket Kopi Botolan 1 Liter Stok Kulkas', sub: 'Siap minum kapan saja untuk menemani lembur / kerja remote', query: 'bottled coffee 1 liter bottle' },
    { title: 'Terima Kasih 1 Bulan Penuh Bersama Kami', sub: 'Nantikan kejutan menu baru dan promo seru bulan depan!', query: 'coffee cheers friends cafe' },
  ];

  const generalTopics = [
    { title: 'Pondasi & Rahasia Keberhasilan Utama', sub: 'Langkah awal yang paling menentukan hasil jangka panjang' },
    { title: 'Strategi Praktis 3 Langkah Eksekusi', sub: 'Panduan yang bisa langsung Anda terapkan hari ini' },
    { title: '3 Kesalahan Fatal yang Sering Terjadi', sub: 'Hindari jebakan ini agar tidak buang-buang waktu & biaya' },
    { title: 'Rekomendasi Tools & Alat Terbaik 2026', sub: 'Senjata rahasia untuk mempermudah produktivitas harian' },
    { title: 'Studi Kasus Nyata: Dari Nol Hingga Sukses', sub: 'Pelajari pola keberhasilan yang terbukti di lapangan' },
    { title: 'Tips Cerdas Menghemat Waktu & Tenaga', sub: 'Otomatisasi hal-hal kecil untuk fokus pada prioritas besar' },
    { title: 'Cara Meningkatkan Efisiensi 2x Lipat', sub: 'Trik terstruktur yang telah diuji oleh para profesional' },
    { title: 'Mitos Populer vs Fakta Sebenarnya', sub: 'Bongkar kesalahpahaman umum yang sering beredar' },
    { title: 'Daftar Checklist Harian Wajib Dicoba', sub: 'Centang semua poin ini sebelum Anda memulai hari' },
    { title: 'Q&A: Menjawab Pertanyaan Paling Sering Muncul', sub: 'Solusi tuntas untuk kendala yang sering Anda hadapi' },
    { title: 'Kisah Inspiratif & Pelajaran Berharga', sub: 'Mengubah tantangan berat menjadi peluang emas' },
    { title: 'Formula Rahasia yang Jarang Diketahui Publik', sub: 'Framework berpikir untuk hasil yang konsisten' },
    { title: 'Evaluasi & Refleksi Pertengahan Bulan', sub: 'Ukur metrik perkembangan Anda dan sesuaikan strategi' },
    { title: 'Panduan Lengkap Langkah Demi Langkah', sub: 'Cocok untuk pemula yang ingin langsung praktek' },
    { title: 'Trik Tingkat Lanjut untuk Hasil Maksimal', sub: 'Strategi optimasi mendalam bagi yang sudah berpengalaman' },
    { title: 'Cara Mengatasi Hambatan & Rasa Jenuh', sub: 'Jaga motivasi dan konsistensi agar tetap di jalur kemenangan' },
    { title: 'Rekomendasi Pilihan Terbaik Minggu Ini', sub: 'Kurasi pilihan terbaik yang patut Anda coba sekarang' },
    { title: 'Peluang Baru yang Sedang Booming', sub: 'Manfaatkan momentum sebelum kompetisi semakin ketat' },
    { title: 'Transformasi Nyata Sebelum dan Sesudah', sub: 'Bukti nyata bagaimana strategi ini bekerja efektif' },
    { title: 'Behind The Scenes: Proses Kerja Kami', sub: 'Dedikasi dan standar kualitas tinggi di balik layar' },
    { title: '5 Kebiasaan Kecil Berdampak Eksponensial', sub: 'Efek bola salju dari kedisiplinan sederhana harian' },
    { title: 'Kumpulan Template & Format Siap Pakai', sub: 'Tinggal salin dan gunakan untuk kebutuhan Anda' },
    { title: 'Tantangan 7 Hari Menuju Perubahan Nyata', sub: 'Ikuti tantangan ini dan rasakan perbedaannya' },
    { title: 'Cara Mengukur Hasil dengan Data Akurat', sub: 'Jangan pakai asumsi, gunakan data untuk keputusan tepat' },
    { title: 'Diskusi Komunitas: Apa Pendapat Anda?', sub: 'Tuliskan pengalaman dan sudut pandang Anda di komentar' },
    { title: 'Analisis Tren & Prospek Masa Depan', sub: 'Persiapkan diri menyambut arah perkembangan terbaru' },
    { title: 'Solusi Cepat untuk Masalah Mendesak', sub: 'Pertolongan pertama ketika rencana tidak berjalan mulus' },
    { title: 'Pelajaran Terpenting Bulan Ini', sub: 'Rangkuman intisari berharga yang tidak boleh dilupakan' },
    { title: 'Action Plan Konkret untuk Bulan Depan', sub: 'Siapkan target baru dan peta jalan pencapaiannya' },
    { title: 'Apresiasi & Ucapan Terima Kasih Spesial', sub: 'Terima kasih atas dukungan luar biasa Anda semua' },
  ];

  const list: CampaignDayPost[] = [];
  for (let i = 0; i < duration; i++) {
    const dayDate = new Date(start);
    dayDate.setDate(dayDate.getDate() + i);
    const dateStr = dayDate.toISOString().slice(0, 10);

    const item = isFood
      ? coffeeTitles[i % coffeeTitles.length]
      : { title: topic + ': ' + generalTopics[i % generalTopics.length].title, sub: generalTopics[i % generalTopics.length].sub, query: topic + ' aesthetic modern' };

    const slides = [
      {
        index: 0,
        title: item.title,
        body: item.sub,
        statHighlight: 'Day ' + (i + 1),
      },
      {
        index: 1,
        title: 'Keunggulan Utama',
        body: isFood ? 'Dibuat dari bahan segar berkualitas tinggi dengan racikan standar terbaik.' : 'Fondasi terpenting yang wajib dipahami sebelum melangkah lebih jauh.',
        statHighlight: 'Poin 01',
      },
      {
        index: 2,
        title: 'Detail & Tips Praktis',
        body: isFood ? 'Nikmati selagi fresh untuk pengalaman rasa yang maksimal dan menggugah selera.' : 'Terapkan secara konsisten untuk melihat peningkatan performa yang nyata.',
        statHighlight: 'Poin 02',
      },
      {
        index: 3,
        title: 'Langkah Selanjutnya',
        body: isFood ? 'Kunjungi outlet kami atau pesan via aplikasi online sekarang juga!' : 'Simpan postingan ini dan bagikan ke rekan Anda yang membutuhkan!',
        statHighlight: 'Action',
      },
    ];

    list.push({
      day: i + 1,
      date: dateStr,
      time: preferredTime,
      title: item.title,
      headline: item.title,
      category: isFood ? 'KULINER' : 'EDUKASI',
      slides,
      caption: isFood
        ? ('Nikmati ' + item.title + ' hari ini! ' + item.sub + '. Yuk langsung cobain atau pesan sekarang ya! Jangan lupa simpan postingan ini ❤️☕')
        : ('Hari ke-' + (i + 1) + ': ' + item.title + '. ' + item.sub + '. Simak penjelasan lengkapnya pada slide carousel di atas! 💡'),
      hashtags: isFood
        ? ['#KopiKekinian', '#CafeAesthetic', '#PromoKopi', '#ForeCoffee', '#KulinerViral']
        : ['#TipsBisnis', '#Edukasi', '#KontenHarian', '#InspirasiBisnis', '#InstaDeckPRO'],
      cta: 'Simpan postingan ini & ikuti kami untuk konten harian lainnya!',
      photoQuery: item.query || (topic + ' aesthetic'),
    });
  }

  return list;
}
