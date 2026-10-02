import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { JsonLd } from '@/components/common/JsonLd';
import { PointDetails } from '@/components/points/PointDetails';
import { absoluteUrl } from '@/config';
import { pointRepresentativeImage } from '@/lib/images/representative';
import { getPoint, isNotFoundError } from '@/lib/serverApi';
import { positiveIdParam } from '@/validations';
import type { TripPoint } from '@/types';

interface PointPageProps {
  params: Promise<{ pointId: string }>;
}

function parseId(value: string): number | null {
  const parsed = positiveIdParam.safeParse(value);
  return parsed.success ? Number(parsed.data) : null;
}

export async function generateMetadata({ params }: PointPageProps): Promise<Metadata> {
  const { pointId } = await params;
  const id = parseId(pointId);
  if (id === null) {
    return { title: 'Point not found' };
  }

  try {
    const point = await getPoint(id);
    const url = absoluteUrl(`/points/${point.id}`);
    const image = pointRepresentativeImage(point);

    return {
      title: point.title,
      description: point.description ?? undefined,
      alternates: { canonical: url },
      openGraph: {
        title: point.title,
        description: point.description ?? undefined,
        url,
        siteName: 'HackTrip',
        type: 'website',
        ...(image ? { images: [{ url: image }] } : {}),
      },
      twitter: {
        card: 'summary_large_image',
        title: point.title,
        description: point.description ?? undefined,
        ...(image ? { images: [image] } : {}),
      },
    };
  } catch (error) {
    if (isNotFoundError(error)) {
      return { title: 'Point not found' };
    }
    throw error;
  }
}

export default async function PointPage({ params }: PointPageProps) {
  const { pointId } = await params;
  const id = parseId(pointId);
  if (id === null) {
    notFound();
  }

  let point: TripPoint;
  try {
    point = await getPoint(id);
  } catch (error) {
    if (isNotFoundError(error)) {
      notFound();
    }
    throw error;
  }

  const url = absoluteUrl(`/points/${point.id}`);
  const image = pointRepresentativeImage(point);

  return (
    <main style={{ padding: '2rem' }}>
      <PointDetails point={point} />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Place',
          name: point.title,
          description: point.description ?? undefined,
          url,
          image: image ?? undefined,
          ...(point.latitude != null && point.longitude != null
            ? {
                geo: {
                  '@type': 'GeoCoordinates',
                  latitude: point.latitude,
                  longitude: point.longitude,
                },
              }
            : {}),
        }}
      />
    </main>
  );
}

