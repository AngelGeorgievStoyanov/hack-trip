import type { Metadata } from 'next';
import type { CSSProperties } from 'react';
import { HomeHero } from '@/components/home';
import { HomeTrips } from '@/components/home/HomeTrips';
import { tripApi } from '@/api/trips';
import type { TripGroupResponse } from '@/types';
import { buildSeoMetadata } from '@/seo';
import { pageBackgroundStyle } from '@/constants/ui';

export const revalidate = 300;

export const metadata: Metadata = buildSeoMetadata({
  title: 'Travel Planner: Plan & Share Trips',
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

export default async function HomePage() {
  let topTrips: TripGroupResponse[] = [];
  try {
    topTrips = await tripApi.getTopTrips();
  } catch (error) {
    console.error('[Home] Failed to load top trips for server rendering:', error);
  }

  return (
    <main style={MAIN_STYLE}>
      <HomeHero hasTopTrips={false}>
        <HomeTrips trips={topTrips} />
      </HomeHero>
    </main>
  );
}
