# Scoopcraft

Ubah URL artikel berita jadi konten media sosial siap posting — caption, hashtag, dan
visual editorial dalam format Feed (1:1, 4:5) dan Story (9:16).

## Stack

| Lapisan | Pilihan |
|---|---|
| App | Next.js 14 (App Router) + TypeScript |
| Styling | Tailwind CSS 3.4, token CSS variable, dark mode `class` |
| Database | PostgreSQL + Prisma 5 |
| Auth | Auth.js v5 — Credentials (email + password, bcrypt), strategi JWT |
| Queue | BullMQ + Redis *(modul 3)* |
| Scraper | `@mozilla/readability` + `jsdom`, fallback Playwright *(modul 2)* |
| AI | Anthropic API, output JSON terstruktur *(modul 3)* |
| Render | Template HTML/CSS → Playwright screenshot *(modul 4)* |

## Setup

```bash
npm install
cp .env.example .env      # isi DATABASE_URL + AUTH_SECRET
npx auth secret           # generate AUTH_SECRET
```

Database — pilih salah satu:

```bash
docker compose up -d              # Postgres 16 + Redis 7 lokal
```

atau pakai Postgres terkelola (Neon / Supabase / Railway) dan tempel connection
string-nya ke `DATABASE_URL`.

Lalu:

```bash
npm run db:migrate        # buat tabel
npm run db:seed           # akun demo: demo@scoopcraft.test / password123
npx playwright install chromium   # fallback scraper (~115 MB, opsional)
npm run dev
```

## Uji scraper tanpa server & DB

```bash
npx tsx scripts/scrape.ts <url> [--browser] [--full]
```

`--browser` memaksa jalur Playwright, `--full` mencetak seluruh isi artikel.

## Uji pipeline AI tanpa server & DB

```bash
npx tsx scripts/pipeline.ts <url>          # panggil Claude sungguhan
npx tsx scripts/pipeline.ts <url> --mock   # provider tiruan, tanpa jaringan
npx tsx scripts/pipeline.ts <url> --dry    # cetak prompt + JSON schema saja
```

## Menyetel desain tanpa database

```bash
npm run dev                       # dev server harus hidup
npx tsx scripts/render.ts         # render 4 kombinasi ke tmp/design/
npx tsx scripts/render.ts --guides --image https://…/foto.jpg
npx tsx scripts/render.ts --slides 5 --handle @redaksikita   # seluruh carousel
npx tsx scripts/visual-check.ts   # uji penilaian gambar + provider gambar
```

Halaman `/render/preview?style=BREAKING_NEWS&format=STORY&guides=1` memakai
komponen kanvas yang sama persis dengan yang di-screenshot Playwright.

## Coba tanpa login

Pengunjung bisa langsung menempel URL di halaman depan tanpa mendaftar. Server
membuat baris `User` dengan `isGuest = true` — bukan skema terpisah — sehingga
seluruh relasi bekerja apa adanya, dan **saat tamu itu mendaftar, baris yang
sama tinggal diberi email dan password: kontennya ikut terbawa, tidak hilang.**

Dua pagar terhadap penyalahgunaan, karena tiap percobaan memanggil Claude dan
model gambar:

| Env | Arti |
|---|---|
| `GUEST_QUOTA` | Generate gratis per pengunjung (default 1) |
| `GUEST_IP_LIMIT` | Percobaan gratis per alamat IP per hari (default 3) |
| `GUEST_TRIAL=0` | Matikan mode coba sepenuhnya |

Akun tamu dibuat saat tombol Generate ditekan, bukan saat halaman dibuka —
supaya tidak ada baris `User` sampah dari pengunjung yang cuma lewat.

## Akun pemilik (kuota tanpa batas)

```bash
npm run owner you@example.com rahasia-panjang
```

Membuat akun baru, atau menaikkan akun yang sudah ada jadi `OWNER` tanpa
mengubah password. Bisa juga lewat `OWNER_EMAIL` + `OWNER_PASSWORD` di `.env`
lalu `npm run db:seed`.

Peran `OWNER` melewati seluruh pemeriksaan trial dan kuota — dicek paling awal
di `getQuotaState()` supaya tidak ada cabang lain yang bisa menguncinya.

## Pratinjau UI tanpa database

```
/dev/ui            panel hasil (dua kolom, tab mobile, carousel)
/dev/ui/upgrade    halaman paket: trial menipis, terkunci, akun pemilik
```

Data contoh, tanpa database dan tanpa login. Diblokir di produksi.

## Uji aturan kuota

```bash
npx tsx scripts/quota-check.ts
```

## Menjalankan worker

```bash
npm run dev:all     # Next + worker sekaligus
npm run worker      # worker saja (butuh Redis)
```

