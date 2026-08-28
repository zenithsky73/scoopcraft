import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY!;
const ai = new GoogleGenAI({ apiKey });

async function testGeminiDirect() {
  console.log('Testing direct Gemini 3.5 Flash JSON prompt...');
  const prompt = `Anda adalah Executive Content Creator Instagram Indonesia.
Buatkan naskah Carousel 5 slide yang sangat mendalam dan akurat tentang:
"Daftar Motor Listrik di Indonesia dan Jenis Baterai yang Digunakan"

Kembalikan HANYA JSON murni (valid JSON) dengan struktur persis berikut:
{
  "category": "TEKNOLOGI",
  "headline": "Daftar Motor Listrik di Indonesia dan Jenis Baterainya",
  "feedCopy": "Panduan lengkap memilih motor listrik hemat dengan teknologi baterai terbaik di Indonesia.",
  "caption": "Mulai beralih ke kendaraan listrik? Simak perbandingan baterai motor listrik berikut!",
  "hashtags": ["#MotorListrik", "#Gesits", "#Alva", "#Polytron", "#KendaraanListrik"],
  "cta": "Simpan & bagikan ke temanmu!",
  "slides": [
    {
      "index": 0,
      "title": "Gesits & Baterai Lithium-NMC",
      "body": "Gesits menggunakan baterai Lithium-NMC berkapasitas 72V 20Ah dengan jarak tempuh hingga 50 km per baterai.",
      "statHighlight": "Jarak: 50-100 KM",
      "quote": "Baterai swap praktis di SPBKLU"
    },
    {
      "index": 1,
      "title": "Alva Cervo & Baterai Lithium",
      "body": "Alva Cervo dibekali baterai Lithium 73.8V 24Ah dengan tenaga buas dan jarak tempuh mencapai 125 km (2 baterai).",
      "statHighlight": "Top Speed: 103 KM/H",
      "quote": "Dukungan fast charging modern"
    },
    {
      "index": 2,
      "title": "Polytron Fox-R & Sewa Baterai",
      "body": "Polytron Fox-R menggunakan baterai LiFePO4 (LFP) 3.75 kWh dengan sistem sewa baterai bulanan yang terjangkau.",
      "statHighlight": "Kapasitas: 3.75 kWh",
      "quote": "Garansi baterai seumur hidup"
    },
    {
      "index": 3,
      "title": "Perbedaan Baterai LFP vs SLA",
      "body": "Baterai LFP (Lithium Iron Phosphate) lebih awet dan tahan panas, sedangkan SLA (Sealed Lead Acid) lebih murah tapi lebih berat.",
      "statHighlight": "Siklus: 2000+ Cycle",
      "quote": "Pilih LFP untuk pemakaian jangka panjang"
    },
    {
      "index": 4,
      "title": "Tips Memilih Motor Listrik Sesuai Kebutuhan",
      "body": "Pertimbangkan ketersediaan stasiun swap baterai, jarak tempuh harian, dan garansi resmi sebelum membeli.",
      "statHighlight": "Hemat Biaya: 70%",
      "quote": "Investasi hemat masa depan"
    }
  ]
}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        responseMimeType: 'application/json',
      },
    });

    console.log('RESPONSE TEXT:');
    console.log(response.text);
    const parsed = JSON.parse(response.text || '{}');
    console.log('PARSED SLIDES COUNT:', parsed.slides?.length);
    console.log('SLIDE 1 TITLE:', parsed.slides?.[0]?.title);
    console.log('SLIDE 2 TITLE:', parsed.slides?.[1]?.title);
  } catch (err: any) {
    console.error('ERROR:', err);
  }
}

testGeminiDirect();
