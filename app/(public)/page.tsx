import type { Metadata } from 'next';
import type { CSSProperties } from 'react';
import { tripApi } from '@/api/trips';
import { HomeHero } from '@/components/home';
import { TripList } from '@/components/trips/TripList';
import { absoluteUrl } from '@/config';
import { getShareLinks } from '@/lib/share';
import { headingTextStyle, pageBackgroundStyle } from '@/constants/ui';

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

const SHARE_ROW_STYLE: CSSProperties = { display: 'flex', alignItems: 'center', margin: '10px' };

const SHARE_HEADING_STYLE: CSSProperties = { marginRight: '10px', ...headingTextStyle };

export default async function HomePage() {
  // `/trips/top` returns the same unified `TripGroupResponse` structure as `/trips`,
  // so every card renders from the returned days directly — no detail fetch is needed.
  const trips = await tripApi.getTopTrips().catch(() => []);
  const siteUrl = absoluteUrl('/');
  const [facebook, viber] = getShareLinks(
    { url: siteUrl, title: 'Hack Trip', text: `Hack Trip - ${siteUrl}`, hashtag: 'HackTrip' },
    ['facebook', 'viber'],
  );

  return (
    <main style={MAIN_STYLE}>
      <HomeHero hasTopTrips={trips.length > 0}>
        {trips.length > 0 ? <TripList trips={trips} /> : null}
        <div style={SHARE_ROW_STYLE}>
          <h3 style={SHARE_HEADING_STYLE}>Share to {facebook.label}</h3>
          <a href={facebook.href} target="_blank" rel="noopener noreferrer">
            {facebook.label}
          </a>
        </div>
        <div style={SHARE_ROW_STYLE}>
          <h3 style={SHARE_HEADING_STYLE}>Share to {viber.label}</h3>
          <a href={viber.href}>{viber.label}</a>
        </div>
      </HomeHero>
    </main>
  );
}