## Script

| Perintah | Fungsi |
|---|---|
| `npm run dev` | Dev server di :3000 |
| `npm run build` | `prisma generate` + build produksi |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run db:migrate` | Migrasi dev |
| `npm run db:studio` | Prisma Studio |
| `npm run db:seed` | Akun demo |

## Peta modul

- [x] **1 — Fondasi**: setup, schema Prisma, auth, design system, AppShell responsive
- [x] **2 — Scraper**: `POST /api/articles/extract`, guard SSRF, fallback Playwright
- [x] **3 — AI pipeline**: analysis + content generation, BullMQ, progress polling
- [x] **4 — Design engine**: Minimal & Breaking News × Feed Square & Story
- [x] **5 — Dashboard**: input URL, progress tracker, hasil + toggle format, riwayat
- [x] **6 — Trial & billing**: penegakan kuota, halaman paket, stub `activateSubscription`, akun pemilik

## Catatan arsitektur

**Kenapa `GenerationRun`.** Satu klik Generate memicu banyak `Job` (fetch → analysis →
generate → render) dan banyak `DesignAsset` (style × format). `GenerationRun` jadi parent
dengan status agregat (`PENDING`/`PROCESSING`/`PARTIAL`/`DONE`/`FAILED`) plus
`stepsDone`/`stepsTotal`, sehingga progress tracker cukup polling satu record.
`PARTIAL` = teks sudah jadi tapi sebagian render gagal — konten tetap bisa dipakai.

**Kenapa strategi JWT, bukan database session.** Auth.js v5 hanya mendukung JWT untuk
Credentials provider. Adapter Prisma tetap dipasang (tabel `User`/`Account`/`Session`
sudah ada), jadi menambah magic link atau OAuth Google nanti tinggal menambah provider —
tanpa migrasi skema. Data kuota selalu dibaca ulang dari DB, tidak dari token.

**Kenapa render server-side (Playwright), bukan Konva.js.** Kebutuhannya adalah *layout
rules per format*, dan CSS sudah punya layout engine matang — Konva tidak (text wrapping
dan posisi harus dihitung manual per format). Playwright juga sudah jadi dependency untuk
fallback scraper. Preview di browser memakai template HTML yang sama di dalam iframe
ter-scale, jadi WYSIWYG tanpa dua implementasi.

**Scraper: statis dulu, browser belakangan.** `fetchHtml` + Readability rata-rata
selesai ~1,7 detik; jalur Playwright ~11 detik untuk artikel yang sama. Karena hampir
semua portal berita SSR demi SEO, jalur statis dipakai lebih dulu dan Playwright hanya
dipanggil kalau hasilnya mencurigakan (tidak readerable, di bawah `MIN_WORDS_STATIC`,
atau HTML memuat pesan "aktifkan JavaScript"). Kalau render browser ternyata tidak
menambah isi, hasil statis yang dipakai — dan kegagalan browser tidak pernah
membatalkan hasil statis yang sudah cukup, hanya menambah `warnings`.

**Guard SSRF.** Endpoint ini mengambil URL sembarang dari user, jadi setiap hop redirect
divalidasi ulang (`assertPublicUrl`), bukan hanya URL pertama: IP privat, loopback,
link-local (termasuk `169.254.169.254` metadata cloud), CGNAT, dan URL berkredensial
ditolak. URL akhir setelah redirect JavaScript di Playwright juga divalidasi ulang.

**Structured output menjamin bentuk, bukan nilai.** Konverter zod → JSON Schema di
SDK Anthropic menurunkan setiap constraint yang tidak didukung — `enum`, `minItems`,
`maxLength` — menjadi teks di dalam `description`. Jadi `z.enum([...])` sampai ke model
sebagai petunjuk, bukan pagar. Karena itu ada dua lapis pengaman: zod memvalidasi ulang
hasil parsing (nilai di luar enum → `INVALID_OUTPUT`, job diulang), dan `validate.ts`
memotong panjang teks sebelum masuk ke render — headline kepanjangan merusak layout.

**Kenapa `AI_PROVIDER=mock` ada.** Mengembangkan UI modul 5 tidak perlu memanggil Claude
setiap refresh. Provider tiruan menghasilkan keluaran deterministik tanpa jaringan,
sehingga pipeline, queue, dan dashboard bisa diuji tanpa API key dan tanpa biaya.

**Kenapa `QUEUE_DRIVER=inline` ada.** Untuk mesin dev yang belum punya Redis: job
dijalankan di proses Next itu juga. Tidak ada retry dan tidak tahan restart — jangan
dipakai di produksi.

**Kegagalan yang tidak layak diulang dihentikan lebih awal.** URL tidak valid, paywall,
artikel terlalu pendek, dan penolakan AI dilempar sebagai `UnrecoverableError` supaya
BullMQ berhenti mencoba; hanya timeout, rate limit, dan keluaran rusak yang diulang.

**Carousel = beberapa `DesignAsset`, bukan model baru.** `DesignAsset` sudah berarti
"satu gambar jadi", jadi carousel cukup menambah `slideIndex` + `slideType` dan mengubah
kunci uniknya. Fan-out render yang sudah ada tinggal dikalikan jumlah slide, dan semantik
`PARTIAL` langsung berlaku: satu slide gagal tidak menjatuhkan sisanya.

**Susunan deck: COVER → POINT × n → OUTRO.** Naskah slide selalu dibuat AI (3-5 poin)
walau user hanya minta 1 gambar, supaya konten lama bisa diubah jadi carousel tanpa
memanggil AI lagi. Deck bisa lebih pendek dari yang diminta kalau poinnya lebih sedikit —
`stepsTotal` disesuaikan ke jumlah render yang benar-benar dibuat, supaya progress
"x dari y" tidak berhenti di angka yang mustahil tercapai.

**Slide isi sengaja tanpa foto.** Teksnya panjang dan keterbacaan menang atas hiasan;
foto hanya di slide cover. Geometri slide isi juga sama untuk semua gaya — yang berbeda
hanya token warna, supaya pembaca tidak melihat tata letak berubah saat menggeser.

**Nama akun per user, bukan per aplikasi.** `BrandKit.handle` diisi di Setelan dan
dicetak di setiap slide. Template jatuh ke `APP.handle` hanya kalau user belum mengisinya.

**Aturan layout ditulis per format, bukan hasil penskalaan.** `LAYOUTS[gaya][format]`
di [layout.ts](src/server/design/layout.ts) memuat angka eksplisit: Story bukan Feed yang
dipanjangkan. Untuk Story, pita gambar mulai tepat di bawah safe zone atas (250px) dan
teks berhenti jauh di atas safe zone bawah, sementara badge "BREAKING" turun ke bawah
batas safe zone supaya tidak tertutup foto profil dan bar progres Instagram.

**Headline diperkecil bertahap, tidak dipotong.** `fitHeadline()` menurunkan ukuran huruf
berdasarkan jumlah karakter — deterministik, tanpa perlu mengukur teks di browser.
Jumlah baris tetap dipagari `-webkit-line-clamp` sebagai jaring terakhir.

**Satu gambar untuk semua aset.** `GENERATE_IMAGE` berjalan sekali per run, bukan per
format, sehingga Feed dan Story memakai visual yang sama dan tampil konsisten. Ukuran
generate mengikuti format paling tinggi yang diminta agar tidak kurang resolusi.

**Render bercabang, kegagalannya tidak menular.** `RENDER_DESIGN` membuat satu job per
kombinasi gaya × format. Kalau Story gagal tapi Feed berhasil, run berakhir `PARTIAL` —
teks sudah jadi dan aset yang berhasil tetap bisa diunduh.

**Provider gambar bisa diganti.** Semua pemakai bicara ke interface `ImageProvider`.
Bawaannya `local-abstract`: menggambar latar editorial deterministik memakai Chromium
yang memang sudah ada — tanpa API eksternal, tanpa biaya, selalu bisa dijalankan.
Adapter Replicate tersedia untuk gambar AI sungguhan.

**Kuota diperiksa dan dipotong dalam satu transaksi.** `consumeQuota()` dipanggil dari
dalam transaksi `createRun`, bukan dari route — jadi tidak ada jalur pembuatan run yang
bisa melewatkannya, dan dua request bersamaan tidak bisa sama-sama lolos pemeriksaan
sebelum salah satunya sempat menambah hitungan. Pemeriksaan di route hanya jalur cepat
untuk pesan yang enak dibaca.

**Trial habis mengunci generate, bukan akses.** Endpoint unduhan dan riwayat tidak
memeriksa kuota sama sekali — konten yang sudah dibayar tetap bisa diambil. Render ulang
setelah edit teks juga tidak memotong kuota.

**Kuota berbayar direset per siklus, tanpa cron.** `quotaResetAt` yang sudah lewat
membuat pemakaian dihitung nol pada pembacaan berikutnya, dan jendela baru ditulis saat
generate berikutnya. Tidak perlu job terjadwal yang bisa gagal diam-diam.

**Font.** `--font-sans` memakai stack sistem supaya build tidak bergantung pada fetch font.
Ganti ke `next/font` (Inter) kapan saja lewat satu variabel di `globals.css`. Template
render di modul 4 akan memakai font yang di-embed agar output deterministik.
