import type { Metadata, Viewport } from 'next';
import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from '@/components/ui/theme-provider';
import { APP } from '@/config/app';
import './globals.css';

export const metadata: Metadata = {
  title: { default: `${APP.name} — ${APP.tagline}`, template: `%s · ${APP.name}` },
  description: APP.description,
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0b1120' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        {/* Inter di-host sendiri (public/fonts) supaya render PNG identik
            di semua mesin dan tidak bergantung jaringan saat build. */}
        <link rel="stylesheet" href="/fonts/inter.css" />
      </head>
      <body>
        <ThemeProvider>
          <SessionProvider>{children}</SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
