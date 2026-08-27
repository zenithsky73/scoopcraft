# 🚀 SCOOPCRAFT MASTER BLUEPRINT & PROMPT
## Panduan Lengkap Membangun Ulang Aplikasi dari Nol di Chat Baru

Dokumen ini berisi seluruh spesifikasi, arsitektur, referensi desain visual media Instagram Indonesia, kredensial konfigurasi, serta **Master Prompt siap salin (copy-paste)** untuk Anda gunakan saat membuka chat baru di Antigravity.

---

## 📌 1. INFORMASI PROYEK & KREDENSIAL

* **Nama Aplikasi:** Scoopcraft (AI Instagram & Social Media Carousel/Feed Generator)
* **Direktori Proyek:** `D:\Scoopcraft`
* **GitHub Repository:** `https://github.com/zenithsky73/scoopcraft.git` (Branch: `main`)
* **Vercel Deployment:** `https://vercel.com/zenithsky73s-projects/scoopcraft` (Live: `https://scoopcraft.vercel.app`)
* **AI Engine:** Google Gemini (Model Wajib: **`gemini-3.6-flash`**)
* **Gemini API Key:** (Tersimpan di `.env` dan Vercel Environment Variables: `GEMINI_API_KEY`)
* **Database:** PostgreSQL (Neon Serverless via Prisma ORM)
* **Auth:** NextAuth v5 (Credentials + Guest Session Mode)

---

## 🎨 2. 10 PRESET DESAIN MEDIA INSTAGRAM INDONESIA

Aplikasi memiliki 10 preset gaya desain visual yang terinspirasi dari akun Instagram terpopuler di Indonesia:

1. **Breaking News Pro** (`@fakta.indo`, `@indozone.id`, `@indotoday`) — Merah cerah/putih, kontras tinggi, foto latar tajam, badge BREAKING berita viral.
2. **Finansial & Cuan** (`@ngomonginuang`, `@mikirduit`) — Emerald green & deep navy, kartu data terstruktur, angka metrik tebal, sangat kredibel.
3. **Saham & Trading Tech** (`@supercuansaham.id`) — Dark modern, aksen neon gold/cyan, kartu ticker saham, analisis poin padat.
4. **Editorial Nasional** (`@infonesiaku.id`, `@redaksinasional`) — Jurnalisme elegan, tipografi serif modern, layout koran kontemporer berkelas.
5. **Tentang Kampus & Edukasi** (`@tentangkampus_id`) — Kartu pastel lembut ramah Gen-Z, font bulat bersahabat, ikon edukasi rapi.
6. **Sport & Dynamic Energy** (`@kepoball`) — Tipografi miring ultra-bold, efek glow berenergi tinggi, aksen kuning kontras.
7. **Karier & Networking** (`@ilmu_networking`, `@official.indeed`) — Desain korporat bersih, kartu tips bertingkat (1-2-3), layout profesional LinkedIn & IG.
8. **Fakta Pop & Trivia** (`@voxpopular.id`, `@faktadanmitos`) — Warna pop vibrant, kartu Fakta vs Mitos, badge Taukah Kamu.
9. **Modern Clean Media** — Layout geometris, aksen blok tegas, tipografi sans-serif modern dan presisi.
10. **Minimalist Pure** — Ruang bernapas luas, minimalis tanpa distraksi, sangat bersih dan estetis.

---

## ⚡ 3. FITUR UTAMA YANG WAJIB ADA

1. **3 Mode Input Generator:**
   - 🔗 **Link Berita / YouTube:** Tempel link artikel portal berita atau video YouTube.
   - 📝 **Salin Teks Berita:** Salin naskah berita / press release / artikel panjang.
   - ✨ **Tulis Prompt Ide AI:** Cukup ketik topik ide singkat, AI Gemini 3.6 Flash akan otomatis meriset dan membuat artikel serta susunan carousel-nya.
2. **Alur Pemilihan Desain:**
   - Di formulir awal: Pengguna hanya memilih **1 gaya visual**.
   - Setelah selesai di-generate: Pengguna masuk ke **Studio Editor Interaktif** dan bisa **beralih mencoba 10 template gaya lainnya secara instan (1-klik)** tanpa perlu generate AI ulang!
