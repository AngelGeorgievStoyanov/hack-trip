import type { Metadata, Viewport } from 'next';
import './globals.css';
import { config } from '@/config';
import { COLORS } from '@/constants/ui';
import { Providers } from './providers';
import { SiteStructuredData } from '@/seo/SiteStructuredData';

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
  themeColor: COLORS.brand,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <div className="app-shell">
          <SiteStructuredData />
          <Providers>{children}</Providers>
        </div>
      </body>
    </html>
  );
}
