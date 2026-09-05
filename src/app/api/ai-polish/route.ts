import { NextResponse } from 'next/server';
import { z } from 'zod';
import { GoogleGenAI } from '@google/genai';

export const runtime = 'nodejs';

const polishSchema = z.object({
  text: z.string().min(1).max(1000),
  mode: z.enum(['SHORTEN', 'HOOK', 'FORMAL', 'CASUAL']).default('SHORTEN'),
});

const INSTRUCTIONS: Record<string, string> = {
  SHORTEN: 'Persingkat teks ini menjadi 1 kalimat padat, kuat, dan hemat kata (maksimal 15 kata). Hilangkan kata-kata mubazir, tetap pertahankan fakta intinya.',
  HOOK: 'Ubah teks ini menjadi kalimat hook yang memancing rasa penasaran tinggi (clicky/viral) ala media sosial modern tanpa terkesan murahan atau clickbait palsu.',
  FORMAL: 'Tulis ulang teks ini dengan gaya bahasa jurnalistik formal, lugas, kredibel, dan berwibawa ala portal media nasional terkemuka.',
  CASUAL: 'Tulis ulang teks ini dengan bahasa santai, mengalir, ramah, dan bersahabat ala konten kreator Gen-Z tanpa kehilangan makna inti.',
};

export async function POST(req: Request) {
  try {
    const raw = await req.json();
    const parsed = polishSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Input teks tidak valid.' }, { status: 400 });
    }

    const { text, mode } = parsed.data;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // Fallback polishing if API key is not present
      const fallback =
        mode === 'SHORTEN'
          ? text.split('.')[0] || text.slice(0, 80)
          : mode === 'HOOK'
          ? `🔥 Fakta Kunci: ${text}`
          : mode === 'FORMAL'
          ? `Berdasarkan laporan terkini: ${text}`
          : `Tahu nggak sih? ${text}`;
      return NextResponse.json({ success: true, polishedText: fallback });
    }

    const ai = new GoogleGenAI({ apiKey });
    const prompt = `Anda adalah editor naskah carousel media sosial profesional berbahasa Indonesia.
Instruksi: ${INSTRUCTIONS[mode]}
Teks asli: "${text}"

ATURAN KETAT:
- Kembalikan HANYA teks hasil tulisan ulang saja.
- JANGAN tambahkan tanda kutip di awal dan akhir.
- JANGAN tambahkan penjelasan atau kata pengantar apapun.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const polishedText = response.text ? response.text.trim().replace(/^["']|["']$/g, '') : text;

    return NextResponse.json({
      success: true,
      polishedText: polishedText || text,
    });
  } catch (err: any) {
    console.error('[ai-polish] error:', err);
    return NextResponse.json(
      { error: err?.message || 'Gagal memproses AI Polish.' },
      { status: 500 },
    );
  }
}
