import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';

async function testGemini() {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || 'gemini-3.6-flash';

  console.log('--- TEST KONEKSI GOOGLE GEMINI 3.6 FLASH ---');
  console.log('Model Target:', model);
  console.log('API Key terdeteksi:', apiKey ? `${apiKey.slice(0, 8)}...${apiKey.slice(-6)}` : 'TIDAK ADA');

  if (!apiKey) {
    console.error('ERROR: GEMINI_API_KEY tidak ditemukan di .env!');
    process.exit(1);
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    console.log('\n[1/2] Menguji generateContent teks standar...');
    const textRes = await ai.models.generateContent({
      model,
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: 'Sapa pengguna Scoopcraft dalam 1 kalimat pendek dan bersemangat dalam bahasa Indonesia.',
            },
          ],
        },
      ],
    });

    console.log('Hasil Respon Teks:\n', textRes.text?.trim());

    console.log('\n[2/2] Menguji Structured JSON Output (Format Carousel Scoopcraft)...');
    const schema = {
      type: 'OBJECT',
      properties: {
        headline: { type: 'STRING' },
        tag: { type: 'STRING' },
        slides: {
          type: 'ARRAY',
          items: {
            type: 'OBJECT',
            properties: {
              index: { type: 'INTEGER' },
              title: { type: 'STRING' },
              body: { type: 'STRING' },
            },
            required: ['index', 'title', 'body'],
          },
        },
      },
      required: ['headline', 'tag', 'slides'],
    };

    const jsonRes = await ai.models.generateContent({
      model,
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: 'Buatkan contoh 3 slide carousel singkat bertema "Tips Finansial Cerdas 2026" dalam format JSON.',
            },
          ],
        },
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: schema,
      },
    });

    console.log('Hasil Respon JSON:\n', jsonRes.text);
    const parsed = JSON.parse(jsonRes.text || '{}');
    console.log('JSON Valid? ->', parsed.headline ? 'YA ✅' : 'TIDAK ❌');
    console.log(`Jumlah slide: ${parsed.slides?.length || 0}`);

    console.log('\n✅ KONEKSI GEMINI 3.6 FLASH SUKSES 100%!');
  } catch (error: any) {
    console.error('\n❌ GAGAL MENGHUBUNGI GEMINI:', error?.message || error);
    process.exit(1);
  }
}

testGemini();
