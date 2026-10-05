import type { Metadata } from 'next';
import { tripApi } from '@/api/trips';
import { TripList } from '@/components/trips/TripList';
import { ScrambleHeading } from '@/components/common/ScrambleHeading';
import { absoluteUrl } from '@/config';

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
  const response = await tripApi.listTrips({ limit: 5, sort: 'newest' }).catch(() => null);
  const trips = response?.items ?? [];
  const siteUrl = absoluteUrl('/');

  return (
    <main style={{ padding: '2rem' }}>
      <section style={{ marginBottom: '2rem' }}>
        <ScrambleHeading text="Welcome in Hack Trip!" variant="h1" />
        <h1>Welcome travelers or future travelers!</h1>
        <h2>Hack Trip is an app where you can share your trips or get valuable tips for your future trips.</h2>
      </section>
      {trips.length > 0 ? (
        <section>
          <h3>These are our latest trips in Hack Trip!</h3>
          <TripList trips={trips} />
        </section>
      ) : null}
      <section aria-label="Share HackTrip">
        <h3>
          Share to Facebook{' '}
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(siteUrl)}&hashtag=%23HackTrip`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Facebook
          </a>
        </h3>
        <h3>
          Share to Viber{' '}
          <a href={`viber://forward?text=${encodeURIComponent(`Hack Trip - ${siteUrl}`)}`}>Viber</a>
        </h3>
      </section>
    </main>
  );
}


