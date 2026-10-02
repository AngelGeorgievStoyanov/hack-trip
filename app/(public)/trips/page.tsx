import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Trips',
  description: 'Browse and discover trips on HackTrip.',
  alternates: { canonical: '/trips' },
};

export default function TripsPage() {
  return (
    <main style={{ padding: '2rem' }}>
      <h1>Trips</h1>
      <p>The public trips list will be server-rendered here.</p>
    </main>
  );
}
