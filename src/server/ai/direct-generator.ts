import 'dotenv/config';
import type { DesignStyle, OutputFormat } from '@prisma/client';
import { GoogleGenAI } from '@google/genai';
import { db } from '@/server/db';
import { scrapeArticleFast } from '@/server/scraper/fast-scraper';
import { SLIDES } from '@/server/design/deck';
import { consumeQuota } from '@/server/billing/quota';
import { getContextualPhotoForSlide, detectCategoryFromText } from '@/server/images/contextual-photos';
import { getAIThemeDef } from '@/config/ai-image-themes';
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
  aiVisualTheme?: string;
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
    articleTitle = input.prompt.slice(0, 100);
    articleContent = `Topik/Ide Konten: "${input.prompt}".\nGaya Bahasa/Tone: "${input.tone || 'Inspiratif & Praktis'}".`;
    articleSource = 'InstaDeck AI';
  } else {
    articleTitle = 'Wawasan & Rekomendasi Pilihan';
    articleContent = 'Rangkuman wawasan menarik dan bernilai praktis untuk konten carousel media sosial.';
  }

  // 2. Direct Gemini 2.5 Flash Turbo JSON Generation with Dynamic Slide Roles
  let deck!: GeneratedDeckResult;
  const isYouTube = articleSource.toLowerCase().includes('youtube') || articleUrl.includes('youtu');
  const fullText = `${articleTitle} ${articleContent}`;
  const styleDef = STYLES.find((s) => s.id === input.style);
  const styleCategory = styleDef?.category;

  // Intent classification
  const listCountMatch = fullText.match(/(\d+)\s*(tools?|alat|cara|tips|rekomendasi|langkah|ide|rahasia|alasan|aplikasi|strategi|skill|buku|film|website|prompt|resep|menu|tempat|wisata|kuliner|gadget)/i);
  const listCount = listCountMatch ? parseInt(listCountMatch[1], 10) : null;
  const isListicle =
    Boolean(listCountMatch) ||
    /(\d+)\s*(tools?|alat|cara|tips|rekomendasi|langkah|ide|rahasia|alasan|aplikasi|strategi|skill|buku|film|website|prompt|resep|menu|tempat|wisata|kuliner|gadget)/i.test(fullText) ||
    /kumpulan|daftar|rekomendasi|top\s*\d+/i.test(fullText);
  const isFnB =
    input.style === 'CULINARY' ||
    /fore|kopi|coffee|cafe|kafe|padang|rendang|resto|restoran|warung|kuliner|f&b|catering|bakery|roti|boba|matcha|minuman|makanan|snack|jajanan|sambal|ayam goreng|bebek|mie|nasi/i.test(fullText);

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

  const isRecipe = /resep|masak|bumbu|dapur|kue|baking|rebus|tumis/i.test(fullText) && !isFnB;

  const isTutorial =
    input.style === 'STEP_BY_STEP_GUIDE' ||
    /tutorial|panduan|langkah|step by step|how to|belajar|bikin|membuat|tahapan|cara\s+(bikin|membuat|daftar|install|setting|konfigurasi|optimasi)/i.test(fullText);

  const isTwitter =
    input.style === 'TWITTER_THREAD' ||
    /thread|utas|cuitan|cerita|kisah|pengalaman|curhat|opini|mindset|filosofi/i.test(fullText);

  try {
    const ai = getGeminiClient();

    let systemRole = `Anda adalah Executive Creative Director & Top Social Media Content Strategist handal Indonesia yang ahli menyusun konten carousel Instagram (Feed & Story), TikTok, dan Threads berbobot tinggi untuk brand, kreator, dan bisnis.`;
    let dynamicGuidelines = '';

    if (isEcommerce) {
      systemRole = `Anda adalah Top Carousel Content Creator & Affiliate Marketer No. 1 Indonesia (Shopee, TikTok Shop & Tokopedia). Anda sangat ahli membuat slide carousel viral bergaya "Racun Belanja", review jujur produk, rekomendasi hemat, dan promosi konversi tinggi. GAYA BAHASA HARUS 100% KONTEN SOSMED / INSTAGRAM CREATOR (LUWES, MENARIK, BIKIN PENASARAN), BUKAN BERITA/REDAKSI JURNALISTIK!`;
      dynamicGuidelines = `PANDUAN KHUSUS RACUN PRODUK & PROMOSI E-COMMERCE:
- Target Produk: "${articleTitle}" ${articlePrice ? `(Harga: ${articlePrice})` : ''} dari platform ${articleSource || 'Marketplace'}.
- JANGAN GUNAKAN gaya bahasa kaku, formal, atau berita redaksi. Gunakan bahasa creator media sosial yang akrab, persuasif, dan memicu interaksi/pembelian!
- Formula 5 Slide:
  * Slide 0 (COVER): Hook viral bikin penasaran / racun belanja seru (contoh: "Wajib Punya! ${articleTitle.slice(0, 35)}... Bikin Ketagihan! 🔥", "Spill Rekomendasi Paling Worth It Cuma ${articlePrice || 'Puluhan Ribuan'}!"). Tag: "🛍️ RACUN SHOPEE" atau "🔥 PROMO VIRAL". Lead: Buat 1 kalimat pembuka yang bikin orang langsung ingin geser slide berikutnya!
  * Slide 1 (KEUNGGULAN / SOLUSI): Kenapa produk ini wajib dibeli? Bahas rasa/kualitas/manfaat utamanya. Pada "statHighlight", isi dengan harga promo atau keunggulan utama (contoh: "${articlePrice || 'Hemat Banget'}", "100% Original", "Paling Laris"). Tag: "✨ KEUNGGULAN".
  * Slide 2 (DETAIL VARIAN & SPESIFIKASI): Kupas isi kemasan, varian rasa/warna, kenyamanan pakai, atau keamanan (BPOM/Halal/Garansi). Pada "statHighlight", isi dengan porsi/benefit (contoh: "Isi Ekstra", "Kemasan Praktis", "Material Premium"). Tag: "📦 DETAIL PRODUK".
  * Slide 3 (REVIEW & BUKTI KEPUASAN): Review jujur pemakaian, kepuasan pelanggan, atau rating tinggi. Pada "statHighlight", isi dengan rating (contoh: "Rating 4.9⭐", "Ribuan Terjual"). Tag: "⭐ REVIEW JUJUR".
  * Slide 4 (OUTRO / CARA ORDER): Ajakan checkout sekarang mumpung ada promo diskon & gratis ongkir! Pada "statHighlight", isi "Order Sekarang". Tag: "🛒 CHECKOUT". CTA: "Klik link di bio toko untuk order & klaim voucher diskonnya 👉".`;
    } else if (isFnB) {
      systemRole = `Anda adalah Senior F&B Marketer & Food Storyteller handal yang ahli mempromosikan Cafe (ala Fore Coffee), Restoran (ala Rumah Makan Padang), dan Bisnis Kuliner UMKM.`;
      dynamicGuidelines = `PANDUAN KHUSUS BISNIS F&B, CAFE & KULINER RESTO:
- Materi ini adalah promosi bisnis kuliner / cafe / restoran / F&B.
- Susun slide dengan formula visual storytelling F&B yang menggugah selera dan memicu nafsu makan / pesanan (order conversion):
  * Slide 0 (COVER): Visual hero & hook promo atau sensasi rasa menggoda (contoh: "Menu Best Seller yang Wajib Kamu Coba di [Nama Brand]!", "Sensasi Kopi Creamy yang Bikin Semangat Seharian ☕", "Paket Nasi Padang Rendang Komplit Cuma 25rb!").
  * Slide 1 (KEY USP / RAHASIA RASA & BAHAN): Keunggulan bahan segar, rempah otentik pilihan, atau biji kopi 100% Arabica berkualitas. Pada "statHighlight", isi klaim utama (contoh: "100% Halal", "Rempah Asli", "100% Arabica", "Tanpa Pengawet").
  * Slide 2 (DETAIL MENU & VARIAN FAVORIT): Pilihan varian favorit, topping, paket combo hemat, atau level kepedasan. Pada "statHighlight", cantumkan promo/harga (contoh: "Diskon 20%", "Harga Mulai 18rb", "Best Seller").
  * Slide 3 (SOCIAL PROOF / REVIEW PELANGGAN): Bukti kepuasan pelanggan, tekstur lembut daging / kesegaran minuman, atau review bintang 5. Pada "statHighlight", isi "Rating 4.9⭐" atau "1000+ Terjual".
  * Slide 4 (OUTRO / CARA ORDER & LOKASI): Info pemesanan mudah (tersedia di GoFood, GrabFood, ShopeeFood, Dine-In), jam buka & lokasi, serta ajakan "Klik link di bio untuk order sekarang & tag teman makan barengmu!".`;
    } else if (isRecipe) {
      systemRole = `Anda adalah Chef & Food Content Creator terkemuka pembuat konten resep masakan viral Indonesia.`;
      dynamicGuidelines = `PANDUAN KHUSUS RESEP MAKANAN & KULINER:
- Materi ini adalah resep masakan / kuliner lezat.
- Susun slide langkah demi langkah yang praktis dan menggugah selera:
  * Slide 0 (COVER): Nama masakan menggoda + waktu masak & estimasi biaya (contoh: "${articleTitle} — Gurih, Pedas & Bikin Nambah Nasi!").
  * Slide 1 (BAHAN & BUMBU): Rincian bahan pokok dan bumbu halus dengan takaran jelas. Pada "statHighlight", isi durasi masak (contoh: "20 Menit", "Budget Hemat").
  * Slide 2 (LANGKAH 1 & 2): Proses persiapan/marinasi dan penumisan bumbu sampai wangi.
  * Slide 3 (LANGKAH 3 & 4 + RAHASIA SEDAP): Teknik memasak agar bumbu meresap sempurna dan tips rahasia agar masakan tidak gagal/alot.
  * Slide 4 (PENYAJIAN & CTA): Saran penyajian terbaik bersama nasi hangat + ajakan "Simpan resep ini buat menu masak besok!".`;
    } else if (isTutorial) {
      systemRole = `Anda adalah Edukator & Praktisi Ahli yang menyusun panduan langkah demi langkah (Step-by-Step) praktis.`;
      dynamicGuidelines = `PANDUAN KHUSUS TUTORIAL & STEP-BY-STEP GUIDE:
- Materi ini adalah tutorial/panduan praktis.
  * Slide 0 (COVER): Hook hasil akhir yang akan dicapai pembaca.
  * Slide 1 (LANGKAH 01 - PERSIAPAN): Persiapan awal dan alat yang dibutuhkan (statHighlight: "Langkah 01").
  * Slide 2 (LANGKAH 02 - EKSEKUSI INTI): Cara melakukan langkah utama secara mendetail dan jelas (statHighlight: "Langkah 02").
  * Slide 3 (LANGKAH 03 - OPTIMASI & PRO-TIP): Trik rahasia agar hasil maksimal dan menghindari kesalahan umum (statHighlight: "Langkah 03").
  * Slide 4 (OUTRO): Hasil akhir yang didapat + CTA ajakan praktik dan simpan panduan.`;
    } else if (isTwitter) {
      systemRole = `Anda adalah Penulis Utas Twitter / X Viral terkemuka dengan puluhan ribu retweets.`;
      dynamicGuidelines = `PANDUAN KHUSUS UTAS TWITTER / X THREAD:
- Setiap slide adalah 1 cuitan bersambung yang saling berkaitan (Thread 🧵).
- Tulis dengan gaya bercerita personal, lugas, mengalir, dan bikin penasaran:
  * Slide 0 (TWEET 1 / HOOK): Hook pembuka tweet yang viral dan bikin penasaran (akhiri dengan "Sebuah utas 🧵").
  * Slide 1 (TWEET 2): Fakta pembuka dan latar belakang cerita.
  * Slide 2 (TWEET 3): Plot twist atau inti cerita yang mengejutkan.
  * Slide 3 (TWEET 4): Refleksi mendalam dan pelajaran penting yang bisa dipetik.
  * Slide 4 (TWEET 5 / OUTRO): Cuitan penutup, kesimpulan bernas, dan ajakan Retweet tweet pertama serta Follow akun.`;
    } else {
      dynamicGuidelines = `ATURAN STRUKTUR 5 SLIDE SOSMED & CAROUSEL VIRAL:
- PENTING: Gunakan gaya bahasa creator media sosial / praktisi bisnis modern (luwes, menarik, padat wawasan, memicu rasa penasaran), BUKAN siaran berita atau redaksi jurnalistik formal!
1. Slide 0 (COVER): Headline hook memikat, mengundang rasa penasaran audiens (curiosity gap), relevan dengan inti materi.
2. Slide 1 (POIN KUNCI / METRIK UTAMA): Sorot 1 wawasan penting, ide utama, atau angka/fakta terpenting pada "statHighlight" dengan penjelasan padat.
3. Slide 2 (PEMBAHASAN MENDALAM): Penjelasan praktis mengenai mekanisme, tips penerapan, atau langkah implementasi nyata.
4. Slide 3 (GOLDEN RULE / INSIGHT): Wawasan emas berbobot, trik rahasia, atau aturan penting yang menginspirasi audiens.
5. Slide 4 (OUTRO / KESIMPULAN): Rangkuman 1 kalimat padat dan ajakan bertindak (CTA simpan postingan, bagikan, atau follow akun).`;
    }

    let contextDirectives = '';
    const NICHE_GUIDELINES: Record<string, string> = {
      'BISNIS': 'Bisnis, Manajemen & UMKM: Fokus pada strategi scale-up omset, efisiensi operasional, manajemen tim, dan tips praktis pemilik usaha.',
      'KEUANGAN_PRIBADI': 'Keuangan Pribadi (Personal Finance): Fokus pada budgeting, cara menabung cerdas, pos pengeluaran, dana darurat, dan kebiasaan finansial sehat.',
      'INVESTASI': 'Investasi & Saham: Fokus pada analisis pasar modal, reksadana, crypto, evaluasi risiko, dan strategi diversifikasi portofolio jangka panjang.',
      'BISNIS_DIGITAL': 'Bisnis Digital & E-Commerce / Olshop: Fokus pada penjualan toko online, trik affiliate Shopee/TikTok Shop, dropship, dan konversi marketplace.',
      'PENGEMBANGAN_KARIR': 'Pengembangan Karir & HR: Fokus pada tips lolos interview, penulisan CV ATS, personal branding media sosial profesional, negosiasi gaji, dan produktivitas kerja.',
      'MARKETING_BRANDING': 'Marketing & Branding: Fokus pada strategi digital marketing, formula copywriting jualan, pembuatan konten viral, dan manajemen media sosial.',
      'KULINER_MAKANAN': 'Kuliner & Restoran (F&B / Rumah Makan Padang / Resto Nusantara): Fokus pada cita rasa rempah otentik, kelezatan menu favorit, porsi kenyang, dan pengalaman makan nikmat.',
      'CAFE_MINUMAN': 'Cafe, Coffee Shop & Minuman Kekinian (ala Fore Coffee): Fokus pada estetika kopi modern, racikan minuman creamy/refreshing, aroma biji kopi Arabica, dan vibe nongkrong.',
      'RESEP_MASAKAN': 'Resep Masakan Rumahan & Baking: Fokus pada takaran bumbu dapur presisi, langkah memasak anti-gagal, dan tips penyajian lezat.',
      'KESEHATAN': 'Kesehatan & Medis: Fokus pada fakta kesehatan berbasis bukti, tips pencegahan penyakit, imunitas tubuh, dan pola hidup sehat.',
      'OLAHRAGA': 'Olahraga & Fitness: Fokus pada rutinitas gym workout, latihan angkat beban, lari (running), olahraga di rumah, dan tips konsistensi fisik.',
      'DIET_NUTRISI': 'Diet & Nutrisi: Fokus pada defisit kalori, pemenuhan protein, meal prep sehat, dan mitos vs fakta seputar makanan diet.',
      'KESEHATAN_MENTAL': 'Kesehatan Mental & Self-Care: Fokus pada mengatasi overthinking, manajemen stres kerja, mindfulness, dan afirmasi positif.',
      'TEKNOLOGI_GADGET': 'Teknologi & Gadget: Fokus pada inovasi smartphone, laptop, gadget produktivitas, dan fitur teknologi terkini.',
      'ULASAN_GADGET': 'Ulasan Gadget & Unboxing: Fokus pada spesifikasi real-world, kelebihan & kekurangan, ketahanan baterai, dan rekomendasi beli.',
      'AI_OTOMASI': 'Kecerdasan Buatan (AI) & Otomasi: Fokus pada prompt engineering praktis, tools AI produktivitas (ChatGPT, Midjourney, Claude, Automations), dan masa depan teknologi.',
      'PEMROGRAMAN': 'Pemrograman & IT (Coding / Software): Fokus pada tips web development, framework modern, debugging, dan karir software engineer.',
      'GAMING': 'Gaming & Esports: Fokus pada review game terbaru, tips gameplay, rekomendasi gear gaming, dan berita esports.',
      'KECANTIKAN': 'Kecantikan & Skincare: Fokus pada tahapan skincare routine, kandungan bahan aktif aman (BPOM/Halal), tips kulit glowing, dan solusi masalah jerawat/kusam.',
      'FASHION': 'Fashion, Distro & Streetwear: Fokus pada mix & match outfit, tren streetwear, racun pakaian kekinian, dan gaya berpakaian modis.',
      'GAYA_HIDUP': 'Gaya Hidup & Hiburan: Fokus pada rekomendasi film/musik, tren pop culture, dan aktivitas hobi yang seru.',
      'WISATA_TRAVEL': 'Wisata (Travel) & Liburan: Fokus pada rekomendasi destinasi wisata tersembunyi, itinerary liburan hemat, dan tips jalan-jalan seru.',
      'PROPERTI_RUMAH': 'Properti & Desain Rumah: Fokus pada inspirasi dekorasi interior minimalis, tips membeli rumah pertama, renovasi hemat, dan tips hunian nyaman.',
      'OTOMOTIF': 'Otomotif (Mobil & Motor): Fokus pada tips perawatan mesin kendaraan, komparasi mobil/motor, dan aksesoris otomotif.',
      'PENDIDIKAN': 'Pendidikan & Beasiswa: Fokus pada tips belajar efektif, persiapan ujian/skripsi, info beasiswa kuliah dalam & luar negeri.',
      'PARENTING': 'Parenting & Keluarga: Fokus pada pola asuh anak positif, stimulasi tumbuh kembang balita, dan keharmonisan rumah tangga.',
      'MOTIVASI_MINDSET': 'Motivasi & Mindset: Fokus pada kutipan inspiratif mendalam, bedah buku filosofis (Stoikisme, Atomic Habits), dan pembentukan kebiasaan pemenang.',
    };

    if (input.niche) {
      const guideline = NICHE_GUIDELINES[input.niche] || `Kategori: ${input.niche}`;
      contextDirectives += `\n- TARGET NICHE / INDUSTRI: ${guideline}. Sesuaikan istilah, persona, dan daya tarik konten dengan target industri ini.`;
    }
    if (input.aiVisualTheme && input.aiVisualTheme !== 'AUTO') {
      const themeDef = getAIThemeDef(input.aiVisualTheme);
      if (themeDef) {
        contextDirectives += `\n- TEMA VISUAL SENI GAMBAR AI: "${themeDef.label}" (${themeDef.description}). Selaraskan konteks visual ilustrasi slide dengan tema seni ini.`;
      }
    }

    if (input.contentType) {
      contextDirectives += `\n- PILAR / TIPE KONTEN: ${input.contentType}.`;
      if (input.contentType === 'PROMOTION') {
        contextDirectives += `\n  * Strategi Promosi: Sorot penawaran spesial / diskon / menu best seller, isi harga promo pada statHighlight, dan buat CTA langsung order / beli via Bio / Ojek Online.`;
      } else if (input.contentType === 'EDUCATION') {
        contextDirectives += `\n  * Strategi Edukasi: Bagikan panduan langkah demi langkah, tips praktis, atau rahasia yang berguna, dan buat CTA "Simpan postingan ini biar gak lupa!".`;
      } else if (input.contentType === 'STORYTELLING') {
        contextDirectives += `\n  * Strategi Storytelling / Behind the Scenes: Ceritakan kisah di balik produk, proses pembuatan dengan dedikasi, atau nilai brand, dan buat CTA share ke teman.`;
      } else if (input.contentType === 'INTERACTION') {
        contextDirectives += `\n  * Strategi Interaksi: Sajikan perbandingan seru (Pilihan A vs B) atau pertanyaan pancingan, dan buat CTA "Tulis pilihanmu di kolom komentar!".`;
      } else if (input.contentType === 'ENTERTAINMENT') {
        contextDirectives += `\n  * Strategi Hiburan: Sajikan situasi relatable dan humor halus yang sering dialami pelanggan, dan buat CTA "Tag temanmu yang kayak gini!".`;
      } else if (input.contentType === 'TESTIMONIAL') {
        contextDirectives += `\n  * Strategi Testimoni: Sajikan bukti kepuasan pelanggan, rating 5 bintang, dan review nyata, dan buat CTA "Klaim sekarang sebelum kehabisan!".`;
      }
    }
    if (input.targetAudience) {
      contextDirectives += `\n- TARGET AUDIENS: ${input.targetAudience}`;
    }
    if (input.aiVisualTheme && input.aiVisualTheme !== 'AUTO') {
      const themeDef = getAIThemeDef(input.aiVisualTheme);
      contextDirectives += `\n- TEMA VISUAL SENI GAMBAR AI: ${themeDef.label} (${themeDef.description}). Arahan visual: ${themeDef.promptModifier}.`;
    }

    const prompt = `${systemRole}
Tugas Anda: Buat naskah carousel ${slidesCount} slide dengan ritme visual bertingkat yang sangat nyambung dan akurat berdasarkan materi berikut:

Judul/Topik: "${articleTitle}"
Sumber: "${articleSource}"
Kreator/Penulis: "${articleAuthor}"
Materi/Isi:
${articleContent.slice(0, 7000)}

${dynamicGuidelines}
${contextDirectives}

${input.tone ? `- Gaya bahasa: ${input.tone}` : ''}

Kembalikan HANYA format JSON valid berikut:
{
  "category": "${isEcommerce ? 'BISNIS' : isRecipe ? 'KULINER' : isListicle ? 'EDUKASI' : 'TEKNOLOGI'}",
  "headline": "Judul headline memikat untuk cover",
  "feedCopy": "Deskripsi singkat pengantar di cover",
  "caption": "Caption Instagram lengkap dengan hook, poin bahasan emoji rapi, dan ajakan diskusi",
  "hashtags": ["#Tag1", "#Tag2", "#Tag3", "#Tag4", "#Tag5"],
  "cta": "${isEcommerce ? 'Klik link di bio untuk checkout & klaim voucher diskon!' : 'Simpan postingan ini & bagikan ke temanmu!'}",
  "slides": [
    {
      "index": 0,
      "title": "Judul Cover",
      "body": "Pengantar ringkas fakta utama.",
      "statHighlight": "${isEcommerce ? 'Diskon 50%' : isRecipe ? '20 Menit' : 'Sorotan'}",
      "quote": ""
    },
    {
      "index": 1,
      "title": "Judul Poin 1 / Keunggulan Utama",
      "body": "Penjelasan detail poin pertama.",
      "statHighlight": "${isListicle ? 'Poin 01' : isEcommerce ? 'Rp 79.000' : 'Fakta 1'}",
      "quote": ""
    },
    {
      "index": 2,
      "title": "Judul Poin 2 / Detail Spesifikasi / Langkah",
      "body": "Penjelasan detail poin kedua.",
      "statHighlight": "${isListicle ? 'Poin 02' : 'Fitur Utama'}",
      "quote": ""
    },
    {
      "index": 3,
      "title": "Judul Poin 3 / Review / Wawasan Kunci",
      "body": "Penjelasan detail poin ketiga.",
      "statHighlight": "${isListicle ? 'Poin 03' : 'Rating 4.9'}",
      "quote": ""
    },
    {
      "index": 4,
      "title": "Kesimpulan & Catatan Akhir",
      "body": "Rangkuman kesimpulan 1 kalimat.",
      "statHighlight": "Rangkuman",
      "quote": ""
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
      throw lastError || new Error('Semua model Gemini gagal menghasilkan slide.');
    }
  } catch (aiErr: any) {
    console.warn('[Direct Generator AI Fallback]: Menggunakan synthesizer kontekstual cerdas:', aiErr?.message);
    const cat = detectCategoryFromText(`${articleTitle} ${articleContent}`);
    const cleanTopic = articleTitle.replace(/[\\/:"*?<>|]/g, '').trim();

    if (isListicle) {
      deck = {
        category: 'EDUKASI',
        headline: articleTitle,
        feedCopy: `Daftar rekomendasi pilihan terbaik untuk ${cleanTopic}.`,
        caption: `🔥 ${articleTitle}\n\nBerikut daftar rekomendasi penting yang wajib kamu coba!\n\n👉 Simpan & Bagikan!`,
        hashtags: ['#Rekomendasi', '#TipsPraktis', '#Produktivitas', '#WawasanViral'],
        cta: 'Simpan postingan ini agar tidak lupa!',
        slides: [
          { index: 0, title: articleTitle, body: `Simak daftar pilihan terbaik seputar ${cleanTopic}.`, statHighlight: 'Rekomendasi' },
          { index: 1, title: '01. Pilihan Utama & Paling Populer', body: `Alat/metode ini menjadi andalan utama karena kemudahan penggunaan dan efisiensi waktu yang terbukti tinggi.`, statHighlight: 'Poin #01' },
          { index: 2, title: '02. Alternatif Cepat & Gratis', body: `Fitur lengkap tanpa biaya langganan yang cocok digunakan untuk kebutuhan sehari-hari dengan hasil maksimal.`, statHighlight: 'Poin #02' },
          { index: 3, title: '03. Fitur Cerdas Tingkat Lanjut', body: `Solusi dengan integrasi canggih yang membantu otomatisasi tugas kompleks dalam hitungan detik.`, statHighlight: 'Poin #03' },
          { index: 4, title: 'Kesimpulan & Rekomendasi Akhir', body: `Pilih yang paling sesuai dengan kebutuhanmu dan mulailah mencoba sekarang!`, statHighlight: 'Coba Sekarang' },
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
          { index: 0, title: articleTitle, body: `Solusi terbaik untuk kebutuhan harianmu dengan kualitas premium.`, statHighlight: 'Diskon 50%' },
          { index: 1, title: 'Kenapa Produk Ini Wajib Punya?', body: `Bahan berkualitas tinggi, nyaman dipakai, dan sudah terbukti disukai ribuan pembeli.`, statHighlight: 'Viral 10k+' },
          { index: 2, title: 'Spesifikasi & Keunggulan Bahan', body: `Standar resmi, material premium awet tahan lama, dan bergaransi 100% original.`, statHighlight: '100% Original' },
          { index: 3, title: 'Review & Testimoni Pembeli', body: `Rating 4.9/5 dari ribuan pelanggan puas yang merekomendasikan produk ini.`, statHighlight: 'Rating 4.9/5' },
          { index: 4, title: 'Promo Terbatas — Checkout Sekarang', body: `Dapatkan harga spesial diskon dan gratis ongkir sebelum promo berakhir!`, statHighlight: 'Beli Sekarang' },
        ],
      };
    } else if (isRecipe) {
      deck = {
        category: 'KULINER',
        headline: articleTitle,
        feedCopy: `Resep praktis dan lezat yang mudah dibuat di rumah.`,
        caption: `🍳 ${articleTitle}\n\nResep gurih mantap yang bikin nambah nasi!\n\n👉 Simpan resepnya buat masak besok!`,
        hashtags: ['#ResepMasakan', '#KulinerViral', '#MasakPraktis', '#MenuHarian'],
        cta: 'Simpan resep ini buat menu masak besok!',
        slides: [
          { index: 0, title: articleTitle, body: `Resep masakan lezat dan praktis yang mudah dibuat siapa saja.`, statHighlight: '20 Menit' },
          { index: 1, title: 'Bahan Pokok & Bumbu Halus', body: `Siapkan bahan-bahan segar pilihan dan bumbu halus dengan takaran yang pas.`, statHighlight: 'Bahan Segar' },
          { index: 2, title: 'Langkah Memasak Tahap Awal', body: `Tumis bumbu halus hingga harum dan matang sempurna sebelum memasukkan bahan utama.`, statHighlight: 'Tahap 01' },
          { index: 3, title: 'Rahasia Rasa Gurih Meresap', body: `Masak dengan api sedang dan beri bumbu pelengkap hingga kuah meresap sempurna.`, statHighlight: 'Tips Chef' },
          { index: 4, title: 'Saran Penyajian & Nikmati!', body: `Sajikan selagi hangat bersama nasi putih pulen untuk rasa terbaik!`, statHighlight: 'Siap Santap' },
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
          { index: 0, title: articleTitle, body: `Rangkuman wawasan dan poin kunci mengenai ${cleanTopic}.`, statHighlight: 'Sorotan Utama' },
          { index: 1, title: `Latar Belakang & Poin Kunci`, body: `Topik "${cleanTopic}" menjadi sorotan penting karena menghadirkan terobosan baru.`, statHighlight: 'Fokus Utama' },
          { index: 2, title: `Mekanisme & Ulasan Mendalam`, body: `Analisis terperinci menguraikan langkah-langkah praktis dan konsep fundamental.`, statHighlight: 'Poin Kritis' },
          { index: 3, title: `Wawasan Emas & Perspektif Kunci`, body: `Penerapan pendekatan ini memberikan dampak efisiensi nyata dalam jangka panjang.`, statHighlight: 'Golden Rule' },
          { index: 4, title: `Kesimpulan & Rencana Aksi`, body: `Jadikan wawasan ini sebagai bekal praktis untuk mengambil keputusan ke depan.`, statHighlight: 'Siap Aksi' },
        ],
      };
    }
  }

  // 3. Enrich Each Slide with Multi-Photo & Dynamic Varied Layout Architectures (Slide 2+)
  const detectedCategory = deck.category || detectCategoryFromText(articleTitle);

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

    // SETIAP slide selalu mendapatkan foto produk asli (jika dari marketplace/link) atau tema seni AI kontekstual!
    let photoUrl: string | null = null;
    if (input.aiVisualTheme && input.aiVisualTheme !== 'AUTO') {
      // Jika pengguna secara spesifik memilih Tema Visual AI (misal: 3D Cute Pixar, Cyberpunk, Ghibli, dsb), gunakan tema visual seni tersebut
      photoUrl = getContextualPhotoForSlide(
        detectedCategory,
        idx,
        `${s.title || ''} ${s.body || ''} ${articleTitle}`,
        isCover ? articleImageUrl : null,
        input.aiVisualTheme
      );
    } else if (isCover && (articleImages[0] || articleImageUrl)) {
      photoUrl = articleImages[0] || articleImageUrl;
    } else if (articleImages.length > 0) {
      // Jika dari link produk / marketplace dan tema AUTO, gunakan foto-foto produk asli secara berurutan untuk setiap slide!
      photoUrl = articleImages[idx % articleImages.length];
    } else {
      photoUrl = getContextualPhotoForSlide(
        detectedCategory,
        idx,
        `${s.title || ''} ${s.body || ''} ${articleTitle}`,
        isCover ? articleImageUrl : null,
        input.aiVisualTheme
      );
    }

    // Tag badge kontekstual sesuai varian tata letak & intent
    const slideTag = isCover
      ? (isEcommerce ? '🛍️ RACUN SHOPEE' : detectedCategory || '✨ REKOMENDASI')
      : isOutro
      ? (isEcommerce ? '🛒 CARA ORDER' : '📌 KESIMPULAN')
      : isEcommerce
      ? (['✨ KEUNGGULAN', '📦 DETAIL PRODUK', '⭐ REVIEW JUJUR', '🔥 PROMO SPESIAL'][idx - 1] || 'PRODUK')
      : isRecipe
      ? (['BAHAN-BAHAN', 'LANGKAH 01', 'LANGKAH 02', 'PENYAJIAN'][idx - 1] || 'RESEP')
      : isTutorial
      ? `LANGKAH 0${idx}`
      : isTwitter
      ? `Cuitan #${idx + 1}`
      : isListicle
      ? `POIN 0${idx}`
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
      takeaway: s.title || (isListicle ? `Rekomendasi #${idx}` : isRecipe ? `Tahap #${idx}` : `Poin Pembahasan #${idx + 1}`),
      supportingText: s.body,
      statHighlight: s.statHighlight || (isEcommerce ? 'Diskon Promo' : isRecipe ? 'Durasi' : isListicle ? `Poin 0${idx}` : undefined),
      sourceQuote: s.quote || undefined,
      ctaText: isOutro ? deck.cta : undefined,
      secondaryCta: isOutro ? (isEcommerce ? 'Stok terbatas, pesan sebelum kehabisan!' : isTwitter ? 'Retweet tweet pertama jika bermanfaat!' : 'Ikuti untuk wawasan praktis harian.') : undefined,
      imageUrl: photoUrl,
      source: articleSource,
    };
  });

  const coverImageUrl = enrichedSlides[0]?.imageUrl || articleImageUrl || getContextualPhotoForSlide(detectedCategory, 0, articleTitle);

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

      const genContent = await tx.generatedContent.create({
        data: {
          articleId: article.id,
          headline: deck.headline || articleTitle,
          feedCopy: deck.feedCopy || '',
          caption: deck.caption || '',
          hashtags: deck.hashtags || [],
          cta: deck.cta || 'Simpan & Bagikan!',
          angle: isEcommerce ? 'Promosi Produk & Racun Olshop' : 'Edukasi & Social Media Carousel',
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
      angle: isEcommerce ? 'Promosi & Rekomendasi' : 'Edukasi & Carousel Viral',
      slides: enrichedSlides,
    },
    style: effectiveStyle,
    format: input.format || 'FEED_PORTRAIT',
  };
}
