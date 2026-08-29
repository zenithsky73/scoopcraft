import Link from 'next/link';
import { APP } from '@/config/app';
import { ThemeToggle } from '@/components/layout/theme-toggle';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <header className="flex h-16 items-center justify-between px-4 lg:px-8 border-b border-slate-200 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl transition-colors duration-200">
        <Link href="/" className="flex items-center gap-2.5">
          <img
            src="/logo-icon.png"
            alt="Newsly AI"
            className="size-8 object-contain"
          />
          <span className="text-base font-black tracking-tight text-slate-900 dark:text-white">
            Newsly<span className="bg-gradient-to-r from-cyan-500 via-pink-500 to-amber-500 bg-clip-text text-transparent">AI</span>
          </span>
        </Link>
        <ThemeToggle />
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xl backdrop-blur-xl transition-colors duration-200">
          <div className="flex justify-center mb-5">
            <div className="size-20 drop-shadow-[0_10px_20px_rgba(56,189,248,0.3)]">
              <img
                src="/robot-avatar.png"
                alt="Newsly AI Mascot"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
