import type { Metadata } from 'next';

interface PointPageProps {
  params: Promise<{ pointId: string }>;
}

export async function generateMetadata({ params }: PointPageProps): Promise<Metadata> {
  const { pointId } = await params;
  return {
    title: `Point ${pointId}`,
    description: `Point details for point ${pointId}.`,
    alternates: { canonical: `/points/${pointId}` },
  };
}

export default async function PointPage({ params }: PointPageProps) {
  const { pointId } = await params;
  return (
    <main style={{ padding: '2rem' }}>
      <h1>Point {pointId}</h1>
      <p>Point details will be rendered here (Step 8).</p>
    </main>
  );
}
