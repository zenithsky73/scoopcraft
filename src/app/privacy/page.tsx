import Link from 'next/link';
import { NewslyLogo } from '@/components/brand/newsly-logo';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Kebijakan Privasi - Newsly AI',
  description: 'Kebijakan Privasi dan Perlindungan Data Pengguna Newsly AI (Scoopcraft)',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-dvh bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 px-4 backdrop-blur-xl lg:px-12">
        <Link href="/" className="flex items-center gap-2.5">
          <NewslyLogo size={32} />
          <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
            Newsly<span className="bg-gradient-to-r from-cyan-500 via-pink-500 to-amber-500 bg-clip-text text-transparent">AI</span>
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Button asChild variant="ghost" size="sm">
            <Link href="/">Kembali ke Beranda</Link>
          </Button>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto px-4 py-12 space-y-8">
        <div>
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl text-slate-900 dark:text-white">
            Kebijakan Privasi
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Terakhir diperbarui: 8 September 2026
          </p>
        </div>

        <div className="prose dark:prose-invert max-w-none space-y-6 text-sm sm:text-base leading-relaxed text-slate-700 dark:text-slate-300">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">1. Pendahuluan</h2>
            <p>
              Newsly AI (&quot;kami&quot;, &quot;layanan&quot;, atau &quot;Scoopcraft&quot;) sangat menghargai dan berkomitmen untuk melindungi privasi data Anda. Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, menyimpan, dan melindungi informasi pribadi Anda saat menggunakan aplikasi web kami dan fitur integrasi media sosial (Facebook, Instagram, Threads, dan platform lainnya).
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">2. Data yang Kami Kumpulkan</h2>
            <p>Saat Anda menggunakan Newsly AI atau menghubungkan akun media sosial Anda, kami dapat mengumpulkan informasi berikut:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Informasi Akun:</strong> Nama, alamat email, dan kata sandi terenkripsi saat Anda mendaftar.</li>
              <li><strong>Informasi Otorisasi Media Sosial (Meta / Facebook / Instagram / Threads):</strong> User ID publik, nama Halaman Facebook (Fanpage), ID akun Instagram Bisnis, dan Token Akses Halaman (Page Access Token) yang diperlukan untuk melakukan penjadwalan dan publikasi konten otomatis atas izin Anda.</li>
              <li><strong>Konten yang Dibuat:</strong> Naskah, headline, slide gambar carousel grafis, dan caption yang Anda buat di Carousel Studio.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">3. Bagaimana Kami Menggunakan Data Anda</h2>
            <p>Data yang dikumpulkan digunakan semata-mata untuk:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Menyediakan layanan pembuatan konten grafis berbasis AI.</li>
              <li>Menerbitkan postingan media (gambar carousel, caption, dan berita) ke Halaman Facebook, akun Instagram, atau Threads yang Anda pilih secara eksplisit.</li>
              <li>Menyimpan preferensi Brand Kit dan riwayat konten Anda.</li>
              <li>Kami <strong>TIDAK PERNAH</strong> menjual, menyewakan, atau membagikan data pribadi maupun token akses Anda kepada pihak ketiga mana pun untuk tujuan periklanan.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">4. Hak Pengguna &amp; Penghapusan Data</h2>
            <p>
              Anda memiliki hak penuh untuk mengakses, memperbarui, atau menghapus data Anda kapan saja. Anda dapat memutuskan tautan akun media sosial Anda melalui menu <strong>Pengaturan &gt; Akun Sosial</strong> di aplikasi, atau menghapus data otorisasi aplikasi melalui pengaturan Meta/Facebook.
            </p>
            <p>
              Untuk panduan lengkap penghapusan data, silakan kunjungi halaman <Link href="/data-deletion" className="text-primary underline font-medium">Petunjuk Penghapusan Data</Link>.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">5. Keamanan Data</h2>
            <p>
              Semua token akses media sosial dan data kredensial disimpan dengan enkripsi standar industri dan dilindungi dengan protokol keamanan HTTPS/TLS.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">6. Kontak Kami</h2>
            <p>
              Jika Anda memiliki pertanyaan tentang Kebijakan Privasi ini, Anda dapat menghubungi kami melalui email di: <a href="mailto:muhrhamd18@gmail.com" className="text-primary underline">muhrhamd18@gmail.com</a>.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
