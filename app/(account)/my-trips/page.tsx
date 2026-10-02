import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My trips',
  robots: { index: false, follow: false },
};

export default function MyTripsPage() {
  return (
    <section>
      <h1>My trips</h1>
      <p>My trips will be implemented in a later step.</p>
    </section>
  );
}
