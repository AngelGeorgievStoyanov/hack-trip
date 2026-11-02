import type { Metadata } from 'next';
import { NOINDEX } from '@/constants/seo';
import { notFound } from 'next/navigation';
import { RequireTripOwner } from '@/components/auth';
import { TripDaysManager } from '@/components/trips/TripDaysManager';
import { getTrip, isNotFoundError } from '@/lib/serverApi';
import { positiveIdParam } from '@/validations';
import type { TripGroupResponse } from '@/types';

export const metadata: Metadata = {
  title: 'Edit trip',
  robots: NOINDEX,
};

interface EditTripPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ dayId?: string }>;
}

export default async function EditTripPage({ params, searchParams }: EditTripPageProps) {
  const [{ id }, { dayId: rawDayId }] = await Promise.all([params, searchParams]);
  const parsed = positiveIdParam.safeParse(id);
  if (!parsed.success) {
    notFound();
  }
  const tripGroupId = Number(parsed.data);

  let trip: TripGroupResponse;
  try {
    trip = await getTrip(tripGroupId);
  } catch (error) {
    if (isNotFoundError(error)) {
      notFound();
    }
    throw error;
  }

  const parsedDayId = rawDayId === undefined ? null : positiveIdParam.safeParse(rawDayId);
  if (parsedDayId && !parsedDayId.success) {
    notFound();
  }
  const initialEditingDayId = parsedDayId?.success ? Number(parsedDayId.data) : undefined;
  if (
    initialEditingDayId !== undefined &&
    !trip.days.some((day) => day.id === initialEditingDayId)
  ) {
    notFound();
  }

  // Trip metadata is day-scoped and uses PUT /trips/:tripGroupId/days/:dayId.

  return (
    <RequireTripOwner tripGroupId={trip.id}>
      <div style={{ maxWidth: 720, display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
        <TripDaysManager
          tripGroupId={trip.id}
          initialTrip={trip}
          initialEditingDayId={initialEditingDayId}
        />
      </div>
    </RequireTripOwner>
  );
}

