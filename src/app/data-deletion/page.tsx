import Link from 'next/link';
import { NewslyLogo } from '@/components/brand/newsly-logo';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Petunjuk Penghapusan Data Pengguna - Newsly AI',
  description: 'Panduan dan instruksi cara menghapus data pengguna Newsly AI (Scoopcraft)',
};

export default function DataDeletionPage() {
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
            Petunjuk Penghapusan Data Pengguna
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Sesuai dengan Pedoman Platform Meta (Facebook / Instagram / Threads) dan GDPR
          </p>
        </div>

        <div className="prose dark:prose-invert max-w-none space-y-6 text-sm sm:text-base leading-relaxed text-slate-700 dark:text-slate-300">
          <p>
            Newsly AI (&quot;Scoopcraft&quot;) menghargai hak privasi Anda dan menyediakan mekanisme mudah bagi pengguna untuk menghapus akun dan data yang terkait dengan aplikasi kami.
          </p>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Metode 1: Menghapus Integrasi Melalui Pengaturan Facebook / Meta</h2>
            <p>Jika Anda ingin mencabut izin akses dan menghapus data aplikasi dari akun Meta Anda:</p>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Buka akun Facebook Anda dan masuk ke <strong>Pengaturan &amp; Privasi &gt; Pengaturan</strong>.</li>
              <li>Pilih menu <strong>Aplikasi dan Situs Web (Apps and Websites)</strong> di bilah sisi kiri.</li>
              <li>Cari aplikasi <strong>newsly ai</strong> atau <strong>Scoopcraft</strong>.</li>
              <li>Klik tombol <strong>Hapus (Remove)</strong> di samping nama aplikasi.</li>
              <li>Centang opsi jika ingin menghapus seluruh postingan dan interaksi yang dibuat oleh aplikasi, lalu konfirmasi penghapusan.</li>
            </ol>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Metode 2: Memutuskan Akun dari Dashboard Newsly AI</h2>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Masuk ke akun Newsly AI Anda di <Link href="/login" className="text-primary underline">https://scoopcraft.vercel.app/login</Link>.</li>
              <li>Buka menu <strong>Pengaturan (Settings) &gt; Akun Sosial</strong>.</li>
              <li>Klik tombol <strong>Putuskan Sambungan (Disconnect)</strong> pada akun Facebook, Instagram, atau Threads yang ingin Anda hapus.</li>
              <li>Semua token akses dan data identitas yang tersimpan akan langsung dihapus permanen dari basis data kami.</li>
            </ol>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Metode 3: Permintaan Penghapusan Manual / Lengkap</h2>
            <p>
              Jika Anda ingin menghapus seluruh riwayat akun Newsly AI, artikel, dan gambar media secara permanen dari server kami, kirimkan permohonan melalui email ke:
            </p>
            <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-sm">
              Email: <strong>muhrhamd18@gmail.com</strong><br />
              Subjek: <strong>Permintaan Penghapusan Data - [Email Akun Anda]</strong>
            </div>
            <p>Tim kami akan memproses dan menghapus data Anda secara permanen dalam kurun waktu 1x24 jam kerja.</p>
          </section>
        </div>
      </main>
    </div>
  );
}
