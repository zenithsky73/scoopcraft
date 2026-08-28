export type Effort = 'low' | 'medium' | 'high' | 'xhigh' | 'max';
export type AiProvider = 'anthropic' | 'gemini' | 'openai' | 'mock';

function num(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

/**
 * Konfigurasi multi-provider AI: Anthropic Claude, Google Gemini, OpenAI, dan Mock.
 * Otomatis mendeteksi provider aktif berdasarkan API key yang tersedia.
 */
export const AI = {
  get provider(): AiProvider {
    if (process.env.AI_PROVIDER) return process.env.AI_PROVIDER as AiProvider;
    if (process.env.GEMINI_API_KEY) return 'gemini';
    if (process.env.OPENAI_API_KEY) return 'openai';
    if (process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN) return 'anthropic';
    return 'gemini';
  },
  get model(): string {
    if (this.provider === 'gemini') {
      return process.env.GEMINI_MODEL ?? 'gemini-3.6-flash';
    }
    if (this.provider === 'openai') {
      return process.env.OPENAI_MODEL ?? 'gpt-4o-mini';
    }
    return process.env.ANTHROPIC_MODEL ?? 'claude-3-7-sonnet-20250219';
  },
  get maxTokens(): number {
    return num(process.env.AI_MAX_TOKENS ?? process.env.ANTHROPIC_MAX_TOKENS, 8000);
  },
  get effort(): Effort {
    return (process.env.ANTHROPIC_EFFORT as Effort) ?? 'medium';
  },
  /** Potong isi artikel sebelum dikirim — bagian awal berita sudah memuat
   *  inti (piramida terbalik), sisanya hanya menambah biaya token. */
  get maxArticleChars(): number {
    return num(process.env.AI_MAX_ARTICLE_CHARS, 12000);
  },
};
