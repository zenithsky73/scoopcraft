import Link from 'next/link';
import { ArrowRight, Link2, Sparkles, LayoutTemplate } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Badge } from '@/components/ui/badge';
import { APP } from '@/config/app';
import { TRIAL, GUEST } from '@/config/trial';
import { TryForm } from '@/components/generate/try-form';

const STEPS = [
  { icon: Link2, title: 'Tempel URL', body: 'Artikel diambil dan dibersihkan otomatis.' },
  { icon: Sparkles, title: 'AI menulis', body: 'Headline, caption, hashtag, dan CTA sesuai angle berita.' },
  { icon: LayoutTemplate, title: 'Render multi-format', body: 'Feed 1:1, 4:5, dan Story 9:16 sekaligus.' },
];

export default function LandingPage() {
  return (
    <div className="min-h-dvh">
      <header className="flex h-14 items-center justify-between border-b border-border px-4 lg:px-8">
        <div className="flex items-center gap-2">
          <span className="grid h-6 w-6 place-items-center rounded-sm bg-accent text-[11px] font-bold text-accent-fg">
            S
          </span>
          <span className="text-sm font-semibold tracking-tight">{APP.name}</span>
        </div>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Button asChild variant="ghost" size="sm">
            <Link href="/login">Masuk</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/register">Coba gratis</Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-16 lg:py-24">
        <Badge variant="accent" className="mb-5">
          {GUEST.enabled ? 'Coba tanpa daftar' : `Trial ${TRIAL.durationDays} hari · ${TRIAL.quota} generate`}
        </Badge>

        <h1 className="max-w-2xl text-4xl font-semibold leading-[1.1] tracking-tight lg:text-5xl">
          {APP.tagline}
        </h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-muted">{APP.description}</p>

        {/* Ajakan utamanya mencoba, bukan mendaftar — pengunjung baru tahu
            hasilnya bagus atau tidak sebelum diminta membuat akun. */}
        {GUEST.enabled ? (
          <div className="mt-8">
            <TryForm guestQuota={GUEST.quota} />
            <p className="mt-4 text-sm text-muted">
              Sudah punya akun?{' '}
              <Link href="/login" className="font-medium text-accent hover:underline">
                Masuk
              </Link>
            </p>
          </div>
        ) : (
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/register">
                Mulai gratis <ArrowRight />
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="/login">Sudah punya akun</Link>
            </Button>
          </div>
        )}

        <div className="mt-16 grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-3">
          {STEPS.map((step) => (
            <div key={step.title} className="bg-surface p-5">
              <step.icon className="size-5 text-accent" aria-hidden />
              <h2 className="mt-3 text-sm font-semibold">{step.title}</h2>
              <p className="mt-1 text-sm leading-relaxed text-muted">{step.body}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
