import type { Metadata, Viewport } from 'next';
import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from '@/components/ui/theme-provider';
import { APP } from '@/config/app';
import './globals.css';

export const metadata: Metadata = {
  title: { default: `${APP.name} — ${APP.tagline}`, template: `%s · ${APP.name}` },
  description: APP.description,
  icons: {
    icon: [
      { url: '/favicon.png?v=3', type: 'image/png' },
      { url: '/favicon.ico?v=3' },
    ],
    apple: '/app-icon-dark.png?v=3',
  },
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
        <link rel="icon" href="/favicon.png?v=3" type="image/png" />
        <link rel="shortcut icon" href="/favicon.ico?v=3" />
        <link rel="apple-touch-icon" href="/app-icon-dark.png?v=3" />
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
