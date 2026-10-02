import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My trips',
  robots: { index: false, follow: false },
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
