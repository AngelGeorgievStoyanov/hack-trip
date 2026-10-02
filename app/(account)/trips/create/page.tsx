import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create trip',
  robots: { index: false, follow: false },
};

export default function CreateTripPage() {
  return (
    <section>
      <h1>Create trip</h1>
      <p>Trip creation will be implemented in a later step.</p>
    </section>
  );
}
