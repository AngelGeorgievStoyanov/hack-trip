import type { Metadata } from 'next';
import type { CSSProperties } from 'react';
import { HomeHero } from '@/components/home';
import { HomeTrips } from '@/components/home/HomeTrips';
import { absoluteUrl } from '@/config';
import { pageBackgroundStyle } from '@/constants/ui';

export const metadata: Metadata = {
  title: 'HackTrip — plan and share your trips',
  description: 'Discover, plan and share trips with HackTrip.',
  alternates: { canonical: absoluteUrl('/') },
  openGraph: {
    title: 'HackTrip',
    description: 'Discover, plan and share trips with HackTrip.',
    url: absoluteUrl('/'),
    siteName: 'HackTrip',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HackTrip',
    description: 'Discover, plan and share trips with HackTrip.',
  },
};

const MAIN_STYLE: CSSProperties = {
  ...pageBackgroundStyle,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
};

export default function HomePage() {
  return (
    <main style={MAIN_STYLE}>
      <HomeHero hasTopTrips={false}>
        <HomeTrips />
      </HomeHero>
    </main>
  );
}
