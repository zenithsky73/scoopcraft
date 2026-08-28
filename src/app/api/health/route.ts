import { NextResponse } from 'next/server';
import { db } from '@/server/db';
import { GoogleGenAI } from '@google/genai';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const diagnostics: Record<string, any> = {
    timestamp: new Date().toISOString(),
    status: 'OK',
    env: {
      hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
      hasGeminiApiKey: Boolean(process.env.GEMINI_API_KEY),
      hasAuthSecret: Boolean(process.env.AUTH_SECRET),
      geminiModel: process.env.GEMINI_MODEL || 'gemini-3.5-flash',
    },
    database: { connected: false, userCount: 0, error: null },
    ai: { ready: false, testResult: null, error: null },
  };

  // 1. Test Database
  try {
    const count = await db.user.count();
    diagnostics.database.connected = true;
    diagnostics.database.userCount = count;
  } catch (err: any) {
    diagnostics.status = 'ERROR';
    diagnostics.database.error = err?.message || String(err);
  }

  // 2. Test Gemini AI
  if (process.env.GEMINI_API_KEY) {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const model = process.env.GEMINI_MODEL || 'gemini-3.5-flash';
      const res = await ai.models.generateContent({
        model,
        contents: [{ role: 'user', parts: [{ text: 'Halo AI' }] }],
      });
      diagnostics.ai.ready = true;
      diagnostics.ai.testResult = res.text ? 'Gemini AI Aktif & Merespons Cepat' : 'Respon kosong';
    } catch (err: any) {
      diagnostics.status = 'ERROR';
      diagnostics.ai.error = err?.message || String(err);
    }
  } else {
    diagnostics.status = 'ERROR';
    diagnostics.ai.error = 'GEMINI_API_KEY belum diatur di Vercel Environment Variables.';
  }

  return NextResponse.json(diagnostics, {
    status: diagnostics.status === 'OK' ? 200 : 500,
  });
}
