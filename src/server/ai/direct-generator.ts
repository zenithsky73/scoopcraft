import 'dotenv/config';
import type { DesignStyle, OutputFormat } from '@prisma/client';
import { GoogleGenAI } from '@google/genai';
import { db } from '@/server/db';
import { scrapeArticleFast } from '@/server/scraper/fast-scraper';
import { SLIDES } from '@/server/design/deck';
import { consumeQuota } from '@/server/billing/quota';
import { getContextualPhotoForSlide, detectCategoryFromText } from '@/server/images/contextual-photos';
import { STYLES } from '@/config/styles';

export type InputMode = 'url' | 'text' | 'prompt';

export type GenerateDirectInput = {
  userId: string;
  mode: InputMode;
  url?: string;
  rawText?: string;
  rawTitle?: string;
  prompt?: string;
  tone?: string;
  niche?: string;
  contentType?: string;
  targetAudience?: string;
  style: DesignStyle;
  format?: OutputFormat;
  slides?: number;
};

export type GeneratedDeckResult = {
  category: string;
  headline: string;
  feedCopy: string;
  caption: string;
  hashtags: string[];
  cta: string;
  slides: {
    index: number;
    title: string;
    body: string;
    statHighlight?: string;
    quote?: string;
    photoKeyword?: string;
  }[];
};

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY belum terpasang.');
  }
  return new GoogleGenAI({ apiKey });
}

