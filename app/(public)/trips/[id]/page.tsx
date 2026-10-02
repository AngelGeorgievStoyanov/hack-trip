import type { Metadata } from 'next';

interface TripPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: TripPageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Trip ${id}`,
    description: `Trip details for trip ${id}.`,
    alternates: { canonical: `/trips/${id}` },
  };
}

export default async function TripPage({ params }: TripPageProps) {
  const { id } = await params;
  return (
    <main style={{ padding: '2rem' }}>
      <h1>Trip {id}</h1>
      <p>Trip details will be server-rendered here (Step 7).</p>
    </main>
  );
}
