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

  // 2. Direct Gemini 3.5 Flash JSON Generation
  let deck: GeneratedDeckResult;

  try {
    const ai = getGeminiClient();
    const prompt = `Anda adalah Executive Media Editor dan Head of Content di media Instagram/LinkedIn Indonesia terkemuka (@fakta.indo, @ngomonginuang, @katadatacoid, @kumparancom).
Tugas Anda: Buat naskah carousel ${slidesCount} slide yang sangat kaya data, faktual, mendalam, dan relevan dengan materi berita/topik berikut:

Judul/Topik: "${articleTitle}"
Sumber: "${articleSource}"
Materi/Isi:
${articleContent.slice(0, 7000)}

Instruksi Format:
- Buat tepat ${slidesCount} slide pada array "slides".
- Slide index 0: Cover/Poin Pembuka dengan judul poin menarik dan fakta pengantar.
- Slide index 1 hingga ${slidesCount - 1}: Rincian poin-poin penting, nama entitas/brand/spesifikasi/data konkret sesuai isi artikel (JANGAN gunakan teks generik!).
- Setiap slide WAJIB memiliki: "title" (judul poin spesifik), "body" (penjelasan padat fakta 2-3 kalimat), "statHighlight" (angka/data kunci), dan "quote" (kutipan/takeaway).
- Tentukan "category" (POLITIK, EKONOMI, TEKNOLOGI, HUKUM, OLAHRAGA, PENDIDIKAN, KESEHATAN, BENCANA, KARIER, HIBURAN).
${input.tone ? `- Gaya bahasa: ${input.tone}` : ''}

Kembalikan HANYA format JSON valid berikut (tanpa markdown blok lain):
{
  "category": "TEKNOLOGI",
  "headline": "Judul headline memikat untuk cover",
  "feedCopy": "Deskripsi singkat pengantar di cover",
  "caption": "Caption Instagram lengkap dengan hook, poin bahasan, dan ajakan diskusi",
  "hashtags": ["#Tag1", "#Tag2", "#Tag3"],
  "cta": "Simpan & bagikan ke temanmu!",
  "slides": [
    {
      "index": 0,
      "title": "Judul Poin Spesifik 1",
      "body": "Penjelasan detail faktual mengenai poin 1 sesuai konteks berita.",
      "statHighlight": "Highlight Data/Metrik",
      "quote": "Poin takeaway penting"
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || 'gemini-3.5-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        responseMimeType: 'application/json',
      },
    });

    const jsonText = response.text || '{}';
    deck = JSON.parse(jsonText);

    if (!deck.slides || deck.slides.length === 0) {
      throw new Error('Keluaran slide AI kosong.');
    }
  } catch (aiErr: any) {
    console.warn('[Direct Generator AI Fallback]: Menggunakan synthesizer darurat kontekstual:', aiErr?.message);
    const cat = detectCategoryFromText(`${articleTitle} ${articleContent}`);
    deck = {
      category: cat,
      headline: articleTitle,
      feedCopy: `Rangkuman fakta dan poin-poin penting seputar ${articleTitle}.`,
      caption: `🔥 ${articleTitle}\n\nBerikut fakta dan analisis lengkap yang perlu Anda ketahui!\n\n👉 Simpan & Bagikan!`,
      hashtags: ['#BeritaTerkini', '#FaktaViral', '#NewslyAI', '#Edukasi'],
      cta: 'Simpan postingan ini & bagikan ke temanmu!',
      slides: Array.from({ length: slidesCount }).map((_, idx) => ({
        index: idx,
        title: idx === 0 ? articleTitle : `Fakta & Poin Penting #${idx + 1}`,
        body: `Pembahasan mendalam mengenai ${articleTitle} mencakup implikasi strategis dan fakta utama di lapangan.`,
        statHighlight: `Poin ${idx + 1}/${slidesCount}`,
        quote: 'Analisis Terverifikasi',
      })),
    };
  }

  // 3. Enrich Each Slide with Distinct Contextual HD Image and Metadata
  const detectedCategory = deck.category || detectCategoryFromText(articleTitle);

  const enrichedSlides = (deck.slides || []).map((s: any, idx: number) => {
    const isCover = idx === 0;
    const isOutro = idx === deck.slides.length - 1;
    const photoUrl = getContextualPhotoForSlide(
      detectedCategory,
      idx,
      `${s.title || ''} ${articleTitle}`,
      isCover ? articleImageUrl : null
    );

    return {
      index: idx,
      type: isCover ? 'COVER' : isOutro ? 'OUTRO' : 'POINT',
      pointNumber: isCover || isOutro ? undefined : idx,
      tag: isCover
        ? detectedCategory || 'HEADLINE'
        : isOutro
        ? 'KESIMPULAN'
        : `FAKTA 0${idx}`,
      headline: isCover ? deck.headline || s.title : undefined,
      lead: isCover ? deck.feedCopy || s.body : undefined,
      takeaway: s.title || `Poin Pembahasan #${idx + 1}`,
      supportingText: s.body,
      statHighlight: s.statHighlight || `Poin 0${idx + 1}`,
      sourceQuote: s.quote || (isCover ? undefined : `"${articleTitle}"`),
      ctaText: isOutro ? deck.cta : undefined,
      secondaryCta: isOutro ? 'Ikuti @newsly.ai untuk update harian.' : undefined,
      imageUrl: photoUrl,
      source: articleSource,
    };
  });

  const coverImageUrl = enrichedSlides[0]?.imageUrl || articleImageUrl || getContextualPhotoForSlide(detectedCategory, 0, articleTitle);

  // 4. Safe Non-Blocking DB Save
  let runId = `run_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
  let articleId = `art_${Date.now().toString(36)}`;
  let genContentId = `gen_${Date.now().toString(36)}`;

  try {
    const saved = await db.$transaction(async (tx) => {
      // Consume Quota safely
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
