import { NextResponse } from 'next/server';
import { z } from 'zod';
import { GoogleGenAI } from '@google/genai';

export const runtime = 'nodejs';

const chatRequestSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant', 'system']),
        content: z.string().min(1).max(4000),
      })
    )
    .min(1)
    .max(30),
});

const SYSTEM_PROMPT = `Kamu adalah "InstaDeck Copilot" — Asisten AI Resmi & Eksklusif dari platform InstaDeck PRO (platform generator carousel media sosial bertenaga kecerdasan buatan untuk Instagram Feed & Story).

=== ATURAN UTAMA & GUARDRAIL KETAT (CRITICAL) ===
1. Kamu HANYA BOLEH DAN WAJIB HANYA menjawab pertanyaan seputar platform InstaDeck PRO:
   - Apa itu InstaDeck PRO, fitur-fitur, dan keunggulannya.
   - Cara membuat carousel (Mode Topik AI, Naskah/Teks, Link Produk/Marketplace/Web, Link Video YouTube).
   - Cara kerja studio editor slide (edit teks judul/isi, ganti foto via Unsplash atau upload sendiri, pindah posisi slide, AI Polish).
   - Fitur AI Polish (Shorten, Viral Hook, Edukatif & Wawasan, Casual Kreator).
   - Desain & 32 Template Visual (Modern, Minimalist, Bold, Dark Mode, Editorial, Social, dll).
   - Format & Rasio kanvas (Square 1:1, Portrait 4:5 yang optimal di feed Instagram, Story 9:16).
   - Fitur Brand Kit & Watermark (kustomisasi @handle akun, upload logo brand, sembunyikan watermark InstaDeck untuk paket Pro/Business).
   - Pilihan Ekspor (unduh 1 slide PNG HD, unduh semua slide ZIP, ekspor Dokumen PDF Multi-Slide HD, salin caption + hashtag).
   - Paket Langganan, Harga & Kuota:
     * Free Trial: gratis saat mendaftar untuk mencoba fitur dasar (10 kuota, 14 hari).
     * Paket Lite / Pemula (Basic): Rp 49.000/bulan (30 generate konten AI/bulan, 32 template, ekspor PNG, kalender konten & simulator jadwal).
     * Paket Kreator Pro: Rp 99.000/bulan (100 generate konten AI/bulan, Auto-Post Instagram Live, AI Campaign 30 Hari Sekali Klik, hubungkan hingga 3 akun medsos, watermark brand sendiri, ekspor PDF & ZIP batch, prioritas AI).
     * Paket Sultan / Agensi (Business): Rp 199.000/bulan (Unlimited FUP 500/bulan, semua fitur Pro, Auto-Post Multi-Akun hingga 10 akun medsos klien, Multi-Brand Campaign 30 Hari, full Brand Kit logo/warna/font, render prioritas tertinggi).
   - Tips praktis membuat konten carousel yang berpotensi viral & punya engagement tinggi di media sosial.
   - Bantuan kendala teknis atau panduan pemakaian tombol di aplikasi InstaDeck PRO.

2. ATURAN DILARANG KERAS (STRICTLY FORBIDDEN):
   - JANGAN PERNAH menjawab pertanyaan di luar InstaDeck PRO! (Misalnya: resep masakan, rumus fisika/matematika, coding pemrograman umum yang tidak ada kaitannya dengan InstaDeck, rekomendasi film/musik umum, ramalan cuaca, gosip selebriti, politik umum, sains acak, atau platform kompetitor).
   - Jika pengguna menanyakan hal di luar InstaDeck PRO, kamu HARUS menolak dengan ramah, sopan, sedikit jenaka, dan langsung mengarahkan kembali ke topik InstaDeck PRO.
   Contoh respons penolakan ramah:
   "Waduh, pertanyaan yang menarik! 😄 Tapi sebagai **Asisten Resmi InstaDeck PRO 🚀**, aku diprogram khusus hanya untuk menjawab hal-hal seputar InstaDeck PRO, pembuatan carousel, fitur studio, dan strategi konten media sosial.\n\nYuk tanyakan sesuatu tentang cara bikin carousel dari link YouTube, tips hook slide 1, atau fitur paket Pro InstaDeck! ✨"

=== GAYA KOMUNIKASI ===
- Bahasa Indonesia yang ramah, energik, profesional, dan asyik (khas kreator konten digital masa kini).
- Gunakan formatting Markdown yang rapi: gunakan **bold** untuk poin penting, bullet points (- atau 1.), dan emoji yang pas agar mudah dibaca.
- Jawab dengan jelas, padat, dan langsung memberikan solusi praktis.`;

