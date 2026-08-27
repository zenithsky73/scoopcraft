import { AI } from '@/config/ai';
import { runStructured } from '@/server/ai/client';
import { contentSchema, type Analysis, type GeneratedCopy } from '@/server/ai/schemas';
import { CONTENT_SYSTEM, buildContentUserPrompt } from '@/server/ai/prompts/generate-content';
import { normalizeCopy } from '@/server/ai/validate';
import { mockCopy } from '@/server/ai/mock';
import type { ArticleInput } from '@/server/ai/types';

export type GenerateContentResult = {
  copy: GeneratedCopy;
  warnings: string[];
  usage: { inputTokens: number; outputTokens: number; model: string };
};

export async function generateContent(
  article: ArticleInput,
  analysis: Analysis,
  options: { angle?: string } = {},
): Promise<GenerateContentResult> {
  if (AI.provider === 'mock') {
    const { copy, warnings } = normalizeCopy(mockCopy(article, analysis));
    return { copy, warnings, usage: { inputTokens: 0, outputTokens: 0, model: 'mock' } };
  }

  const { data, usage } = await runStructured({
    system: CONTENT_SYSTEM,
    user: buildContentUserPrompt(article, analysis, options),
    schema: contentSchema,
  });

  const { copy, warnings } = normalizeCopy(data);
  return { copy, warnings, usage };
}
