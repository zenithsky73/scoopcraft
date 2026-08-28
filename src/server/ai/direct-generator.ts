import { z } from 'zod';
import type { DesignStyle, OutputFormat } from '@prisma/client';
import { db } from '@/server/db';
import { extractArticle } from '@/server/scraper';
import { runStructured } from '@/server/ai/client';
import { SLIDES } from '@/server/design/deck';
import { consumeQuota } from '@/server/billing/quota';
import { getContextualPhotoForSlide } from '@/server/images/contextual-photos';

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

const unifiedCarouselSchema = z.object({
  analysis: z.object({
    topic: z.string().describe('Topik utama dalam 1 kalimat'),
    category: z.enum([
      'POLITIK',
      'EKONOMI',
      'HUKUM',
      'OLAHRAGA',
      'TEKNOLOGI',
      'HIBURAN',
      'KESEHATAN',
      'PENDIDIKAN',
      'LINGKUNGAN',
      'BENCANA',
      'INTERNASIONAL',
      'LAINNYA',
    ]).default('EKONOMI'),
    summary: z.string().describe('Ringkasan 2-3 kalimat'),
    keyPoints: z.array(z.string()).default([]),
    facts: z.array(z.object({ label: z.string(), value: z.string() })).default([]),
  }),
  content: z.object({
    headline: z.string().max(90).describe('Headline viral slide cover yang sangat memikat'),
    feedCopy: z.string().max(220).describe('Lead copy penjelasan pembuka di cover'),
    caption: z.string().describe('Caption postingan Instagram lengkap dengan Hook, Poin Pembahasan, dan CTA'),
    hashtags: z.array(z.string()).default([]),
    cta: z.string().describe('Call to Action (contoh: Simpan & Bagikan ke Rekan Anda!)'),
    angle: z.string().default('Jurnalisme Mendalam'),
    slides: z.array(
      z.object({
        title: z.string().describe('Judul poin inti slide'),
        body: z.string().describe('Penjelasan mendalam dan padat fakta'),
        statHighlight: z.string().optional().describe('Highlight data/angka penting'),
        quote: z.string().optional().describe('Kutipan narasumber singkat jika ada'),
      })
    ),
  }),
});

export async function generateDirect(input: GenerateDirectInput) {
  const slidesCount = Math.min(Math.max(input.slides ?? 5, SLIDES.min), SLIDES.max);
  let articleTitle = '';
  let articleContent = '';
  let articleSource = 'Newsly AI';
  let articleUrl = input.url || `https://newsly.ai/generated/${Date.now()}`;
  let articleImageUrl: string | null = null;
  let articleAuthor = 'Redaksi';

  // 1. Resolve Content based on Mode (dengan Fallback Scraper)
  if (input.mode === 'url' && input.url) {
    try {
      const scraped = await extractArticle({ url: input.url });
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
    throw new Error('Input tidak valid: URL, teks, atau prompt harus diisi.');
  }

  // 2. Single-Pass High-Speed Gemini Generation (Analysis + Full Slide Deck)
  const systemPrompt = `Anda adalah Executive Media Editor dan Head of Social Content di media Instagram & LinkedIn Indonesia paling berpengaruh (seperti @fakta.indo, @ngomonginuang, @infonesiaku.id, @supercuansaham.id, @tentangkampus_id).
Tugas Anda adalah menganalisis materi berita/topik dan langsung memproduksi naskah Carousel Instagram ${slidesCount} slide yang sangat kaya data, visual, dan berbobot.

Instruksi Khusus:
- Buat tepat ${slidesCount} slide pada array slides.
- Slide 1: Cover dengan headline tajam dan lead copy.
- Slide 2 s/d ${slidesCount - 1}: Poin-poin pembahasan utama yang mendalam (bukan teks generik, sertakan fakta/angka konkret).
- Slide ${slidesCount}: Kesimpulan dan Call to Action.
${input.tone ? `- Sesuaikan gaya bahasa: ${input.tone}` : ''}`;

  const userPrompt = `Judul/Topik: ${articleTitle}
Sumber: ${articleSource}
Materi Isi:
${articleContent.slice(0, 8000)}

Jumlah Slide Diminta: ${slidesCount} Slide`;

  const result = await runStructured({
    system: systemPrompt,
    user: userPrompt,
    schema: unifiedCarouselSchema,
  });

  const { analysis, content } = result.data;

  // 3. Enrich Each Slide with Distinct Contextual HD Image and Metadata
  const rawSlideList = content.slides || [];
  const enrichedSlides = rawSlideList.map((s, idx) => {
    const isCover = idx === 0;
    const isOutro = idx === rawSlideList.length - 1;
    const photoUrl = getContextualPhotoForSlide(
      analysis.category,
      idx,
      s.title || articleTitle,
      isCover ? articleImageUrl : null
    );

    const factItem = analysis.facts && analysis.facts[idx % analysis.facts.length];

    return {
      index: idx,
      type: isCover ? 'COVER' : isOutro ? 'OUTRO' : 'POINT',
      pointNumber: isCover || isOutro ? undefined : idx,
      tag: isCover
        ? analysis.category || 'HEADLINE'
        : isOutro
        ? 'KESIMPULAN'
        : `FAKTA 0${idx}`,
      headline: isCover ? content.headline || s.title : undefined,
      lead: isCover ? content.feedCopy || s.body : undefined,
      takeaway: s.title || `Poin Pembahasan #${idx}`,
      supportingText: s.body,
      statHighlight: s.statHighlight || (factItem ? `${factItem.label}: ${factItem.value}` : undefined),
      sourceQuote: s.quote || (isCover ? undefined : idx === 1 ? `"${analysis.topic}"` : undefined),
      ctaText: isOutro ? content.cta : undefined,
      secondaryCta: isOutro ? 'Ikuti @newsly.ai untuk update berita & insight harian.' : undefined,
      imageUrl: photoUrl,
      source: articleSource,
    };
  });

  const coverImageUrl = enrichedSlides[0]?.imageUrl || articleImageUrl || getContextualPhotoForSlide(analysis.category, 0, articleTitle);

  // 4. Atomic Database Save
  const savedRun = await db.$transaction(async (tx) => {
    // Consume Quota
    await consumeQuota(tx, input.userId);

    // Save Article
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

    // Save Generated Content
    const genContent = await tx.generatedContent.create({
      data: {
        articleId: article.id,
        headline: content.headline,
        feedCopy: content.feedCopy,
        caption: content.caption,
        hashtags: content.hashtags,
        cta: content.cta,
        angle: content.angle,
        analysis: analysis as any,
        slides: enrichedSlides as any,
        visualUrl: coverImageUrl,
      },
    });

    // Save Completed GenerationRun
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

  return {
    runId: savedRun.run.id,
    article: {
      id: savedRun.article.id,
      title: articleTitle,
      source: articleSource,
      imageUrl: coverImageUrl,
      author: articleAuthor,
      url: articleUrl,
    },
    content: {
      id: savedRun.genContent.id,
      headline: content.headline,
      caption: content.caption,
      hashtags: content.hashtags,
      cta: content.cta,
      angle: content.angle,
      slides: enrichedSlides,
    },
    style: input.style,
    format: input.format || 'FEED_PORTRAIT',
  };
}