function getSmartFallbackReply(userMessage: string): string {
  const q = userMessage.toLowerCase();

  // Guardrail check in fallback
  const isInstaDeckRelated =
    q.includes('instadeck') ||
    q.includes('carousel') ||
    q.includes('slide') ||
    q.includes('generate') ||
    q.includes('youtube') ||
    q.includes('berita') ||
    q.includes('artikel') ||
    q.includes('link') ||
    q.includes('template') ||
    q.includes('desain') ||
    q.includes('foto') ||
    q.includes('gambar') ||
    q.includes('unsplash') ||
    q.includes('watermark') ||
    q.includes('brand') ||
    q.includes('logo') ||
    q.includes('handle') ||
    q.includes('paket') ||
    q.includes('harga') ||
    q.includes('biaya') ||
    q.includes('langganan') ||
    q.includes('kuota') ||
    q.includes('pro') ||
    q.includes('business') ||
    q.includes('trial') ||
    q.includes('pdf') ||
    q.includes('png') ||
    q.includes('zip') ||
    q.includes('unduh') ||
    q.includes('download') ||
    q.includes('ekspor') ||
    q.includes('caption') ||
    q.includes('hashtag') ||
    q.includes('polish') ||
    q.includes('hook') ||
    q.includes('instagram') ||
    q.includes('story') ||
    q.includes('rasio') ||
    q.includes('feed') ||
    q.includes('tiktok') ||
    q.includes('threads') ||
    q.includes('halo') ||
    q.includes('hai') ||
    q.includes('siapa') ||
    q.includes('bisa apa') ||
    q.includes('bantuan');

  if (!isInstaDeckRelated) {
    return 'Waduh, pertanyaan yang menarik! 😄 Tapi sebagai **Asisten Resmi InstaDeck PRO 🚀**, aku diprogram khusus hanya untuk menjawab hal-hal seputar platform **InstaDeck PRO**, pembuatan carousel, fitur studio, dan strategi konten media sosial.\n\nAda yang bisa kubantu terkait cara membuat carousel, memilih template, atau paket langganan di InstaDeck? ✨';
  }

  if (q.includes('youtube')) {
    return '**Cara Membuat Carousel dari Link YouTube di InstaDeck PRO 📺:**\n\n1. Buka menu **Generate Konten** di dashboard InstaDeck.\n2. Pilih tab **Link / URL** lalu tempel tautan video YouTube (bisa link video biasa, `youtu.be`, maupun `shorts`).\n3. AI InstaDeck akan otomatis mengekstrak transkrip dan poin-poin inti video.\n4. Pilih template visual yang kamu sukai (misal: *Tech*, *Podcast*, atau *Breaking News*).\n5. Klik **Generate Carousel**! Dalam hitungan detik, carousel edukatif dengan foto thumbnail tajam siap kamu posting. 🎉';
  }

  if (q.includes('harga') || q.includes('paket') || q.includes('biaya') || q.includes('kuota') || q.includes('langganan')) {
    return '**Pilihan Paket Langganan InstaDeck PRO 💎:**\n\n' +
      '1. **Paket Lite / Pemula (Basic) — Rp 19.000/bln**\n' +
      '   - 25 Generate konten per bulan\n' +
      '   - 10 Template visual populer\n' +
      '   - Ekspor gambar PNG resolusi tinggi\n\n' +
      '2. **Paket Kreator Pro — Rp 49.000/bln (Paling Laris ⭐)**\n' +
      '   - 100 Generate konten per bulan\n' +
      '   - Kustomisasi Watermark (@akun brand sendiri)\n' +
      '   - Ekspor Dokumen PDF Multi-Slide HD\n' +
      '   - Auto-Post & Jadwal Posting Instagram\n' +
      '   - Input Link Video YouTube & Prompt AI\n' +
      '   - Unduh batch ZIP semua slide\n\n' +
      '3. **Paket Sultan / Agensi (Business) — Rp 99.000/bln 👑**\n' +
      '   - Unlimited Kuota (FUP 500 generate/bln)\n' +
      '   - Full Brand Kit (Logo, font, & warna)\n' +
      '   - Prioritas antrean AI & render tercepat\n\n' +
      'Kamu bisa upgrade kapan saja lewat menu **Langganan / Upgrade** di sidebar!';
  }

  if (q.includes('watermark') || q.includes('logo') || q.includes('brand')) {
    return '**Cara Mengatur Watermark & Brand Kit di InstaDeck PRO ✨:**\n\n' +
      '1. Buka menu **Pengaturan (Settings)** di sidebar.\n' +
      '2. Pada tab **Brand Kit**, kamu bisa memasukkan **Handle Media Sosial** kamu (misal: `@bisnishebat`).\n' +
      '3. Untuk pengguna **Paket Pro & Business**, kamu bisa mengunggah **Logo Brand** dan mencentang opsi **Sembunyikan Watermark InstaDeck** agar branding konten 100% milikmu!\n' +
      '4. Klik **Simpan Identitas Brand**, dan seluruh slide yang kamu buat otomatis menggunakan watermark barumu.';
  }

  if (q.includes('pdf') || q.includes('zip') || q.includes('unduh') || q.includes('download')) {
    return '**Pilihan Ekspor di InstaDeck PRO 🚀:**\n\n' +
      '- **Unduh PNG**: Mengunduh slide aktif yang sedang dilihat dalam format gambar HD.\n' +
      '- **Unduh ZIP (Batch)**: Mengunduh semua slide sekaligus dalam 1 folder arsip ZIP siap pakai untuk Instagram.\n' +
      '- **Ekspor Dokumen PDF**: Menggabungkan seluruh slide menjadi file PDF resolusi tinggi multi-halaman.\n' +
      '- **Salin Caption**: Menyalin naskah caption lengkap beserta hashtag relevan yang dibuatkan AI ke clipboard kamu.';
  }

  return 'Halo! Saya **InstaDeck Copilot**, asisten AI resmi InstaDeck. 🚀\n\nSaya siap membantu kamu menguasai seluruh fitur InstaDeck PRO, seperti:\n- ⚡ **Membuat Carousel Otomatis** dari Topik, Naskah, Link Produk/Web, atau Video YouTube\n- 🎨 **Memilih dari 32 Template Desain** (Modern, Bold, Minimalist, Dark Mode, dll)\n- 💎 **Info Paket Langganan & Kuota** (Basic Rp49rb, Pro Rp99rb, Business Rp199rb)\n- 🏷️ **Kustomisasi Brand & Watermark** akunmu\n- 📄 **Ekspor Carousel ke Gambar HD, ZIP & PDF**\n\nAda yang ingin kamu tanyakan atau butuh bantuan saat ini?';
}

