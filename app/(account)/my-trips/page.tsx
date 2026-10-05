import type { Metadata } from 'next';
import Link from 'next/link';
import { NOINDEX } from '@/constants/seo';

export const metadata: Metadata = {
  title: 'My trips',
  robots: NOINDEX,
};

export default function MyTripsPage() {
  return (
    <section>
      <h1>My trips</h1>
      <p>You don&apos;t have a published trip yet.</p>
      <Link href="/trips/create">CLICK HERE AND ADD YOUR FIRST TRIP</Link>
    </section>
  );
}
