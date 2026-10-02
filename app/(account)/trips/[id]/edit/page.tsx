import type { Metadata } from 'next';

interface EditTripPageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: 'Edit trip',
  robots: { index: false, follow: false },
};

export default async function EditTripPage({ params }: EditTripPageProps) {
  const { id } = await params;
  return (
    <section>
      <h1>Edit trip {id}</h1>
      <p>Trip editing will be implemented in a later step.</p>
    </section>
  );
}
