import type { Metadata } from 'next';
import { tripApi } from '@/api/trips';
import { TripList } from '@/components/trips/TripList';
import { absoluteUrl } from '@/config';
import type { TripListItem } from '@/types';

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

export default async function HomePage() {
  let trips: TripListItem[] = [];
  try {
    const response = await tripApi.listTrips({ limit: 6, sort: 'newest' });
    trips = response.items;
  } catch {
    trips = [];
  }

  return (
    <main style={{ padding: '2rem' }}>
      <section style={{ marginBottom: '2rem' }}>
        <h1>Discover your next trip</h1>
        <p>Explore trips planned and shared by the HackTrip community.</p>
      </section>
      <section>
        <h2>Recent trips</h2>
        <TripList trips={trips} />
      </section>
    </main>
  );
}

