import type { Metadata, Viewport } from 'next';
import './globals.css';
import { config } from '@/config';
import { Providers } from './providers';

export const metadata: Metadata = {
  metadataBase: new URL(config.siteUrl),
  title: {
    default: 'HackTrip',
    template: '%s | HackTrip',
  },
  description: 'Discover, plan and share trips with HackTrip.',
  applicationName: 'HackTrip',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#1976d2',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        {/*
          Sticky-footer app shell: a flex column with a viewport minimum height. The route
          group layouts render `Header`, page content and `Footer` as its children, and the
          content area uses `flex: 1` so short pages keep the footer at the bottom of the
          viewport while long pages scroll normally.
        */}
        <div className="app-shell">
          <Providers>{children}</Providers>
        </div>
      </body>
    </html>
  );
}
