# 🔌 InstaDeck Model Context Protocol (MCP) & Claude Desktop Guide

Selamat datang di panduan integrasi **InstaDeck MCP Server**. Dengan Model Context Protocol (MCP), Anda dapat menghubungkan asisten AI seperti **Claude Desktop**, **Cursor AI**, atau **OpenAI Agent** langsung ke mesin pembuat konten & scheduler otomatis di **InstaDeck**.

---

## 🌟 Apa Saja yang Bisa Dilakukan Claude via MCP?

Setelah terhubung, Anda tidak perlu membuka browser atau bolak-balik copy-paste teks. Anda cukup mengobrol santai dengan Claude di laptop Anda:

1. **Membuat Carousel Otomatis (Multi-Slide)**
   - *Contoh prompt:*  
     > *"Claude, buatkan carousel 5 slide tentang '5 Tips Mengatur Keuangan untuk Freelancer Pemula', gunakan template desain FINANCE atau NOTION_MINIMAL."*
   - Claude akan memanggil tool `instadeck_generate_carousel`, menyusun naskah headline + konten + hook + visual prompt + pemilihan foto otomatis di InstaDeck, dan memberikan link studio editor.

2. **Menjadwalkan Konten Langsung ke Instagram, TikTok, Threads & Facebook**
   - *Contoh prompt:*  
     > *"Jadwalkan carousel tadi untuk tayang besok jam 19.30 WIB di Instagram dan Threads saya."*
   - Claude akan memanggil `instadeck_schedule_post`, menyimpan jadwal ke database cloud InstaDeck. Scheduler background worker InstaDeck akan otomatis memposting konten tersebut ke media sosial saat waktunya tiba, **tanpa Claude / laptop Anda perlu tetap menyala**.

3. **Melihat & Membatalkan Antrean Kalender Jadwal**
   - *Contoh prompt:*  
     > *"Claude, tampilkan daftar antrean postingan saya untuk minggu ini."*  
     > *"Batalkan jadwal postingan dengan ID sched_123."*

4. **Menjelajah Katalog Template Desain (38+ Template Visual)**
   - *Contoh prompt:*  
     > *"Coba perlihatkan template desain visual yang cocok untuk niche kuliner atau fashion."*

---

## 🔑 Langkah 1: Dapatkan API Key Anda di InstaDeck

1. Buka dashboard InstaDeck di [https://pro.instadeck.id](https://pro.instadeck.id).
2. Masuk ke menu **Pengaturan & Brand Kit** (`/settings`), lalu pilih tab **🤖 API Key & MCP AI**.
3. Klik tombol **Buat API Key Baru**.
4. Beri nama kunci Anda (misal: `Claude Desktop Laptop`).
5. **Salin API Key** yang muncul (format: `instadeck_live_...`). Simpan di tempat aman karena kunci lengkap hanya ditampilkan 1 kali.

---

## 💻 Langkah 2: Konfigurasi Claude Desktop

### Lokasi File Konfigurasi Claude Desktop:
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`  
  *(Contoh: `C:\Users\Username\AppData\Roaming\Claude\claude_desktop_config.json`)*
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`

### Isi File Konfigurasi:

Tambahkan server `instadeck` ke bagian `mcpServers` pada file JSON Anda:

```json
{
  "mcpServers": {
    "instadeck": {
      "command": "node",
      "args": [
        "D:\\Scoopcraft\\bin\\instadeck-mcp.js"
      ],
      "env": {
        "INSTADECK_API_KEY": "instadeck_live_MASUKKAN_API_KEY_ANDA_DISINI",
        "INSTADECK_API_URL": "https://pro.instadeck.id/api/mcp"
      }
    }
  }
}
```

> 💡 **Catatan untuk Windows**: Pastikan menggunakan double-backslash `\\` untuk pemisah folder pada path `bin/instadeck-mcp.js`.

---

## ⚡ Langkah 3: Restart Claude Desktop & Mulai Gunakan!

1. Tutup aplikasi Claude Desktop sepenuhnya (pastikan di taskbar/system tray juga tertutup).
2. Buka kembali Claude Desktop.
3. Anda akan melihat ikon **🔌 Tools / Hammer** di pojok kanan bawah chat Claude yang menampilkan 6 tool InstaDeck:
   - `instadeck_generate_carousel`
   - `instadeck_schedule_post`
   - `instadeck_list_schedules`
   - `instadeck_cancel_schedule`
   - `instadeck_list_templates`
   - `instadeck_get_content`

---

## 💬 Contoh Skenario & Prompt Siap Pakai di Claude

### Skenario 1: Dari Artikel / Riset Web Langsung Jadi Carousel
> *"Claude, tolong rangkum poin-poin penting dari artikel tentang tren AI 2026 ini, lalu buatkan carousel InstaDeck 5 slide dengan gaya visual TECH dan nada santai."*

### Skenario 2: Content Planning 1 Minggu Sekaligus
> *"Claude, buatkan 3 ide carousel untuk brand coffee shop saya (@kopisenja). Untuk ide pertama, langsung generate carouselnya dengan template KULINER_NUSANTARA dan jadwalkan ke Instagram untuk hari Jumat jam 10 pagi."*

### Skenario 3: Cek Status Publikasi
> *"Tampilkan antrean jadwal media sosial saya yang berstatus PENDING di InstaDeck."*

---

## 🛠️ Daftar Lengkap MCP Tools & Parameter

| Tool Name | Kegunaan | Parameter Utama |
| :--- | :--- | :--- |
| `instadeck_generate_carousel` | Membuat carousel lengkap + slide | `topic` (wajib), `style`, `slidesCount` (3/5/7), `format` (FEED_PORTRAIT / FEED_SQUARE / STORY), `tone`, `brandName`, `handle` |
| `instadeck_schedule_post` | Menjadwalkan ke medsos | `contentId` (wajib), `scheduledAt` (ISO string / YYYY-MM-DD HH:mm), `platforms` (['INSTAGRAM', 'TIKTOK', 'THREADS', 'FACEBOOK']), `caption` |
| `instadeck_list_schedules` | Melihat antrean jadwal | `status` ('PENDING', 'PUBLISHED', 'FAILED', 'ALL'), `limit` |
| `instadeck_cancel_schedule` | Membatalkan jadwal tayang | `scheduleId` (wajib) |
| `instadeck_list_templates` | Melihat katalog 38 template visual | `category` (all / minimal / modern / vibrant / dark / editorial) |
| `instadeck_get_content` | Membaca slide carousel yang ada | `contentId` (wajib) |

---

## 🔒 Keamanan & Privasi API Key

1. **Hashing Tingkat Tinggi**: Di database InstaDeck, API Key Anda hanya disimpan dalam bentuk hash kriptografi SHA-256 (`keyHash`). Kunci mentah tidak pernah disimpan dalam bentuk plaintext.
2. **Revocation Instan**: Jika API key Anda bocor atau laptop hilang, Anda dapat langsung menghapusnya kapan saja dari menu Settings InstaDeck, dan koneksi Claude Desktop akan langsung terputus seketika.
3. **Isolasi Akun**: Setiap API key terikat ketat ke ID pengguna Anda. Claude hanya dapat mengakses dan menjadwalkan postingan ke akun media sosial yang telah Anda hubungkan di profil InstaDeck Anda.
