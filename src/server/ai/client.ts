import Anthropic from '@anthropic-ai/sdk';
import { betaZodOutputFormat } from '@anthropic-ai/sdk/helpers/beta/zod';
import { GoogleGenAI } from '@google/genai';
import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import type { z } from 'zod';
import { AI } from '@/config/ai';
import { AiError } from '@/server/ai/errors';

const globalForAi = globalThis as unknown as {
  anthropic?: Anthropic;
  gemini?: GoogleGenAI;
  openai?: OpenAI;
};

function getAnthropicClient() {
  if (!globalForAi.anthropic) {
    if (!process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_AUTH_TOKEN) {
      throw new AiError('NO_API_KEY', 'ANTHROPIC_API_KEY tidak ditemukan.');
    }
    globalForAi.anthropic = new Anthropic();
  }
  return globalForAi.anthropic;
}

function getGeminiClient() {
  if (!globalForAi.gemini) {
    if (!process.env.GEMINI_API_KEY) {
      throw new AiError('NO_API_KEY', 'GEMINI_API_KEY tidak ditemukan.');
    }
    globalForAi.gemini = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return globalForAi.gemini;
}

function getOpenAiClient() {
  if (!globalForAi.openai) {
    if (!process.env.OPENAI_API_KEY) {
      throw new AiError('NO_API_KEY', 'OPENAI_API_KEY tidak ditemukan.');
    }
    globalForAi.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return globalForAi.openai;
}

export type StructuredResult<T> = {
  data: T;
  usage: { inputTokens: number; outputTokens: number; model: string };
};

/**
 * Titik masuk utama eksekusi AI terstruktur multi-provider (Google Gemini, Anthropic Claude, OpenAI).
 */
export async function runStructured<S extends z.ZodType>({
  system,
  user,
  schema,
  effort = AI.effort,
}: {
  system: string;
  user: string;
  schema: S;
  effort?: typeof AI.effort;
}): Promise<StructuredResult<z.infer<S>>> {
  const provider = AI.provider;

  if (provider === 'gemini') {
    return runGeminiStructured({ system, user, schema });
  }

  if (provider === 'openai') {
    return runOpenAiStructured({ system, user, schema });
  }

  return runAnthropicStructured({ system, user, schema, effort });
}

/** 1. Eksekusi Structured Output via Google Gemini (Direct, Fast, dengan Smart Retry) */
async function runGeminiStructured<S extends z.ZodType>({
  system,
  user,
  schema,
}: {
  system: string;
  user: string;
  schema: S;
}): Promise<StructuredResult<z.infer<S>>> {
  const client = getGeminiClient();
  const primaryModel = process.env.GEMINI_MODEL || 'gemini-3.5-flash';
  const modelsToTry = [primaryModel, 'gemini-3.5-flash', 'gemini-3.5-flash-lite', 'gemini-3.6-flash'];

  let lastError: any = null;

  for (const model of modelsToTry) {
    try {
      const formatHelper = zodResponseFormat(schema, 'result');
      const responseSchema = (formatHelper as any).json_schema.schema;

      const response = await client.models.generateContent({
        model,
        contents: [
          { role: 'user', parts: [{ text: `System Instructions:\n${system}\n\nTask Input:\n${user}` }] },
        ],
        config: {
          responseMimeType: 'application/json',
          responseSchema,
        },
      });

      const text = response.text;
      if (!text) throw new AiError('INVALID_OUTPUT', 'Keluaran Gemini kosong.');

      let rawJson: unknown;
      try {
        rawJson = JSON.parse(text);
      } catch {
        throw new AiError('INVALID_OUTPUT', 'Gagal mem-parsing keluaran JSON dari Gemini.');
      }

      const parsed = schema.parse(rawJson);
      return {
        data: parsed as z.infer<S>,
        usage: {
          inputTokens: response.usageMetadata?.promptTokenCount ?? 0,
          outputTokens: response.usageMetadata?.candidatesTokenCount ?? 0,
          model,
        },
      };
    } catch (err: any) {
      lastError = err;
      const isRateLimit = err.status === 429 || String(err.message).includes('RESOURCE_EXHAUSTED');
      if (isRateLimit) {
        // Beri jeda 1 detik lalu coba fallback model berikutnya
        await new Promise((res) => setTimeout(res, 1000));
        continue;
      }
      if (err instanceof AiError) throw err;
      if (err.name === 'ZodError') return Promise.reject(new AiError('INVALID_OUTPUT', err.message));
      throw new AiError('UNKNOWN', err.message || String(err));
    }
  }

  if (lastError?.status === 429 || String(lastError?.message).includes('RESOURCE_EXHAUSTED')) {
    throw new AiError('RATE_LIMITED', 'Batas kuota Gemini tercapai. Silakan coba kembali dalam beberapa detik.');
  }

  throw new AiError('UNKNOWN', lastError?.message || String(lastError));
}

/** 2. Eksekusi Structured Output via Anthropic Claude */
async function runAnthropicStructured<S extends z.ZodType>({
  system,
  user,
  schema,
  effort,
}: {
  system: string;
  user: string;
  schema: S;
  effort?: typeof AI.effort;
}): Promise<StructuredResult<z.infer<S>>> {
  const client = getAnthropicClient();

  try {
    const response = await client.beta.messages.parse({
      model: AI.model,
      max_tokens: AI.maxTokens,
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      system,
      messages: [{ role: 'user', content: user }],
      output_config: {
        format: betaZodOutputFormat(schema),
        effort,
      },
    });

    if (response.stop_reason === 'refusal') {
      throw new AiError('REFUSED', response.stop_details?.explanation ?? undefined);
    }
    if (response.stop_reason === 'max_tokens') {
      throw new AiError('INVALID_OUTPUT', 'Keluaran terpotong batas max_tokens.');
    }

    const parsed = response.parsed_output;
    if (!parsed) throw new AiError('INVALID_OUTPUT', 'Keluaran Claude kosong.');

    return {
      data: parsed as z.infer<S>,
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
        model: response.model,
      },
    };
  } catch (err) {
    throw toAnthropicError(err);
  }
}

/** 3. Eksekusi Structured Output via OpenAI */
async function runOpenAiStructured<S extends z.ZodType>({
  system,
  user,
  schema,
}: {
  system: string;
  user: string;
  schema: S;
}): Promise<StructuredResult<z.infer<S>>> {
  const client = getOpenAiClient();
  const model = AI.model;

  try {
    const completion = await client.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      response_format: zodResponseFormat(schema, 'result'),
    });

    const content = completion.choices[0]?.message.content;
    if (!content) throw new AiError('INVALID_OUTPUT', 'Keluaran OpenAI kosong.');

    const rawJson = JSON.parse(content);
    const parsed = schema.parse(rawJson);

    return {
      data: parsed as z.infer<S>,
      usage: {
        inputTokens: completion.usage?.prompt_tokens ?? 0,
        outputTokens: completion.usage?.completion_tokens ?? 0,
        model,
      },
    };
  } catch (err: any) {
    if (err instanceof AiError) throw err;
    if (err.name === 'ZodError') return Promise.reject(new AiError('INVALID_OUTPUT', err.message));
    if (err.status === 429) throw new AiError('RATE_LIMITED', err.message);
    if (err.status === 401) throw new AiError('AUTH', err.message);
    throw new AiError('UNKNOWN', err.message || String(err));
  }
}

function toAnthropicError(err: unknown): AiError {
  if (err instanceof AiError) return err;
  if (err instanceof Error && err.name === 'ZodError') return new AiError('INVALID_OUTPUT', err.message);

  if (err instanceof Anthropic.AuthenticationError) return new AiError('AUTH', err.message);
  if (err instanceof Anthropic.RateLimitError) return new AiError('RATE_LIMITED', err.message);
  if (err instanceof Anthropic.BadRequestError) return new AiError('INVALID_OUTPUT', err.message);
  if (err instanceof Anthropic.InternalServerError) return new AiError('OVERLOADED', err.message);
  if (err instanceof Anthropic.APIConnectionError) return new AiError('OVERLOADED', err.message);
  if (err instanceof Anthropic.APIError) return new AiError('UNKNOWN', `${err.status}: ${err.message}`);

  return new AiError('UNKNOWN', err instanceof Error ? err.message : String(err));
}
