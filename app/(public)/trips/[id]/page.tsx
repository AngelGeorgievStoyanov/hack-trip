import type { Metadata } from 'next';
import type { CSSProperties } from 'react';
import { notFound } from 'next/navigation';
import { JsonLd } from '@/components/common/JsonLd';
import { TripDetailsView } from '@/components/trips/TripDetailsView';
import { TripItineraryIndex } from '@/seo/modules/trip/TripItineraryIndex';
import { buildTripJsonLd } from '@/seo/modules/trip/buildStructuredData';
import { buildTripSeoContent } from '@/seo/modules/trip/buildContent';
import { buildTripSeoMetadata } from '@/seo/modules/trip/buildMetadata';
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
    return buildTripSeoMetadata(trip, {
      tripId: trip.id,
      dayNumber: day?.dayNumber,
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
  const seoContent = buildTripSeoContent(trip);
  const image = tripRepresentativeImage(trip);

  return (
    <main style={MAIN_STYLE}>
      {/* One trip-group response; day switching uses the already-loaded group. */}
      <TripDetailsView trip={trip} initialDayNumber={day.dayNumber} />
      <TripItineraryIndex itinerary={seoContent.itinerary} />

      <JsonLd
        data={buildTripJsonLd({
          name: seoContent.title,
          description: seoContent.description,
          canonicalPath,
          imageUrl: image ?? undefined,
          itinerary: seoContent.itinerary,
        })}
      />
    </main>
  );
}
