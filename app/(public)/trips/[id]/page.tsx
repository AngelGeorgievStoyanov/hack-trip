import type { Metadata } from 'next';
import type { CSSProperties } from 'react';
import { notFound } from 'next/navigation';
import { JsonLd } from '@/components/common/JsonLd';
import { TripDetailsView } from '@/components/trips/TripDetailsView';
import { absoluteUrl } from '@/config';
import { tripRepresentativeImage } from '@/lib/images/representative';
import { getTrip, isNotFoundError } from '@/lib/serverApi';
import { pageBackgroundStyle } from '@/constants/ui';
import { positiveIdParam } from '@/validations';
import type { TripGroupDay, TripGroupResponse } from '@/types';

interface TripPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const MAIN_STYLE: CSSProperties = {
  ...pageBackgroundStyle,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
};

function parseId(value: string): number | null {
  const parsed = positiveIdParam.safeParse(value);
  return parsed.success ? Number(parsed.data) : null;
}

/** Resolves `?day=N` against the real day numbers; missing numbers are never generated. */
function resolveDay(
  days: TripGroupDay[],
  value: string | string[] | undefined,
): TripGroupDay | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  return days.find((day) => day.dayNumber === Number(raw)) ?? days[0];
}

export async function generateMetadata({
  params,
  searchParams,
}: TripPageProps): Promise<Metadata> {
  const { id } = await params;
  const query = await searchParams;
  const tripId = parseId(id);
  if (tripId === null) {
    return { title: 'Trip not found' };
  }

  try {
    const trip = await getTrip(tripId);
    const day = resolveDay(trip.days, query.day);
    const url = absoluteUrl(`/trips/${trip.id}`);
    const image = tripRepresentativeImage(trip);
    const title = day?.title ?? 'Trip';
    const description = day?.description ?? undefined;

    return {
      title,
      description,
      alternates: { canonical: url },
      openGraph: {
        title,
        description,
        url,
        siteName: 'HackTrip',
        type: 'website',
        ...(image ? { images: [{ url: image }] } : {}),
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
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

export default async function TripPage({ params, searchParams }: TripPageProps) {
  const { id } = await params;
  const query = await searchParams;
  const tripId = parseId(id);
  if (tripId === null) {
    notFound();
  }

  let trip: TripGroupResponse;
  try {
    trip = await getTrip(tripId);
  } catch (error) {
    if (isNotFoundError(error)) {
      notFound();
    }
    throw error;
  }

  const day = resolveDay(trip.days, query.day);

  if (!day) {
    notFound();
  }

  const url = absoluteUrl(`/trips/${trip.id}`);
  const image = tripRepresentativeImage(trip);

  return (
    <main style={MAIN_STYLE}>
      {/* Single `GET /trips/:tripGroupId` above; the view opens the requested day and
          switches days locally without new requests, keeping TripGroup.social global. */}
      <TripDetailsView trip={trip} initialDayNumber={day.dayNumber} />

      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Trip',
          name: day.title ?? 'Trip',
          description: day.description ?? undefined,
          url,
          image: image ?? undefined,
        }}
      />
    </main>
  );
}