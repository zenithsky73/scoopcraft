import Link from 'next/link';
import { NewslyLogo } from '@/components/brand/newsly-logo';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Ketentuan Layanan - Newsly AI',
  description: 'Syarat dan Ketentuan Penggunaan Layanan Newsly AI (Scoopcraft)',
};

export default function TermsPage() {
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
            Ketentuan Layanan (Terms of Service)
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Terakhir diperbarui: 8 September 2026
          </p>
        </div>

        <div className="prose dark:prose-invert max-w-none space-y-6 text-sm sm:text-base leading-relaxed text-slate-700 dark:text-slate-300">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">1. Penerimaan Ketentuan</h2>
            <p>
              Dengan mengakses dan menggunakan platform Newsly AI (&quot;Scoopcraft&quot;), Anda menyetujui untuk terikat oleh Ketentuan Layanan ini serta seluruh hukum dan peraturan yang berlaku.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">2. Deskripsi Layanan</h2>
            <p>
              Newsly AI adalah platform pembuatan konten berita, infografis carousel grafis berbasis kecerdasan buatan (AI), dan sistem manajemen publikasi otomatis ke media sosial resmi (Facebook, Instagram, Threads, dll).
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">3. Tanggung Jawab Pengguna</h2>
            <p>Pengguna bertanggung jawab penuh atas:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Keaslian, legalitas, dan ketepatan materi/berita yang dimasukkan dan dipublikasikan melalui platform.</li>
              <li>Menjaga kerahasiaan akun dan kata sandi Anda.</li>
              <li>Mematuhi Pedoman Komunitas dan Kebijakan Platform Meta (Facebook, Instagram, Threads).</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">4. Hak Kekayaan Intelektual</h2>
            <p>
              Seluruh grafis, desain carousel, dan konten yang dihasilkan oleh pengguna menggunakan Newsly AI adalah milik pengguna sepenuhnya.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">5. Kontak</h2>
            <p>
              Untuk pertanyaan mengenai ketentuan ini, hubungi kami di: <a href="mailto:muhrhamd18@gmail.com" className="text-primary underline">muhrhamd18@gmail.com</a>.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
