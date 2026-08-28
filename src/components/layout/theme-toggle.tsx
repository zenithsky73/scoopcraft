'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 px-0 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/50 text-slate-500"
      >
        <span className="sr-only">Toggle theme</span>
      </Button>
    );
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="h-8 px-2.5 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/80 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-all text-xs font-semibold shadow-sm"
      title={`Beralih ke mode ${isDark ? 'terang' : 'gelap'}`}
    >
      {isDark ? (
        <>
          <Sun className="size-3.5 text-amber-400" />
          <span className="hidden sm:inline">Terang</span>
        </>
      ) : (
        <>
          <Moon className="size-3.5 text-indigo-600 dark:text-indigo-400" />
          <span className="hidden sm:inline">Gelap</span>
        </>
      )}
    </Button>
  );
}
