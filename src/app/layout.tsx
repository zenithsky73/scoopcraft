import type { Metadata, Viewport } from 'next';
import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from '@/components/ui/theme-provider';
import { Toaster } from 'sonner';
import { NewslyAssistantWidget } from '@/components/assistant/newsly-assistant-widget';
import { APP } from '@/config/app';
import './globals.css';

export const metadata: Metadata = {
  title: { default: `${APP.name} — ${APP.tagline}`, template: `%s · ${APP.name}` },
  description: APP.description,
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://scoopcraft.vercel.app'),
  openGraph: {
    title: `${APP.name} — ${APP.tagline}`,
    description: APP.description,
    siteName: APP.name,
    locale: 'id_ID',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${APP.name} — ${APP.tagline}`,
    description: APP.description,
  },
  icons: {
    icon: [
      { url: '/favicon.png?v=instadeck', type: 'image/png' },
      { url: '/favicon.ico?v=instadeck' },
    ],
    apple: '/app-icon-dark.png?v=instadeck',
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
        <link rel="icon" href="/favicon.png?v=instadeck" type="image/png" />
        <link rel="shortcut icon" href="/favicon.ico?v=instadeck" />
        <link rel="apple-touch-icon" href="/app-icon-dark.png?v=instadeck" />
        <link rel="stylesheet" href="/fonts/inter.css" />
      </head>
      <body>
        <ThemeProvider>
          <SessionProvider>
            {children}
            <NewslyAssistantWidget />
            <Toaster
              position="top-right"
              richColors
              closeButton
              theme="system"
              toastOptions={{
                className: 'rounded-2xl border backdrop-blur-xl shadow-2xl font-sans',
              }}
            />
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
