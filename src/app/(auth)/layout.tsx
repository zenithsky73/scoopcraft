import Link from 'next/link';
import { APP } from '@/config/app';
import { ThemeToggle } from '@/components/ui/theme-toggle';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex h-14 items-center justify-between px-4 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="grid h-6 w-6 place-items-center rounded-sm bg-accent text-[11px] font-bold text-accent-fg">
            S
          </span>
          <span className="text-sm font-semibold tracking-tight">{APP.name}</span>
        </Link>
        <ThemeToggle />
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-8">
        <div className="w-full max-w-sm">{children}</div>
      </main>
    </div>
  );
}
