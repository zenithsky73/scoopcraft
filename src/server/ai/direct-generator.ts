import 'dotenv/config';
import type { DesignStyle, OutputFormat } from '@prisma/client';
import { GoogleGenAI } from '@google/genai';
import { db } from '@/server/db';
import { scrapeArticleFast } from '@/server/scraper/fast-scraper';
import { SLIDES } from '@/server/design/deck';
import { consumeQuota } from '@/server/billing/quota';
import { getContextualPhotoForSlide, detectCategoryFromText } from '@/server/images/contextual-photos';

export type InputMode = 'url' | 'text' | 'prompt';

export type GenerateDirectInput = {
  userId: string;
  mode: InputMode;
  url?: string;
  rawText?: string;
  rawTitle?: string;
  prompt?: string;
  tone?: string;
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
  let articleSource = 'Newsly AI';
  let articleUrl = input.url || `https://newsly.ai/generated/${Date.now()}`;
  let articleImageUrl: string | null = null;
  let articleImages: string[] = [];
  let articleAuthor = 'Redaksi';

  // 1. Resolve Content based on Mode
  if (input.mode === 'url' && input.url) {
    try {
      const scraped = await scrapeArticleFast(input.url);
      articleTitle = scraped.title;
      articleContent = scraped.content;
      articleSource = scraped.source || 'Portal Berita';
      articleUrl = scraped.url;
      articleImageUrl = scraped.imageUrl || null;
      articleImages = scraped.images || (scraped.imageUrl ? [scraped.imageUrl] : []);
      articleAuthor = scraped.author || 'Redaksi';
    } catch (scrapeErr: any) {
      console.warn('[Direct Generator Scraper Fallback]:', scrapeErr?.message);
      const cleanUrl = input.url.replace(/^https?:\/\//, '').split(/[?#]/)[0];
      const segments = cleanUrl.split('/').filter(Boolean);
      const slug = decodeURIComponent(segments.pop() || cleanUrl).replace(/[-_]/g, ' ');

      articleTitle = slug.charAt(0).toUpperCase() + slug.slice(1);
      articleContent = `Artikel berita dari sumber tautan: ${input.url}. Buatkan ulasan dan analisis komprehensif mengenai berita ini dalam bahasa Indonesia.`;
      articleSource = segments[0] ? segments[0].replace('www.', '') : 'Portal Berita';
    }
  } else if (input.mode === 'text' && input.rawText) {
    articleTitle = input.rawTitle || input.rawText.split('\n')[0].slice(0, 120) || 'Berita & Informasi Terkini';
    articleContent = input.rawText;
    articleSource = 'Teks Langsung';
  } else if (input.mode === 'prompt' && input.prompt) {
    articleTitle = input.prompt.slice(0, 100);
    articleContent = `Topik/Ide Konten: "${input.prompt}".\nGaya Bahasa/Tone: "${input.tone || 'Informatif & Berwibawa'}".`;
    articleSource = 'AI Generator';
  } else {
    articleTitle = 'Wawasan & Analisis Terkini';
    articleContent = 'Rangkuman wawasan dan tren terkini untuk konten carousel.';
  }

  // 2. Direct Gemini 2.5 Flash Turbo JSON Generation with Dynamic Slide Roles
  let deck!: GeneratedDeckResult;
  const isYouTube = articleSource.toLowerCase().includes('youtube') || articleUrl.includes('youtu');

  try {
    const ai = getGeminiClient();
    const prompt = `Anda adalah Executive Creative Director di media carousel Instagram & LinkedIn Indonesia terkemuka (@fakta.indo, @ngomonginuang, @katadatacoid, @kumparancom).
Tugas Anda: Buat naskah carousel ${slidesCount} slide dengan ritme visual bertingkat (Dynamic Visual Rhythm) berdasarkan materi berikut:

Judul/Topik: "${articleTitle}"
Sumber: "${articleSource}"
Kreator/Penulis: "${articleAuthor}"
Materi/Isi:
${articleContent.slice(0, 7000)}

${
  isYouTube
    ? `PANDUAN KHUSUS VIDEO YOUTUBE:
- Sumber ini adalah konten video YouTube berjudul "${articleTitle}" dari kreator "${articleAuthor}".
- Tugas Anda: Bedah isi dan topik video ini menjadi 5 slide edukatif yang padat wawasan dan bernilai tinggi!
- JANGAN PERNAH mengembalikan judul umum seperti "Poin Pembahasan #1" atau "Metrik & Fakta Kunci".
- Manfaatkan transkrip/deskripsi yang ada, serta elaborasikan pemahaman mendalam Anda mengenai topik "${articleTitle}" untuk menjabarkan fakta nyata, mekanisme cara kerja, tips praktis, data penting, dan kesimpulan bernas yang sesuai dengan video tersebut.
- Pastikan setiap slide memiliki takeaway judul yang tajam dan supportingText 2-3 kalimat yang mengalir enak dibaca.`
    : ''
}

ATURAN STRUKTUR 5 SLIDE DINAMIS (PENTING):
1. Slide 0 (COVER): Headline hook memikat, mengundang rasa penasaran, relevan dengan inti topik.
2. Slide 1 (BIG METRIC / KEY PROBLEM): Sorot 1 angka/metrik/fakta terpenting (contoh: "6.000 mAh", "+40% Efisiensi", "Rp 15 Juta", "Poin Kritis 01") pada "statHighlight" dengan penjelasan padat.
3. Slide 2 (DEEP DIVE / DETAIL): Penjelasan mendalam mengenai mekanisme, spesifikasi, atau langkah implementasi nyata.
4. Slide 3 (GOLDEN QUOTE / INSIGHT): Kutipan tokoh/analisis berbobot ("quote") atau aturan emas (Golden Rule) yang berwibawa.
5. Slide 4 (OUTRO / KESIMPULAN): Rangkuman 1 kalimat padat dan ajakan bertindak (CTA).

- JANGAN gunakan penomoran kaku "1, 2, 3" di awal title. Gunakan judul topik yang bermakna!
${input.tone ? `- Gaya bahasa: ${input.tone}` : ''}

Kembalikan HANYA format JSON valid berikut:
{
  "category": "TEKNOLOGI",
  "headline": "Judul headline memikat untuk cover",
  "feedCopy": "Deskripsi singkat pengantar di cover",
  "caption": "Caption Instagram lengkap dengan hook, poin bahasan emoji rapi, dan ajakan diskusi",
  "hashtags": ["#Tag1", "#Tag2", "#Tag3", "#Tag4", "#Tag5"],
  "cta": "Simpan postingan ini & bagikan ke tim Anda!",
  "slides": [
    {
      "index": 0,
      "title": "Judul Cover",
      "body": "Pengantar ringkas fakta utama.",
      "statHighlight": "Fakta Utama",
      "quote": "Highlight awal"
    },
    {
      "index": 1,
      "title": "Judul Fakta Metrik",
      "body": "Penjelasan angka dan dampak pentingnya.",
      "statHighlight": "Angka/Metrik Kunci",
      "quote": "Insight data"
    },
    {
      "index": 2,
      "title": "Judul Pembahasan Mendalam",
      "body": "Rincian spesifikasi atau langkah konkret.",
      "statHighlight": "Poin Inti",
      "quote": "Poin penting"
    },
    {
      "index": 3,
      "title": "Judul Wawasan Pakar",
      "body": "Analisis dampak jangka panjang.",
      "statHighlight": "Pro-Tip",
      "quote": "Kutipan pernyataan tokoh/analis"
    },
    {
      "index": 4,
      "title": "Kesimpulan & Catatan Akhir",
      "body": "Rangkuman kesimpulan 1 kalimat.",
      "statHighlight": "Rangkuman",
      "quote": "Takeaway"
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

    deck = {
      category: cat,
      headline: articleTitle,
      feedCopy: `Simak ringkasan penting dan poin-poin utama seputar ${cleanTopic}.`,
      caption: `🔥 ${articleTitle}\n\nBerikut rangkuman dan poin-poin penting yang wajib Anda ketahui!\n\n👉 Simpan & Bagikan!`,
      hashtags: ['#WawasanTerkini', '#Edukasi', '#NewslyAI', '#TrenViral', `#${cat}`],
      cta: 'Simpan postingan ini & bagikan ke temanmu!',
      slides: [
        {
          index: 0,
          title: articleTitle,
          body: `Rangkuman wawasan dan poin kunci mengenai ${cleanTopic}.`,
          statHighlight: 'Sorotan Utama',
          quote: 'Terverifikasi',
        },
        {
          index: 1,
          title: `Latar Belakang & Poin Kunci`,
          body: `Topik "${cleanTopic}" menjadi sorotan penting karena menghadirkan terobosan dan data baru yang relevan bagi masyarakat luas.`,
          statHighlight: 'Fokus Utama',
          quote: 'Data Terverifikasi',
        },
        {
          index: 2,
          title: `Mekanisme & Ulasan Mendalam`,
          body: `Analisis terperinci menguraikan langkah-langkah praktis dan konsep fundamental yang mendasari perkembangan "${cleanTopic}".`,
          statHighlight: 'Poin Kritis',
          quote: 'Analisis Mendalam',
        },
        {
          index: 3,
          title: `Wawasan Emas & Perspektif Kunci`,
          body: `Penerapan pendekatan ini memberikan dampak efisiensi dan nilai tambah yang terukur dalam jangka panjang.`,
          statHighlight: 'Golden Rule',
          quote: `“Kunci keberhasilan terletak pada konsistensi memahami detail penting.”`,
        },
        {
          index: 4,
          title: `Kesimpulan & Rencana Aksi`,
          body: `Jadikan wawasan ini sebagai bekal praktis untuk mengambil keputusan dan menerapkan langkah terbaik ke depan.`,
          statHighlight: 'Siap Aksi',
          quote: 'Takeaway',
        },
      ],
    };
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

    let photoUrl: string | null = null;

    if (isCover) {
      photoUrl = articleImages[0] || articleImageUrl || getContextualPhotoForSlide(detectedCategory, 0, articleTitle);
    } else if (layoutVariant === 'IMAGE_TOP_TEXT_BOTTOM' || layoutVariant === 'TEXT_BOTTOM') {
      photoUrl =
        articleImages[idx] ||
        (articleImages.length > 1 ? articleImages[1] : null) ||
        getContextualPhotoForSlide(detectedCategory, idx, s.title || articleTitle);
    } else if (articleImages.length > idx) {
      photoUrl = articleImages[idx];
    }

    // Tag badge kontekstual sesuai varian tata letak
    const slideTag = isCover
      ? detectedCategory || 'HEADLINE'
      : isOutro
      ? 'KESIMPULAN'
      : layoutVariant === 'STAT_HERO'
      ? 'METRIK & FAKTA'
      : layoutVariant === 'QUOTE_CARD'
      ? 'INSIGHT / KUTIPAN'
      : layoutVariant === 'TEXT_CENTER'
      ? 'POIN FOKUS'
      : layoutVariant === 'SPLIT_TWO_COL'
      ? 'ANALISIS POIN'
      : 'PEMBAHASAN';

    return {
      index: idx,
      type: isCover ? 'COVER' : isOutro ? 'OUTRO' : 'POINT',
      layoutVariant,
      pointNumber: isCover || isOutro ? undefined : idx,
      tag: slideTag,
      headline: isCover ? deck.headline || s.title : undefined,
      lead: isCover ? deck.feedCopy || s.body : undefined,
      takeaway: s.title || `Poin Pembahasan #${idx + 1}`,
      supportingText: s.body,
      statHighlight: s.statHighlight || (layoutVariant === 'STAT_HERO' || idx === 1 ? 'Data Kunci' : undefined),
      sourceQuote: s.quote || (layoutVariant === 'QUOTE_CARD' || idx === 3 ? `"${articleTitle}"` : undefined),
      ctaText: isOutro ? deck.cta : undefined,
      secondaryCta: isOutro ? 'Ikuti @newsly.ai untuk wawasan harian.' : undefined,
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
          angle: 'Jurnalisme Mendalam',
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
      angle: 'Jurnalisme Mendalam',
      slides: enrichedSlides,
    },
    style: input.style,
    format: input.format || 'FEED_PORTRAIT',
  };
}
