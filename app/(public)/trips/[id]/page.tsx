import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { JsonLd } from '@/components/common/JsonLd';
import { TripMap } from '@/components/maps/TripMap';
import { TripDetails } from '@/components/trips/TripDetails';
import { absoluteUrl } from '@/config';
import { tripRepresentativeImage } from '@/lib/images/representative';
import { hasCoordinates } from '@/lib/maps';
import { getTrip, isNotFoundError } from '@/lib/serverApi';
import { positiveIdParam } from '@/validations';
import type { TripDetails as TripDetailsDto } from '@/types';

interface TripPageProps {
  params: Promise<{ id: string }>;
}

function parseId(value: string): number | null {
  const parsed = positiveIdParam.safeParse(value);
  return parsed.success ? Number(parsed.data) : null;
}

export async function generateMetadata({ params }: TripPageProps): Promise<Metadata> {
  const { id } = await params;
  const tripId = parseId(id);
  if (tripId === null) {
    return { title: 'Trip not found' };
  }

  try {
    const trip = await getTrip(tripId);
    const url = absoluteUrl(`/trips/${trip.id}`);
    const image = tripRepresentativeImage(trip);

    return {
      title: trip.title,
      description: trip.description ?? undefined,
      alternates: { canonical: url },
      openGraph: {
        title: trip.title,
        description: trip.description ?? undefined,
        url,
        siteName: 'HackTrip',
        type: 'website',
        ...(image ? { images: [{ url: image }] } : {}),
      },
      twitter: {
        card: 'summary_large_image',
        title: trip.title,
        description: trip.description ?? undefined,
        ...(image ? { images: [image] } : {}),
      },
    };
  } catch (error) {
    if (isNotFoundError(error)) {
      return { title: 'Trip not found' };
    }
    throw error;
  }
}

export default async function TripPage({ params }: TripPageProps) {
  const { id } = await params;
  const tripId = parseId(id);
  if (tripId === null) {
    notFound();
  }

  let trip: TripDetailsDto;
  try {
    trip = await getTrip(tripId);
  } catch (error) {
    if (isNotFoundError(error)) {
      notFound();
    }
    throw error;
  }

  const url = absoluteUrl(`/trips/${trip.id}`);
  const image = tripRepresentativeImage(trip);

  const points = trip.days.flatMap((day) => day.points);

  return (
    <main style={{ padding: '2rem' }}>
      <TripDetails trip={trip} />
      {points.some(hasCoordinates) ? <TripMap points={points} /> : null}
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Trip',
          name: trip.title,
          description: trip.description ?? undefined,
          url,
          image: image ?? undefined,
        }}
      />
    </main>
  );
}

