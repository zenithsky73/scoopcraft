/**
 * Uji pipeline AI tanpa database & tanpa Redis:
 *   npx tsx scripts/pipeline.ts <url>            # panggil Claude sungguhan
 *   npx tsx scripts/pipeline.ts <url> --mock     # provider tiruan, tanpa jaringan
 *   npx tsx scripts/pipeline.ts <url> --dry      # cetak prompt + JSON schema, tanpa panggilan API
 */
import 'dotenv/config';
import { betaZodOutputFormat } from '@anthropic-ai/sdk/helpers/beta/zod';
import { extractArticle, isScrapeError } from '../src/server/scraper';
import { analysisSchema, contentSchema } from '../src/server/ai/schemas';
import { ANALYZE_SYSTEM, buildAnalyzeUserPrompt } from '../src/server/ai/prompts/analyze';
import { CONTENT_SYSTEM, buildContentUserPrompt } from '../src/server/ai/prompts/generate-content';
import { mockAnalysis } from '../src/server/ai/mock';
import type { ArticleInput } from '../src/server/ai/types';

const line = (label = '') => console.log(`\n${'─'.repeat(4)} ${label} ${'─'.repeat(Math.max(0, 66 - label.length))}`);

async function main() {
  const args = process.argv.slice(2);
  const url = args.find((arg) => !arg.startsWith('--'));
  const dry = args.includes('--dry');
  if (args.includes('--mock')) process.env.AI_PROVIDER = 'mock';

  if (!url) {
    console.error('Pakai: npx tsx scripts/pipeline.ts <url> [--mock] [--dry]');
    process.exit(1);
  }

  const extracted = await extractArticle({ url });
  const article: ArticleInput = {
    title: extracted.title,
    content: extracted.content,
    url: extracted.url,
    source: extracted.source,
    author: extracted.author,
    publishedAt: extracted.publishedAt,
    wordCount: extracted.wordCount,
  };

  line('ARTIKEL');
  console.log(`${article.title}\n${article.source} · ${article.wordCount} kata · ${extracted.scrapedVia}`);

  if (dry) {
    line('SYSTEM PROMPT — ANALYZE');
    console.log(ANALYZE_SYSTEM);
    line('USER PROMPT — ANALYZE');
    console.log(buildAnalyzeUserPrompt(article));
    line('JSON SCHEMA — ANALYSIS');
    console.log(JSON.stringify(betaZodOutputFormat(analysisSchema), null, 2));

    const sample = mockAnalysis(article);
    line('SYSTEM PROMPT — CONTENT');
    console.log(CONTENT_SYSTEM);
    line('USER PROMPT — CONTENT (pakai analisis contoh)');
    console.log(buildContentUserPrompt(article, sample));
    line('JSON SCHEMA — CONTENT');
    console.log(JSON.stringify(betaZodOutputFormat(contentSchema), null, 2));
    return;
  }

  // Import setelah AI_PROVIDER sempat di-set di atas.
  const { analyzeArticle } = await import('../src/server/ai/analyze');
  const { generateContent } = await import('../src/server/ai/generate-content');

  const t0 = Date.now();
  const { analysis, usage: analysisUsage } = await analyzeArticle(article);
  const t1 = Date.now();

  line('ANALISIS');
  console.log(`Topik      : ${analysis.topic}`);
  console.log(`Kategori   : ${analysis.category} · nada ${analysis.tone} · sensitivity ${analysis.sensitivity}`);
  console.log(`Ringkasan  : ${analysis.summary}`);
  console.log('Poin inti  :');
  analysis.keyPoints.forEach((point) => console.log(`  - ${point}`));
  console.log('Fakta      :');
  analysis.facts.forEach((fact) => console.log(`  - ${fact.label}: ${fact.value}`));
  console.log(`Entitas    : ${analysis.entities.map((e) => `${e.name} (${e.type})`).join(', ')}`);
  console.log('Angle      :');
  analysis.angles.forEach((a) => console.log(`  - ${a.angle} — ${a.rationale}`));
  console.log(`Dipakai    : ${analysis.recommendedAngle}`);
  console.log(`Visual     : ${analysis.visualPrompt}`);

  const { copy, warnings, usage: copyUsage } = await generateContent(article, analysis);
  const t2 = Date.now();

  line('KONTEN');
  console.log(`Headline (${copy.headline.length}/70)  : ${copy.headline}`);
  console.log(`FeedCopy (${copy.feedCopy.length}/180) : ${copy.feedCopy}`);
  console.log(`CTA      (${copy.cta.length}/60)  : ${copy.cta}`);
  console.log(`AltText  (${copy.altText.length}/125) : ${copy.altText}`);
  console.log(`Hashtag  (${copy.hashtags.length})     : ${copy.hashtags.map((h) => `#${h}`).join(' ')}`);
  console.log(`\nCaption (${copy.caption.length}/600):\n${copy.caption}`);
  if (warnings.length) console.log(`\nCatatan: ${warnings.join(' | ')}`);

  line('BIAYA & WAKTU');
  const tokens = (u: { inputTokens: number; outputTokens: number }) => `${u.inputTokens} in / ${u.outputTokens} out`;
  console.log(`analysis : ${tokens(analysisUsage)} · ${t1 - t0}ms · ${analysisUsage.model}`);
  console.log(`content  : ${tokens(copyUsage)} · ${t2 - t1}ms · ${copyUsage.model}`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    if (isScrapeError(err)) console.error(`GAGAL SCRAPE [${err.code}] ${err.message}`);
    else console.error(err);
    process.exit(2);
  });
