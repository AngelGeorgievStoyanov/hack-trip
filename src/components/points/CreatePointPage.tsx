'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Alert, Box, CircularProgress } from '@mui/material';
import { tripApi } from '@/api/trips';
import { PointForm } from '@/components/points/PointForm';
import { getGenericErrorMessage } from '@/lib/errors';
import { buildTripUrl } from '@/lib/tripUrl';
import type { TripGroupResponse } from '@/types';

export function CreatePointPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tripGroupId = Number(searchParams.get('tripGroupId'));
  const tripId = Number(searchParams.get('tripId'));
  const [tripGroup, setTripGroup] = useState<TripGroupResponse | null>(null);
  const [dayNumber, setDayNumber] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (
      !Number.isSafeInteger(tripGroupId) || tripGroupId < 1 ||
      !Number.isSafeInteger(tripId) || tripId < 1
    ) {
      setError('A valid tripGroupId and tripId are required.');
      setLoading(false);
      return;
    }

    let cancelled = false;
    tripApi.getTrip(tripGroupId)
      .then((result) => {
        if (cancelled) return;
        const selectedTrip = result.days.find((day) => day.id === tripId);
        if (!selectedTrip) {
          setError('The requested trip does not belong to this trip group.');
          return;
        }
        setTripGroup(result);
        setDayNumber(selectedTrip.dayNumber);
      })
      .catch((requestError) => {
        if (!cancelled) setError(getGenericErrorMessage(requestError));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [tripGroupId, tripId]);

  function handleDone(): void {
    if (tripGroup && dayNumber !== null) {
      router.replace(buildTripUrl(tripGroup.id, dayNumber));
      router.refresh();
      return;
    }
    router.replace('/trips');
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !tripGroup || dayNumber === null) {
    return <Alert severity="error">{error ?? 'The requested trip could not be loaded.'}</Alert>;
  }

  return (
    <Box sx={{ width: 'min(100%, 620px)', mx: 'auto' }}>
      <PointForm
        tripGroupId={tripGroup.id}
        tripId={tripId}
        onDone={handleDone}
      />
    </Box>
  );
}
