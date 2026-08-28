import type { DesignStyle, OutputFormat } from '@prisma/client';
import { db } from '@/server/db';
import { extractArticle } from '@/server/scraper';
import { runStructured } from '@/server/ai/client';
import { analysisSchema, contentSchema } from '@/server/ai/schemas';
import { normalizeCopy } from '@/server/ai/validate';
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

const DEFAULT_ANALYZE_PROMPT = `Anda adalah editor media senior dan jurnalis riset di Indonesia. Analisis artikel berita ini secara objektif dan temukan:
1. Topik utama dalam 1 kalimat
2. Kategori berita (POLITIK, EKONOMI, HUKUM, OLAHRAGA, TEKNOLOGI, HIBURAN, KESEHATAN, PENDIDIKAN, LINGKUNGAN, BENCANA, INTERNASIONAL, LAINNYA)
3. Ringkasan 2-3 kalimat
4. 3-5 poin inti paling penting
5. Angka / fakta konkret
6. Entitas penting
7. Rekomendasi sudut pandang penulisan carousel`;

const DEFAULT_CONTENT_PROMPT = `Anda adalah head of content & viral social media copywriter untuk media Instagram terpopuler di Indonesia (seperti @fakta.indo, @ngomonginuang, @infonesiaku.id, @supercuansaham.id, @tentangkampus_id).
Tugas Anda adalah mengubah analisis artikel berita menjadi konten slide carousel Instagram yang sangat menarik, berbobot, dan memicu interaksi tinggi.

Tulis dalam format JSON terstruktur:
1. headline: Judul slide 1 yang sangat menarik perhatian (maksimal 70 karakter)
2. feedCopy: Penjelasan pembuka yang memikat (maksimal 180 karakter)
3. caption: Caption postingan lengkap dengan Hook, Pembahasan Poin, dan Call-to-Action (300-600 karakter)
4. hashtags: 6-10 hashtag populer tanpa tanda #
5. cta: Ajakan bertindak singkat (maksimal 60 karakter)
6. angle: Sudut pandang yang dipilih
7. altText: Deskripsi singkat gambar untuk aksesibilitas
8. slides: Array objek slide (title, body, visualPrompt) sejumlah yang diminta. Setiap slide harus memiliki poin yang padat, kaya informasi, dan menarik.`;

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
    const scraped = await extractArticle({ url: input.url });
    articleTitle = scraped.title;
    articleContent = scraped.content;
    articleSource = scraped.source || 'Portal Berita';
    articleUrl = scraped.url;
    articleImageUrl = scraped.imageUrl || null;
    articleAuthor = scraped.author || 'Redaksi';
  } else if (input.mode === 'text' && input.rawText) {
    articleTitle = input.rawTitle || input.rawText.split('\n')[0].slice(0, 120) || 'Berita & Informasi Terkini';
    articleContent = input.rawText;
    articleSource = 'Teks Langsung';
  } else if (input.mode === 'prompt' && input.prompt) {
    // Generate full article from prompt using Gemini
    const promptSystem = `Anda adalah jurnalis dan editor media terkemuka di Indonesia. Buatkan artikel/analisis berita yang tajam, mendalam, dan kaya fakta berdasarkan topik/ide yang diberikan pengguna. Gunakan gaya bahasa Indonesia yang mengalir, lugas, dan terstruktur piramida terbalik.`;
    
    const promptUser = `Topik/Ide Konten: "${input.prompt}"
Gaya Nada/Tone: "${input.tone || 'Informatif & Menarik'}"
Tulis artikel berita/edukasi lengkap (minimal 3-5 paragraf) dengan judul menarik.`;

    const { GoogleGenAI } = await import('@google/genai');
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error('GEMINI_API_KEY belum diatur di Environment Variables Vercel.');
    }
    const ai = new GoogleGenAI({ apiKey: key });
    
    const generated = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || 'gemini-3.6-flash',
      contents: [
        { role: 'user', parts: [{ text: `${promptSystem}\n\n${promptUser}` }] }
      ],
    });

    const fullGeneratedText = generated.text || input.prompt;
    const lines = fullGeneratedText.split('\n').filter(Boolean);
    articleTitle = lines[0]?.replace(/^[#*\-\s]+/, '') || input.prompt;
    articleContent = lines.slice(1).join('\n\n') || fullGeneratedText;
    articleSource = 'AI Generator';
  } else {
    throw new Error('Input tidak valid: URL, teks, atau prompt harus diisi.');
  }

  // 2. Run Analysis
  const toneInstruction = input.tone ? `Sesuaikan tone penulisan: ${input.tone}.` : '';
  const analysisResult = await runStructured({
    system: `${DEFAULT_ANALYZE_PROMPT}\n${toneInstruction}`,
    user: `Judul: ${articleTitle}\nSumber: ${articleSource}\n\nIsi:\n${articleContent.slice(0, 8000)}`,
    schema: analysisSchema,
  });
  const analysis = analysisResult.data;

  // 3. Generate Social Media Content & Carousel Slides
  const contentResult = await runStructured({
    system: `${DEFAULT_CONTENT_PROMPT}\nBuat tepat ${slidesCount} slide.`,
    user: JSON.stringify({
      article: { title: articleTitle, content: articleContent.slice(0, 8000) },
      analysis,
      requestedSlides: slidesCount,
    }),
    schema: contentSchema,
  });
  const { copy: content } = normalizeCopy(contentResult.data);

  // 4. Enrich Each Slide with Distinct Contextual HD Image and Metadata
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
      statHighlight: factItem ? `${factItem.label}: ${factItem.value}` : undefined,
      sourceQuote: isCover ? undefined : idx === 1 ? `"${analysis.topic}"` : undefined,
      ctaText: isOutro ? content.cta : undefined,
      secondaryCta: isOutro ? 'Ikuti @newsly.ai untuk update berita & insight harian.' : undefined,
      imageUrl: photoUrl,
      source: articleSource,
    };
  });

  const coverImageUrl = enrichedSlides[0]?.imageUrl || articleImageUrl || getContextualPhotoForSlide(analysis.category, 0, articleTitle);

  // 5. Atomic Database Save
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
