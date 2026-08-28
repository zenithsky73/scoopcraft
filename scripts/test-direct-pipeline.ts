import 'dotenv/config';
import { runStructured } from '../src/server/ai/client';
import { analysisSchema, contentSchema } from '../src/server/ai/schemas';

async function testDirectPipeline() {
  console.log('--- TESTING DIRECT STRUCTURED AI PIPELINE ---');

  const sampleArticle = {
    title: 'Bank Indonesia Tahan Suku Bunga Acuan BI-Rate di Level 6,00%',
    content: `Rapat Dewan Gubernur (RDG) Bank Indonesia pada 20-21 Agustus 2026 memutuskan untuk mempertahankan BI-Rate sebesar 6,00%, suku bunga Deposit Facility sebesar 5,25%, dan suku bunga Lending Facility sebesar 6,75%.
Gubernur BI menyatakan bahwa keputusan ini konsisten dengan fokus kebijakan moneter yang pro-stability, yaitu untuk memperkuat stabilisasi nilai tukar Rupiah dari dampak tingginya ketidakpastian global serta memastikan inflasi tetap terkendali dalam sasaran 2,5±1% pada 2026 dan 2027.
Sementara itu, kebijakan makroprudensial dan sistem pembayaran tetap pro-growth untuk mendukung pertumbuhan ekonomi yang berkelanjutan.`,
  };

  console.log('[1/2] Menjalankan Analisis Berita dengan Gemini 3.6 Flash...');
  const analysisRes = await runStructured({
    system: `Anda adalah editor media senior dan jurnalis riset di Indonesia. Analisis artikel berita ini secara objektif.`,
    user: `Judul: ${sampleArticle.title}\n\nIsi:\n${sampleArticle.content}`,
    schema: analysisSchema,
  });

  console.log('Hasil Analisis Topik:', analysisRes.data.topic);
  console.log('Key Points:', analysisRes.data.keyPoints?.length);

  console.log('\n[2/2] Menghasilkan 5 Slide Carousel Instagram...');
  const contentRes = await runStructured({
    system: `Anda adalah head of content media Instagram terpopuler di Indonesia. Buat 5 slide carousel yang sangat menarik.`,
    user: JSON.stringify({
      article: sampleArticle,
      analysis: analysisRes.data,
      requestedSlides: 5,
    }),
    schema: contentSchema,
  });

  console.log('Headline:', contentRes.data.headline);
  console.log('Caption Preview:', contentRes.data.caption?.slice(0, 100) + '...');
  console.log('Hashtags:', contentRes.data.hashtags?.join(', '));
  console.log('Jumlah Slide:', contentRes.data.slides?.length);
  console.log('\n✅ PIPELINE AI DIRECT BERHASIL 100%!');
}

testDirectPipeline().catch((err) => {
  console.error('❌ GAGAL:', err);
  process.exit(1);
});
