import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'HackTrip — plan and share your trips',
  description: 'Discover, plan and share trips with HackTrip.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'HackTrip',
    description: 'Discover, plan and share trips with HackTrip.',
    url: '/',
    siteName: 'HackTrip',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HackTrip',
    description: 'Discover, plan and share trips with HackTrip.',
  },
};

export default function HomePage() {
  return (
    <main style={{ padding: '2rem' }}>
      <h1>HackTrip</h1>
      <p>
        The Next.js App Router shell is in place. Public trips, trip details and the remaining
        pages are being migrated to the new architecture.
      </p>
    </main>
  );
}