export async function POST(req: Request) {
  try {
    const raw = await req.json();
    const parsed = chatRequestSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Format pesan tidak valid.' }, { status: 400 });
    }

    const { messages } = parsed.data;
    const latestUserMsg = [...messages].reverse().find((m) => m.role === 'user')?.content || '';
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      const fallbackReply = getSmartFallbackReply(latestUserMsg);
      return NextResponse.json({ reply: fallbackReply });
    }

    try {
      const ai = new GoogleGenAI({ apiKey });
      const conversationHistory = messages
        .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
        .join('\n\n');
      const prompt = `${SYSTEM_PROMPT}\n\n=== RIWAYAT PERCAKAPAN ===\n${conversationHistory}\n\nAssistant:`;

      const modelsToTry = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
      let aiResponseText = '';

      for (const model of modelsToTry) {
        try {
          const response = await ai.models.generateContent({
            model,
            contents: prompt,
          });
          if (response.text && response.text.trim().length > 0) {
            aiResponseText = response.text.trim();
            break;
          }
        } catch (mErr) {
          console.warn(`[assistant-chat] Model ${model} failed, trying fallback...`, mErr);
        }
      }

      if (!aiResponseText) {
        aiResponseText = getSmartFallbackReply(latestUserMsg);
      }

      return NextResponse.json({ reply: aiResponseText });
    } catch (genErr: any) {
      console.error('[assistant-chat] Generation error:', genErr);
      const fallbackReply = getSmartFallbackReply(latestUserMsg);
      return NextResponse.json({ reply: fallbackReply });
    }
  } catch (err: any) {
    console.error('[assistant-chat] Route handler error:', err);
    return NextResponse.json(
      { error: err?.message || 'Terjadi kesalahan sistem pada asisten.' },
      { status: 500 }
    );
  }
}