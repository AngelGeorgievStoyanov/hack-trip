import type { Metadata } from 'next';
import { NOINDEX } from '@/constants/seo';

export const metadata: Metadata = {
  title: 'My trips',
  robots: NOINDEX,
};

export default function MyTripsPage() {
  return (
    <section>
      <h1>My trips</h1>
      <p>
        A dedicated &quot;my trips&quot; list is not available in the current backend API
        contract: there is no endpoint to list trips by owner.
      </p>
    </section>
  );
}