3. **Studio Editor Interaktif:**
   - Live Slide Navigator (Pindah slide 1, 2, 3... dengan animasi halus).
   - Format Rasio: Feed Portrait (4:5 - standar IG), Square (1:1), Story (9:16).
   - Live Text Edit (bisa ubah judul/poin langsung di tempat).
   - Generator Caption & Hashtag siap posting dengan tombol "Salin Semua".
   - Download Slide per halaman / seluruh slide.
4. **Sistem Kuota & Pemilik:**
   - Tamu: 10x generate gratis.
   - User Terdaftar: 20x generate gratis.
   - Pemilik (`OWNER`): Tanpa batas kuota.
5. **Arsitektur Direct Synchronous Serverless:**
   - Eksekusi AI Gemini secara langsung (< 4 detik) pada endpoint Next.js Route Handler, hindari background worker BullMQ di Vercel yang rentan freeze/timeout.

---

## 📋 4. MASTER PROMPT SIAP SALIN UNTUK CHAT BARU

> **Petunjuk:** Salin seluruh teks di dalam blok kode di bawah ini, lalu tempelkan langsung ke chat baru Antigravity Anda.

```markdown
Halo Antigravity! Saya ingin membangun ulang aplikasi Scoopcraft dari awal di workspace D:\Scoopcraft.

Berikut adalah spesifikasi lengkap dan ketentuan yang wajib dipenuhi:

### 1. Tujuan Aplikasi
Scoopcraft adalah platform AI Pembuat Carousel & Feed Media Sosial Kelas Dunia (fokus Instagram & LinkedIn) terbaik di Indonesia.

### 2. Fitur Utama
1. **3 Mode Input Pembuatan Konten:**
   - Mode Link: Tempel URL artikel berita (Detik, Kompas, CNN, Antara, Tirto, dll.) atau video YouTube.
   - Mode Teks: Salin-tempel naskah berita / press release.
   - Mode Prompt Ide: Tulis topik singkat, AI akan meriset dan menyusun carousel secara otomatis.
2. **10 Preset Desain Visual Media Instagram Indonesia:**
   - Breaking News Pro (@fakta.indo, @indozone.id)
   - Finansial & Cuan (@ngomonginuang, @mikirduit)
   - Saham & Trading Tech (@supercuansaham.id)
   - Editorial Nasional (@infonesiaku.id, @redaksinasional)
   - Tentang Kampus & Edukasi (@tentangkampus_id)
   - Sport & Dynamic Energy (@kepoball)
   - Karier & Networking (@ilmu_networking, @official.indeed)
   - Fakta Pop & Trivia (@voxpopular.id, @faktadanmitos)
   - Modern Clean Media
   - Minimalist Pure
3. **Alur Pemilihan Desain:**
   - Di formulir input awal, user memilih 1 gaya visual.
   - Setelah digenerate, halaman langsung menampilkan Carousel Studio Editor, di mana user bisa beralih mencoba 10 template gaya lainnya secara instan (1-klik) tanpa re-generate AI.
4. **Studio Editor Interaktif:**
   - Live Canvas Renderer dengan rasio Feed Portrait 4:5, Square 1:1, dan Story 9:16.
   - Live Text Editor untuk mengedit headline, isi poin slide, dan watermark handle media.
   - Caption & Hashtag Box lengkap dengan tombol 1-klik "Salin Semua".
   - Download slide resolusi tinggi.
5. **Sistem Kuota:**
   - Tamu: 10x generate gratis.
   - Terdaftar: 20x generate gratis.
   - Akun Pemilik (OWNER): Unlimited generate.

### 3. Arsitektur & Kredensial Teknis
- **Stack:** Next.js 14 App Router, TypeScript, Tailwind CSS, Prisma ORM, PostgreSQL (Neon), NextAuth v5.
- **AI SDK & Model:** Gunakan Google Gemini SDK `@google/genai` dengan model WAJIB: `gemini-3.6-flash`.
- **API Key:** Diambil otomatis dari `.env` dan Vercel Environment Variables (`GEMINI_API_KEY`)
- **Arsitektur Eksekusi:** Gunakan Direct Synchronous Serverless Engine (Next.js route handler /api/generate dengan export const maxDuration = 60 dan export const dynamic = 'force-dynamic') agar proses selesai cepat (< 4 detik) dan bebas error timeout di Vercel. Hindari penggunaan BullMQ background worker pada environment Vercel serverless.

Tolong periksa struktur file yang ada di D:\Scoopcraft, bersihkan error, dan bangun aplikasi ini dengan standar kualitas visual dan fungsional tertinggi!
```
