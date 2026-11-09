import type { Metadata } from 'next';
import type { CSSProperties } from 'react';
import { notFound } from 'next/navigation';
import { JsonLd } from '@/components/common/JsonLd';
import { TripDetailsView } from '@/components/trips/TripDetailsView';
import { buildSeoMetadata, buildTripJsonLd } from '@/seo';
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

/** Resolves ?day=N against real day numbers; missing numbers are never generated. */
function resolveDay(
  days: TripGroupDay[],
  value: string | string[] | undefined,
): TripGroupDay | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  const requestedDay = raw ? Number(raw) : Number.NaN;
  return days.find((day) => day.dayNumber === requestedDay) ?? days[0];
}

export async function generateMetadata({
  params,
  searchParams,
}: TripPageProps): Promise<Metadata> {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const tripId = parseId(id);
  if (tripId === null) {
    return { title: 'Trip not found' };
  }

  try {
    const trip = await getTrip(tripId);
    const day = resolveDay(trip.days, query.day);
    const canonicalUrl = absoluteUrl(`/trips/${trip.id}`);
    const sharedUrl = absoluteUrl(
      `/trips/${trip.id}${day ? `?day=${day.dayNumber}` : ''}`,
    );
    const imageUrl = absoluteUrl(
      `/api/og/trips/${trip.id}?day=${day?.dayNumber ?? trip.days[0]?.dayNumber ?? 1}`,
    );
    const title = day?.title ?? day?.destination ?? 'Trip';
    const description = day?.description ?? undefined;
    const image = {
      url: imageUrl,
      width: 1200,
      height: 630,
      alt: `${title} — HackTrip`,
    };

    return buildSeoMetadata({
      title,
      description,
      canonicalPath: `/trips/${trip.id}`,
      openGraphPath: `/trips/${trip.id}${day ? `?day=${day.dayNumber}` : ''}`,
      imageUrl,
      imageAlt: `${title} — HackTrip`,
    });
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

  const canonicalPath = `/trips/${trip.id}`;
  const image = tripRepresentativeImage(trip);

  return (
    <main style={MAIN_STYLE}>
      {/* Single GET /trips/:tripGroupId; day switching uses the already-loaded group. */}
      <TripDetailsView trip={trip} initialDayNumber={day.dayNumber} />

      <JsonLd
        data={buildTripJsonLd({
          name: day.title ?? day.destination ?? 'Trip',
          description: day.description,
          canonicalPath,
          imageUrl: image ?? undefined,
        })}}
      />
    </main>
  );
}