export async function generateDirect(input: GenerateDirectInput) {
  const slidesCount = Math.min(Math.max(input.slides ?? 5, SLIDES.min), SLIDES.max);
  let articleTitle = '';
  let articleContent = '';
  let articleSource = 'InstaDeck PRO';
  let articleUrl = input.url || `https://instadeck.id/c/${Date.now()}`;
  let articleImageUrl: string | null = null;
  let articleImages: string[] = [];
  let articleAuthor = 'Kreator';
  let articlePrice = '';

  // 1. Resolve Content based on Mode
  if (input.mode === 'url' && input.url) {
    try {
      const scraped = await scrapeArticleFast(input.url);
      articleTitle = scraped.title;
      articleContent = scraped.content;
      articleSource = scraped.source || 'Website';
      articleUrl = scraped.url;
      articleImageUrl = scraped.imageUrl || null;
      articleImages = scraped.images || (scraped.imageUrl ? [scraped.imageUrl] : []);
      articleAuthor = scraped.author || 'Kreator';
      articlePrice = scraped.price || '';
    } catch (scrapeErr: any) {
      console.warn('[Direct Generator Scraper Fallback]:', scrapeErr?.message);
      const cleanUrl = input.url.replace(/^https?:\/\//, '').split(/[?#]/)[0];
      const segments = cleanUrl.split('/').filter(Boolean);
      const slug = decodeURIComponent(segments.pop() || cleanUrl).replace(/[-_]/g, ' ');

      articleTitle = slug.charAt(0).toUpperCase() + slug.slice(1);
      articleContent = `Materi dari tautan: ${input.url}. Rangkumlah poin-poin wawasan penting dan menarik ke dalam 5 slide carousel media sosial.`;
      articleSource = segments[0] ? segments[0].replace('www.', '') : 'Web';
    }
  } else if (input.mode === 'text' && input.rawText) {
    articleTitle = input.rawTitle || input.rawText.split('\n')[0].slice(0, 120) || 'Wawasan Pilihan';
    articleContent = input.rawText;
    articleSource = 'Teks Langsung';
  } else if (input.mode === 'prompt' && input.prompt) {
    articleTitle = input.prompt.slice(0, 120);
    articleContent = `Topik/Ide Konten: "${input.prompt}".\nGaya Bahasa/Tone: "${input.tone || 'Inspiratif & Praktis'}".`;
    articleSource = 'InstaDeck AI';
  } else {
    articleTitle = 'Wawasan & Rekomendasi Pilihan';
    articleContent = 'Rangkuman wawasan menarik dan bernilai praktis untuk konten carousel media sosial.';
  }

  // 2. Direct Gemini Generation with Comprehensive Domain Awareness
  let deck!: GeneratedDeckResult;
  const fullText = `${articleTitle} ${articleContent}`;

  // Intent classification
  const isRecipe = /resep|masak|bumbu|dapur|kue|baking|rebus|tumis|bahan|takaran|goreng|panggang|rendang|nasi goreng|ayam|sambal|sate|bakso|soto|seblak|martabak|pempek/i.test(fullText);
  const isCoffeeCafe = /kopi|coffee|latte|cappuccino|espresso|cafe|kafe|barista|boba|matcha|tea/i.test(fullText);
  const isFnB = isRecipe || isCoffeeCafe || input.style === 'CULINARY' || /resto|restoran|warung|kuliner|f&b|catering|bakery|roti|minuman|makanan|snack/i.test(fullText);

  const isMarketplaceProduct =
    articleSource.toLowerCase().includes('shopee') ||
    articleSource.toLowerCase().includes('tokopedia') ||
    articleSource.toLowerCase().includes('tiktok') ||
    articleSource.toLowerCase().includes('lazada') ||
    articleUrl.includes('shopee') ||
    articleUrl.includes('tokopedia') ||
    articleUrl.includes('tiktok') ||
    articleUrl.includes('lazada') ||
    Boolean(articlePrice);

  const isEcommerce =
    isMarketplaceProduct ||
    ['SHOPEE_PROMO', 'RACUN_SHOPEE', 'PRODUCT_CATALOG', 'BRUTALIST_SALE', 'BEFORE_AFTER', 'TESTIMONIAL_CHAT', 'PRICE_TIER_TABLE', 'UNBOXING_POLAROID'].includes(input.style) ||
    /jual|promo|diskon|shopee|tokopedia|affiliate|produk|baju|sepatu|skincare|serum|harga|toko|olshop|review|racun|katalog|sale|paket|ongkir|order|checkout|beli|gamis|hoodie|tas|parfum|gadget|laptop|hp|casing|makeup|lipstik/i.test(fullText);

  let effectiveStyle = input.style || 'MODERN';
  if ((effectiveStyle === 'BREAKING_NEWS' || effectiveStyle === 'MODERN') && isMarketplaceProduct) {
    effectiveStyle = 'SHOPEE_PROMO';
  }

  const isAITools = /tools?\s*ai|ai\s*tools?|chatgpt|claude|midjourney|cursor|v0|gemini|otomasi|software|coding|aplikasi\s*ai/i.test(fullText);
  const isFitness = /fitness|gym|workout|lari|running|marathon|otot|diet|kalori|latihan|angkat beban|fat loss|protein/i.test(fullText);
  const isSkincare = /skincare|serum|kulit|jerawat|glowing|retinol|moisturizer|sunscreen|facial|makeup|beauty/i.test(fullText);
  const isTutorial =
    input.style === 'STEP_BY_STEP_GUIDE' ||
    /tutorial|panduan|langkah|step by step|how to|belajar|bikin|membuat|tahapan|cara\s+(bikin|membuat|daftar|install|setting|konfigurasi|optimasi)/i.test(fullText);

  const isTwitter =
    input.style === 'TWITTER_THREAD' ||
    /thread|utas|cuitan|cerita|kisah|pengalaman|curhat|opini|mindset|filosofi/i.test(fullText);

  try {
    const ai = getGeminiClient();

    let systemRole = `Anda adalah Executive Creative Director & Top Social Media Content Strategist handal Indonesia yang ahli menyusun konten carousel Instagram (Feed & Story), TikTok, dan Threads berbobot tinggi.`;
    let dynamicGuidelines = '';

    if (isRecipe) {
      systemRole = `Anda adalah Master Chef & Food Content Creator terkemuka pembuat konten resep masakan dan kuliner viral Indonesia. Anda selalu memberikan resep yang 100% NYATA, AKURAT, LENGKAP DENGAN TAKARAN BUMBU PRESISI, DAN LANGKAH MEMASAK ANTI-GAGAL.`;
      dynamicGuidelines = `PANDUAN KHUSUS RESEP MAKANAN & KULINER (WAJIB NYATA & LENGKAP):
- Materi ini adalah Resep Masakan: "${articleTitle}".
- Susun 5 slide langkah demi langkah yang sangat detail, nyata, dan menggugah selera:
  * Slide 0 (COVER): Nama masakan menggoda + waktu masak & estimasi biaya (contoh: "${articleTitle} — Gurih, Pedas & Bikin Nambah Nasi!").
  * Slide 1 (BAHAN-BAHAN & BUMBU LENGKAP): Tuliskan LENGKAP bahan utama (dengan gram/kg) dan bumbu halus dengan takaran presisi (contoh: bawang merah, bawang putih, cabai, kemiri, jahe, lengkuas, serai, daun jeruk, santan/minyak, garam, gula). Pada "statHighlight", isi durasi masak (contoh: "30 Menit", "100% Halal").
  * Slide 2 (PERSIAPAN & TUMIS BUMBU): Proses menghaluskan bumbu, marinasi, dan teknik menumis bumbu sampai matang/tanak dan wangi harum.
  * Slide 3 (PROSES MEMASAK & RAHASIA KELEZATAN): Teknik memasak utama agar bumbu meresap sempurna, takaran api (api sedang/kecil), durasi, dan tips rahasia chef agar masakan tidak alot/gagal.
  * Slide 4 (PENYAJIAN & TIPS SIMPAN): Saran penyajian terbaik (bersama nasi hangat, sambal, kerupuk) dan tips penyimpanan (bisa tahan berapa hari di kulkas/freezer).
- Setiap slide WAJIB menyertakan "photoKeyword" dalam Bahasa Inggris yang menggambarkan adegan visual slide tersebut (Slide 0: finished dish, Slide 1: raw spices and ingredients, Slide 2: sautéing in wok with steam, Slide 3: simmering in pot/pan, Slide 4: plated dish on dining table).`;
    } else if (isAITools) {
      systemRole = `Anda adalah Tech Lead & AI Specialist yang menyusun rekomendasi tools teknologi dan software produktivitas terkini.`;
      dynamicGuidelines = `PANDUAN KHUSUS TOOLS AI & TEKNOLOGI:
- Sebutkan NAMA TOOLS ASLI YANG TERKENAL (contoh: ChatGPT, Claude 3.5, Cursor AI, Midjourney, v0.dev, Perplexity, ElevenLabs, Canva AI, Notion AI).
- Jelaskan fitur unggulan nyata, use-case terbaik, dan kelebihan masing-masing tools secara padat dan berbobot.
- Hindari deskripsi generik tanpa nama tool.
- Setiap slide WAJIB menyertakan "photoKeyword" dalam Bahasa Inggris (Slide 0: glowing AI neural art, Slide 1-3: modern software UI/workspace, Slide 4: clean desk setup).`;
    } else if (isFitness) {
      systemRole = `Anda adalah Certified Personal Trainer & Sports Nutritionist profesional.`;
      dynamicGuidelines = `PANDUAN KHUSUS FITNESS, GYM & WORKOUT:
- Tuliskan nama gerakan latihan nyata (Bench Press, Squat, Deadlift, Dumbbell Curl, HIIT, Running Pace), jumlah set & repetisi (contoh: 3-4 Set x 8-12 Reps), dan tips form yang benar.
- Sertakan tips recovery atau nutrisi protein harian.
- Setiap slide WAJIB menyertakan "photoKeyword" dalam Bahasa Inggris (Slide 0: athlete hero, Slide 1: dumbbells/gym gear, Slide 2: workout form, Slide 3: recovery/nutrition, Slide 4: fitness tracking).`;
    } else if (isSkincare) {
      systemRole = `Anda adalah Dermatologist & Skincare Educator terpercaya.`;
      dynamicGuidelines = `PANDUAN KHUSUS SKINCARE & KECANTIKAN:
- Sebutkan kandungan bahan aktif nyata (Salicylic Acid, Niacinamide, Retinol, Hyaluronic Acid, Ceramide, Centella Asiatica) dan tahapan pemakaian yang benar (Cleanser -> Toner -> Serum -> Moisturizer -> Sunscreen).
- Setiap slide WAJIB menyertakan "photoKeyword" dalam Bahasa Inggris (Slide 0: serum bottle aesthetic, Slide 1: gentle cleanser, Slide 2: toner/hydration, Slide 3: active serum drops, Slide 4: glowing radiant skin).`;
    } else if (isEcommerce) {
      systemRole = `Anda adalah Top Carousel Content Creator & Affiliate Marketer No. 1 Indonesia. Anda sangat ahli membuat slide carousel viral bergaya "Racun Belanja", review jujur produk, rekomendasi hemat, dan promosi konversi tinggi.`;
      dynamicGuidelines = `PANDUAN KHUSUS RACUN PRODUK & PROMOSI E-COMMERCE:
- Target Produk: "${articleTitle}" ${articlePrice ? `(Harga: ${articlePrice})` : ''} dari platform ${articleSource || 'Marketplace'}.
- Susun 5 Slide:
  * Slide 0 (COVER): Hook viral bikin penasaran / racun belanja seru.
  * Slide 1 (KEUNGGULAN / SOLUSI): Kualitas bahan/manfaat utama. Pada "statHighlight", isi harga promo atau keunggulan utama.
  * Slide 2 (DETAIL VARIAN & SPESIFIKASI): Kupas isi kemasan, varian, kenyamanan pakai, atau keamanan.
  * Slide 3 (REVIEW & BUKTI KEPUASAN): Review jujur pemakaian, kepuasan pembeli, rating tinggi.
  * Slide 4 (OUTRO / CARA ORDER): Ajakan checkout sekarang mumpung ada promo diskon & gratis ongkir!`;
    } else {
      dynamicGuidelines = `ATURAN STRUKTUR 5 SLIDE SOSMED & CAROUSEL VIRAL:
- PENTING: Gunakan gaya bahasa creator media sosial / praktisi bisnis modern (luwes, menarik, padat wawasan, memicu rasa penasaran), BUKAN siaran berita atau redaksi jurnalistik formal!
- DILARANG KERAS menggunakan judul generik seperti "Latar Belakang", "Wawasan Emas", "Mekanisme Mendalam", "Topik ini penting".
1. Slide 0 (COVER): Headline hook memikat, mengundang rasa penasaran audiens, relevan dengan inti materi.
2. Slide 1 (POIN KUNCI / METRIK UTAMA): Sorot 1 wawasan penting, ide utama, atau angka/fakta terpenting pada "statHighlight" dengan penjelasan padat.
3. Slide 2 (PEMBAHASAN MENDALAM): Penjelasan praktis mengenai mekanisme, tips penerapan, atau langkah implementasi nyata.
4. Slide 3 (GOLDEN RULE / INSIGHT): Wawasan emas berbobot, trik rahasia, atau aturan penting yang menginspirasi audiens.
5. Slide 4 (OUTRO / KESIMPULAN): Rangkuman 1 kalimat padat dan ajakan bertindak (CTA simpan postingan, bagikan, atau follow akun).`;
    }

    let contextDirectives = '';
    if (input.niche) {
      contextDirectives += `\n- TARGET NICHE / INDUSTRI: ${input.niche}. Sesuaikan istilah dan persona dengan target industri ini.`;
    }
    if (input.contentType) {
      contextDirectives += `\n- PILAR / TIPE KONTEN: ${input.contentType}.`;
    }
    if (input.targetAudience) {
      contextDirectives += `\n- TARGET AUDIENS: ${input.targetAudience}`;
    }

    const prompt = `${systemRole}
Tugas Anda: Buat naskah carousel ${slidesCount} slide dengan isi yang 100% NYATA, SPESIFIK, MENDALAM, DAN SANGAT AKURAT berdasarkan materi berikut:

Judul/Topik: "${articleTitle}"
Sumber: "${articleSource}"
Kreator/Penulis: "${articleAuthor}"
Materi/Isi:
${articleContent.slice(0, 7000)}

${dynamicGuidelines}
${contextDirectives}

${input.tone ? `- Gaya bahasa: ${input.tone}` : ''}
- WAJIB: Caption media sosial harus padat, menarik, dan MAKSIMAL 450 karakter (DILARANG MELEBIHI 500 KARAKTER).
- WAJIB: Pada setiap slide, sertakan "photoKeyword" dalam Bahasa Inggris yang mendeskripsikan adegan visual yang cocok untuk slide tersebut!

Kembalikan HANYA format JSON valid berikut:
{
  "category": "${isRecipe ? 'KULINER' : isAITools ? 'TEKNOLOGI' : isFitness ? 'FITNESS' : isSkincare ? 'BEAUTY' : isEcommerce ? 'BISNIS' : 'EDUKASI'}",
  "headline": "Judul headline memikat untuk cover",
  "feedCopy": "Deskripsi singkat pengantar di cover",
  "caption": "Caption media sosial ringkas dengan hook, poin emoji rapi, dan CTA. WAJIB MAKSIMAL 450 KARAKTER.",
  "hashtags": ["#Tag1", "#Tag2", "#Tag3", "#Tag4", "#Tag5"],
  "cta": "${isEcommerce ? 'Klik link di bio untuk checkout & klaim voucher diskon!' : isRecipe ? 'Simpan resep ini buat menu masak besok!' : 'Simpan postingan ini & bagikan ke temanmu!'}",
  "slides": [
    {
      "index": 0,
      "title": "Judul Cover",
      "body": "Pengantar ringkas fakta utama.",
      "statHighlight": "${isRecipe ? '30 Menit' : isAITools ? 'Top Tools' : 'Sorotan'}",
      "photoKeyword": "descriptive english photo query for slide 0 cover"
    },
    {
      "index": 1,
      "title": "Judul Poin 1 / Bahan / Tools 1",
      "body": "Penjelasan detail poin pertama secara konkret.",
      "statHighlight": "${isRecipe ? 'Bahan Lengkap' : 'Poin 01'}",
      "photoKeyword": "descriptive english photo query for slide 1"
    },
    {
      "index": 2,
      "title": "Judul Poin 2 / Langkah / Tools 2",
      "body": "Penjelasan detail poin kedua secara konkret.",
      "statHighlight": "${isRecipe ? 'Tumis & Prep' : 'Poin 02'}",
      "photoKeyword": "descriptive english photo query for slide 2"
    },
    {
      "index": 3,
      "title": "Judul Poin 3 / Rahasia / Review",
      "body": "Penjelasan detail poin ketiga secara konkret.",
      "statHighlight": "${isRecipe ? 'Tips Rahasia' : 'Poin 03'}",
      "photoKeyword": "descriptive english photo query for slide 3"
    },
    {
      "index": 4,
      "title": "Penyajian / Kesimpulan",
      "body": "Saran penyajian terbaik dan kesimpulan 1 kalimat.",
      "statHighlight": "${isRecipe ? 'Siap Santap' : 'Rangkuman'}",
      "photoKeyword": "descriptive english photo query for slide 4"
    }
  ]
}`;

    const modelsToTry = [
      process.env.GEMINI_MODEL,
      'gemini-2.5-flash',
      'gemini-2.0-flash',
      'gemini-1.5-flash',
    ].filter(Boolean) as string[];

    let lastError: any = null;
    let generatedSuccessfully = false;

    for (const modelCandidate of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model: modelCandidate,
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          config: {
            responseMimeType: 'application/json',
          },
        });

        const jsonText = response.text || '{}';
        deck = JSON.parse(jsonText);

        if (Array.isArray(deck.slides) && deck.slides.length > 0) {
          generatedSuccessfully = true;
          break;
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`[Direct Generator]: Model ${modelCandidate} gagal (${err?.message}), mencoba model alternatif...`);
      }
    }

    if (!generatedSuccessfully || !deck!.slides || deck!.slides.length === 0) {
      throw lastError || new Error('Semua model AI Engine gagal menghasilkan slide.');
    }
  } catch (aiErr: any) {
    console.warn('[Direct Generator AI Fallback]: Menggunakan synthesizer kontekstual cerdas:', aiErr?.message);
    const cat = detectCategoryFromText(`${articleTitle} ${articleContent}`);
    const cleanTopic = articleTitle.replace(/[\\/:"*?<>|]/g, '').trim();

    if (isRecipe) {
      deck = {
        category: 'KULINER',
        headline: articleTitle,
        feedCopy: `Resep praktis, lezat, dan kaya bumbu rempah otentik yang bikin nagih!`,
        caption: `🍳 ${articleTitle}\n\nResep gurih mantap yang bikin nambah nasi! Yuk simpan resepnya dan langsung coba masak di rumah!\n\n👉 Simpan & Bagikan!`,
        hashtags: ['#ResepMasakan', '#KulinerViral', '#MasakPraktis', '#MenuHarian', '#ResepOtentik'],
        cta: 'Simpan resep ini buat menu masak besok!',
        slides: [
          { index: 0, title: articleTitle, body: `Resep masakan lezat dan kaya rasa yang mudah dibuat siapa saja di rumah.`, statHighlight: '30 Menit', photoKeyword: `${cleanTopic} delicious food plating` },
          { index: 1, title: 'Bahan-Bahan & Bumbu Halus', body: `Siapkan bahan utama segar dan bumbu halus (bawang merah, bawang putih, cabai, kemiri, serai, daun jeruk, dan garam/gula secukupnya).`, statHighlight: 'Bahan Segar', photoKeyword: 'fresh spices shallots garlic chili cutting board' },
          { index: 2, title: 'Tumis Bumbu Hingga Harum', body: `Panaskan minyak, tumis bumbu halus dengan api sedang hingga matang tanak, harum, dan mengeluarkan minyak alami.`, statHighlight: 'Langkah 01', photoKeyword: 'chef sauteing in hot wok pan with aromatic steam' },
          { index: 3, title: 'Proses Masak & Rahasia Meresap', body: `Masukkan bahan utama, masak dengan api kecil agar bumbu meresap sempurna hingga kuah menyusut dan bumbu mengental pekat.`, statHighlight: 'Tips Chef', photoKeyword: 'simmering stew sauce in pot cooking gently' },
          { index: 4, title: 'Saran Penyajian & Nikmati!', body: `Sajikan hangat bersama nasi putih pulen, taburan bawang goreng, dan sambal pelengkap untuk rasa terbaik!`, statHighlight: 'Siap Santap', photoKeyword: 'plated delicious indonesian dish on dining table with rice' },
        ],
      };
    } else if (isAITools) {
      deck = {
        category: 'TEKNOLOGI',
        headline: articleTitle,
        feedCopy: `Daftar tools AI terbaik untuk melipatgandakan produktivitas dan otomatisasi kerja harian!`,
        caption: `⚡ ${articleTitle}\n\nOtomatisasi tugas rumit dalam hitungan detik dengan rekomendasi tools AI pilihan ini!\n\n👉 Simpan postingan ini!`,
        hashtags: ['#ToolsAI', '#Produktivitas', '#OtomasiKerja', '#Teknologi', '#AI2026'],
        cta: 'Simpan postingan ini biar gak lupa!',
        slides: [
          { index: 0, title: articleTitle, body: `Deretan tools AI paling efektif yang wajib kamu coba untuk efisiensi maksimal.`, statHighlight: 'AI Tools', photoKeyword: 'glowing futuristic AI digital neural network interface' },
          { index: 1, title: '01. ChatGPT & Claude 3.5 Sonnet', body: `Asisten AI serba bisa untuk brainstorming ide, penulisan konten berkualitas tinggi, dan analisis data mendalam.`, statHighlight: 'All-in-One AI', photoKeyword: 'modern laptop displaying smart AI chatbot software' },
          { index: 2, title: '02. Midjourney & Canva Magic Studio', body: `Pembuat aset visual dan grafis memukau tanpa perlu skill desain tingkat lanjut. Cukup ketikkan prompt deskriptif!`, statHighlight: 'Desain Cepat', photoKeyword: 'creative digital art design tablet with colorful UI' },
          { index: 3, title: '03. Perplexity AI & Cursor Editor', body: `Mesin riset bertenaga AI dengan sitasi sumber akurat dan code assistant cerdas untuk developer modern.`, statHighlight: 'Riset & Coding', photoKeyword: 'developer coding on dark mode IDE monitor' },
          { index: 4, title: 'Kesimpulan & Rekomendasi Alur Kerja', body: `Gabungkan tools ini sesuai kebutuhan harianmu untuk menghemat hingga 10+ jam kerja setiap minggu!`, statHighlight: 'Mulai Sekarang', photoKeyword: 'minimalist clean workspace desk with macbook and coffee' },
        ],
      };
    } else if (isEcommerce) {
      deck = {
        category: 'BISNIS',
        headline: articleTitle,
        feedCopy: `Spill produk viral berkualitas dengan penawaran harga spesial!`,
        caption: `🛍️ ${articleTitle}\n\nProduk berkualitas dengan rating terbaik dan harga promo spesial!\n\n👉 Cek link bio untuk order!`,
        hashtags: ['#RacunShopee', '#PromoSpesial', '#ProdukViral', '#ShopeeHaul'],
        cta: 'Klik link di bio untuk order & klaim voucher diskon!',
        slides: [
          { index: 0, title: articleTitle, body: `Solusi terbaik untuk kebutuhan harianmu dengan kualitas premium.`, statHighlight: 'Diskon 50%', photoKeyword: `${cleanTopic} product` },
          { index: 1, title: 'Kenapa Produk Ini Wajib Punya?', body: `Bahan berkualitas tinggi, nyaman dipakai, dan sudah terbukti disukai ribuan pembeli.`, statHighlight: 'Viral 10k+', photoKeyword: 'product quality detail' },
          { index: 2, title: 'Spesifikasi & Keunggulan Bahan', body: `Standar resmi, material premium awet tahan lama, dan bergaransi 100% original.`, statHighlight: '100% Original', photoKeyword: 'packaging unboxing product' },
          { index: 3, title: 'Review & Testimoni Pembeli', body: `Rating 4.9/5 dari ribuan pelanggan puas yang merekomendasikan produk ini.`, statHighlight: 'Rating 4.9/5', photoKeyword: 'happy customer lifestyle' },
          { index: 4, title: 'Promo Terbatas — Checkout Sekarang', body: `Dapatkan harga spesial diskon dan gratis ongkir sebelum promo berakhir!`, statHighlight: 'Beli Sekarang', photoKeyword: 'shopping store checkout' },
        ],
      };
    } else {
      deck = {
        category: cat,
        headline: articleTitle,
        feedCopy: `Simak ringkasan penting dan poin-poin utama seputar ${cleanTopic}.`,
        caption: `🔥 ${articleTitle}\n\nBerikut rangkuman dan poin-poin penting yang wajib Anda ketahui!\n\n👉 Simpan & Bagikan!`,
        hashtags: ['#WawasanTerkini', '#Edukasi', '#InstaDeckPRO', '#TrenViral', `#${cat}`],
        cta: 'Simpan postingan ini & bagikan ke temanmu!',
        slides: [
          { index: 0, title: articleTitle, body: `Rangkuman wawasan dan poin kunci mengenai ${cleanTopic}.`, statHighlight: 'Sorotan Utama', photoKeyword: `${cleanTopic} editorial modern` },
          { index: 1, title: `Pondasi & Ide Kunci Utama`, body: `Pahami konsep mendasar seputar ${cleanTopic} untuk menentukan arah strategi yang tepat.`, statHighlight: 'Poin Kunci', photoKeyword: 'creative strategy planning' },
          { index: 2, title: `Strategi & Penerapan Nyata`, body: `Langkah-langkah praktis yang bisa langsung diterapkan secara konsisten dalam rutinitas harian.`, statHighlight: 'Aksi Nyata', photoKeyword: 'business execution workspace' },
          { index: 3, title: `Trik & Optimasi Hasil`, body: `Hindari kesalahan umum dan manfaatkan wawasan praktis untuk hasil yang lebih efisien.`, statHighlight: 'Tips Pro', photoKeyword: 'focus productivity analysis' },
          { index: 4, title: `Kesimpulan & Rencana Aksi`, body: `Jadikan wawasan ini sebagai bekal berharga untuk mengambil keputusan terbaik ke depan.`, statHighlight: 'Siap Aksi', photoKeyword: 'modern office victory success' },
        ],
      };
    }
  }

  // 3. Enrich Each Slide with Multi-Photo & Dynamic Varied Layout Architectures
  const detectedCategory = detectCategoryFromText(
    `${articleTitle} ${deck.headline || ''} ${deck.category || ''} ${articleContent.slice(0, 500)}`
  );

  // 6 Pola Kombinasi Layout Beragam (Diacak Setiap Generate Agar Tidak Monoton)
  const LAYOUT_PATTERNS = [
    ['STAT_HERO', 'IMAGE_TOP_TEXT_BOTTOM', 'QUOTE_CARD', 'TEXT_CENTER', 'SPLIT_TWO_COL'],
    ['TEXT_CENTER', 'STAT_HERO', 'TEXT_BOTTOM', 'SPLIT_TWO_COL', 'QUOTE_CARD'],
    ['IMAGE_TOP_TEXT_BOTTOM', 'SPLIT_TWO_COL', 'TEXT_CENTER', 'STAT_HERO', 'QUOTE_CARD'],
    ['TEXT_BOTTOM', 'QUOTE_CARD', 'STAT_HERO', 'IMAGE_TOP_TEXT_BOTTOM', 'TEXT_CENTER'],
    ['SPLIT_TWO_COL', 'IMAGE_TOP_TEXT_BOTTOM', 'QUOTE_CARD', 'STAT_HERO', 'TEXT_BOTTOM'],
    ['QUOTE_CARD', 'TEXT_CENTER', 'IMAGE_TOP_TEXT_BOTTOM', 'STAT_HERO', 'SPLIT_TWO_COL'],
  ];
  const randomPatternIndex = Math.floor(Math.random() * LAYOUT_PATTERNS.length);
  const activePattern = LAYOUT_PATTERNS[randomPatternIndex];

  const enrichedSlides = (deck.slides || []).map((s: any, idx: number) => {
    const isCover = idx === 0;
    const isOutro = idx === deck.slides.length - 1;

    // Varian layout dinamis per slide konten
    const layoutVariant = isCover
      ? 'COVER'
      : isOutro
      ? 'OUTRO'
      : activePattern[(idx - 1) % activePattern.length];

    // SETIAP slide selalu mendapatkan foto produk asli (jika dari marketplace/link) atau foto topik editorial resolusi tinggi!
    let photoUrl: string | null = null;
    if (isCover && (articleImages[0] || articleImageUrl)) {
      photoUrl = articleImages[0] || articleImageUrl;
    } else if (articleImages.length > 0) {
      photoUrl = articleImages[idx % articleImages.length];
    } else {
      photoUrl = getContextualPhotoForSlide(
        detectedCategory,
        idx,
        `${s.title || ''} ${s.body || ''} ${articleTitle}`,
        isCover ? articleImageUrl : null,
        s.photoKeyword
      );
    }

    // Tag badge kontekstual sesuai varian tata letak & intent
    const slideTag = isCover
      ? (isEcommerce ? '🛍️ RACUN SHOPEE' : isRecipe ? '🍳 RESEP SPESIAL' : detectedCategory || '✨ REKOMENDASI')
      : isOutro
      ? (isEcommerce ? '🛒 CARA ORDER' : isRecipe ? '🍽️ SIAP SANTAP' : '📌 KESIMPULAN')
      : isEcommerce
      ? (['✨ KEUNGGULAN', '📦 DETAIL PRODUK', '⭐ REVIEW JUJUR', '🔥 PROMO SPESIAL'][idx - 1] || 'PRODUK')
      : isRecipe
      ? (['BAHAN-BAHAN', 'LANGKAH 01', 'LANGKAH 02', 'PENYAJIAN'][idx - 1] || 'RESEP')
      : isTutorial
      ? `LANGKAH 0${idx}`
      : isTwitter
      ? `Cuitan #${idx + 1}`
      : layoutVariant === 'STAT_HERO'
      ? '💡 FAKTA KUNCI'
      : layoutVariant === 'QUOTE_CARD'
      ? '✨ INSIGHT'
      : layoutVariant === 'TEXT_CENTER'
      ? '🎯 POIN FOKUS'
      : layoutVariant === 'SPLIT_TWO_COL'
      ? '⚡ ANALISIS'
      : '📌 PEMBAHASAN';

    return {
      index: idx,
      type: isCover ? 'COVER' : isOutro ? 'OUTRO' : 'POINT',
      layoutVariant,
      pointNumber: isCover || isOutro ? undefined : idx,
      tag: slideTag,
      headline: isCover ? deck.headline || s.title : undefined,
      lead: isCover ? deck.feedCopy || s.body : undefined,
      takeaway: s.title || (isRecipe ? `Tahap #${idx}` : `Poin Pembahasan #${idx + 1}`),
      supportingText: s.body,
      statHighlight: s.statHighlight || (isEcommerce ? 'Diskon Promo' : isRecipe ? '30 Menit' : undefined),
      sourceQuote: s.quote || undefined,
      ctaText: isOutro ? deck.cta : undefined,
      secondaryCta: isOutro ? (isEcommerce ? 'Stok terbatas, pesan sebelum kehabisan!' : isTwitter ? 'Retweet tweet pertama jika bermanfaat!' : isRecipe ? 'Simpan resep ini biar gak hilang!' : 'Ikuti untuk wawasan praktis harian.') : undefined,
      imageUrl: photoUrl,
      source: articleSource,
    };
  });

  const coverImageUrl = enrichedSlides[0]?.imageUrl || articleImageUrl || getContextualPhotoForSlide(detectedCategory, 0, articleTitle, null, deck.slides[0]?.photoKeyword);

  // 4. Safe DB Save
  let runId = `run_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
  let articleId = `art_${Date.now().toString(36)}`;
  let genContentId = `gen_${Date.now().toString(36)}`;

  try {
    const saved = await db.$transaction(async (tx) => {
      try {
        await consumeQuota(tx, input.userId);
      } catch (quotaErr) {
        console.warn('[DB Quota]:', quotaErr);
      }

      const article = await tx.article.upsert({
        where: { userId_url: { userId: input.userId, url: articleUrl } },
        create: {
          userId: input.userId,
          url: articleUrl,
          title: articleTitle,
          content: articleContent,
          source: articleSource,
          imageUrl: coverImageUrl,
          author: articleAuthor,
          lang: 'id',
          scrapedVia: input.mode,
        },
        update: {
          title: articleTitle,
          content: articleContent,
          imageUrl: coverImageUrl,
        },
      });

      let finalCaption = (deck.caption || '').trim();
      if (finalCaption.length > 500) {
        finalCaption = finalCaption.slice(0, 495).trim() + '...';
      }
      deck.caption = finalCaption;

      const genContent = await tx.generatedContent.create({
        data: {
          articleId: article.id,
          headline: deck.headline || articleTitle,
          feedCopy: deck.feedCopy || '',
          caption: finalCaption,
          hashtags: deck.hashtags || [],
          cta: deck.cta || 'Simpan & Bagikan!',
          angle: isEcommerce ? 'Promosi Produk & Racun Olshop' : isRecipe ? 'Resep Masakan & Kuliner Lezat' : 'Edukasi & Social Media Carousel',
          analysis: { topic: articleTitle, category: detectedCategory } as any,
          slides: enrichedSlides as any,
          visualUrl: coverImageUrl,
        },
      });

      const run = await tx.generationRun.create({
        data: {
          userId: input.userId,
          sourceUrl: articleUrl,
          status: 'DONE',
          requestedStyles: [input.style],
          requestedFormats: [input.format || 'FEED_PORTRAIT'],
          requestedSlides: slidesCount,
          stepsTotal: 5,
          stepsDone: 5,
          articleId: article.id,
          generatedContentId: genContent.id,
          completedAt: new Date(),
        },
      });

      return { run, article, genContent };
    });

    runId = saved.run.id;
    articleId = saved.article.id;
    genContentId = saved.genContent.id;
  } catch (dbErr: any) {
    console.warn('[Direct Generator DB Warning (Proceeding Safely)]: ', dbErr?.message);
  }

  return {
    runId,
    article: {
      id: articleId,
      title: articleTitle,
      source: articleSource,
      imageUrl: coverImageUrl,
      author: articleAuthor,
      url: articleUrl,
    },
    content: {
      id: genContentId,
      headline: deck.headline || articleTitle,
      caption: deck.caption,
      hashtags: deck.hashtags,
      cta: deck.cta,
      angle: isEcommerce ? 'Promosi & Rekomendasi' : isRecipe ? 'Resep Kuliner Lezat' : 'Edukasi & Carousel Viral',
      slides: enrichedSlides,
    },
    style: effectiveStyle,
    format: input.format || 'FEED_PORTRAIT',
  };
}
