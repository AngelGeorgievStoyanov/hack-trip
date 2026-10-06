import type { Metadata } from 'next';
import { tripApi } from '@/api/trips';
import { TripList } from '@/components/trips/TripList';
import { ScrambleHeading } from '@/components/common/ScrambleHeading';
import { absoluteUrl } from '@/config';
import { getShareLinks } from '@/lib/share';

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
  const trips = await tripApi.getTopTrips().catch(() => []);
  const siteUrl = absoluteUrl('/');
  const [facebook, viber] = getShareLinks(
    { url: siteUrl, title: 'Hack Trip', text: `Hack Trip - ${siteUrl}`, hashtag: 'HackTrip' },
    ['facebook', 'viber'],
  );

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
          Share to {facebook?.label ?? 'Facebook'}{' '}
          <a href={facebook?.href ?? '#'} target="_blank" rel="noopener noreferrer">
            {facebook?.label ?? 'Facebook'}
          </a>
        </h3>
        <h3>
          Share to {viber?.label ?? 'Viber'}{' '}
          <a href={viber?.href ?? '#'}>{viber?.label ?? 'Viber'}</a>
        </h3>
      </section>
    </main>
  );
}


