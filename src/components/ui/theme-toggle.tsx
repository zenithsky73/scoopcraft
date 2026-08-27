'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === 'dark';

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={isDark ? 'Ganti ke mode terang' : 'Ganti ke mode gelap'}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
    >
      {/* Sebelum mounted, render ikon netral supaya tidak hydration-mismatch. */}
      {isDark ? <Moon /> : <Sun />}
    </Button>
  );
}
