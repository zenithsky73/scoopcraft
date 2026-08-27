import { AI } from '@/config/ai';
import { runStructured } from '@/server/ai/client';
import { analysisSchema, type Analysis } from '@/server/ai/schemas';
import { ANALYZE_SYSTEM, buildAnalyzeUserPrompt } from '@/server/ai/prompts/analyze';
import { mockAnalysis } from '@/server/ai/mock';
import type { ArticleInput } from '@/server/ai/types';

export type AnalyzeResult = {
  analysis: Analysis;
  usage: { inputTokens: number; outputTokens: number; model: string };
};

export async function analyzeArticle(article: ArticleInput): Promise<AnalyzeResult> {
  if (AI.provider === 'mock') {
    return { analysis: mockAnalysis(article), usage: { inputTokens: 0, outputTokens: 0, model: 'mock' } };
  }

  const { data, usage } = await runStructured({
    system: ANALYZE_SYSTEM,
    user: buildAnalyzeUserPrompt(article),
    schema: analysisSchema,
  });

  return { analysis: data, usage };
}
