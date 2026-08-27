import type { ArticleInput } from '@/server/ai/types';
import type { Analysis, GeneratedCopy } from '@/server/ai/schemas';

/**
 * Provider tiruan (AI_PROVIDER=mock). Deterministik dan tanpa jaringan —
 * dipakai untuk mengembangkan UI dan menguji pipeline tanpa membakar token.
 * Hasilnya sengaja terlihat masuk akal tapi jelas bukan tulisan AI sungguhan.
 */
export function mockAnalysis(article: ArticleInput): Analysis {
  const sentences = article.content
    .split(/\n\n|(?<=\.)\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 40);

  return {
    topic: article.title,
    category: 'LAINNYA',
    summary: sentences.slice(0, 2).join(' ') || article.title,
    keyPoints: sentences.slice(0, 4).map((s) => s.slice(0, 140)),
    facts: [{ label: 'Jumlah kata', value: String(article.wordCount) }],
    entities: [{ name: article.source ?? 'Redaksi', type: 'ORG' }],
    angles: [
      { angle: 'Apa yang terjadi', rationale: 'Sudut pandang paling langsung.' },
      { angle: 'Dampak ke masyarakat', rationale: 'Menjawab pertanyaan pembaca.' },
    ],
    recommendedAngle: 'Apa yang terjadi',
    tone: 'NEUTRAL',
    sensitivity: 'NONE',
    visualPrompt: `Editorial illustration about ${article.title}, flat vector, muted palette`,
  };
}

export function mockCopy(article: ArticleInput, analysis: Analysis): GeneratedCopy {
  return {
    headline: article.title.slice(0, 70),
    feedCopy: analysis.summary.slice(0, 180),
    caption: `[MOCK] ${analysis.summary}\n\nSumber: ${article.source ?? 'tidak diketahui'}`.slice(0, 600),
    hashtags: ['berita', 'infoterkini', 'indonesia', 'scoopcraft', 'newsupdate', 'beritahariini'],
    cta: 'Simak selengkapnya',
    angle: analysis.recommendedAngle,
    altText: `Ilustrasi berita: ${article.title}`.slice(0, 125),
    slides: analysis.keyPoints.slice(0, 4).map((point, index) => ({
      title: `Poin ${index + 1}`,
      body: point.slice(0, 150),
      visualPrompt: `Editorial photograph illustrating point ${index + 1} of ${article.title}, muted palette, cinematic`,
    })),
  };
}
