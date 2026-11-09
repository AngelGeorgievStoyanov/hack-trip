import type { Metadata } from 'next';
import type { CSSProperties } from 'react';
import { HomeHero } from '@/components/home';
import { HomeTrips } from '@/components/home/HomeTrips';
import { buildSeoMetadata } from '@/seo';
import { pageBackgroundStyle } from '@/constants/ui';

export const metadata: Metadata = buildSeoMetadata({
  title: 'Travel Planner — Create, Plan and Share Trips',
  description:
    'Create travel itineraries, plan routes, save GPS locations anywhere and share places like restaurants, hidden beaches and mountain spots with HackTrip.',
  canonicalPath: '/',
});

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
