'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, Box, Button, Typography } from '@mui/material';
import { tripApi } from '@/api/trips';
import { DayForm } from './DayForm';
import { DayEditor } from './DayEditor';
import { getGenericErrorMessage } from '@/lib/errors';
import type { TripGroupResponse } from '@/types';

interface TripDaysManagerProps {
  tripGroupId: number;
  initialTrip: TripGroupResponse;
}

export function TripDaysManager({ tripGroupId, initialTrip }: TripDaysManagerProps) {
  const queryClient = useQueryClient();
  const [addingDay, setAddingDay] = useState<{ dayNumber: number } | null>(null);
  const [editingDayId, setEditingDayId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: trip } = useQuery({
    queryKey: ['trip', tripGroupId],
    queryFn: () => tripApi.getTrip(tripGroupId),
    initialData: initialTrip,
  });

  const reorderDaysMutation = useMutation({
    mutationFn: (dayIds: number[]) => tripApi.reorderDays(tripGroupId, { tripIds: dayIds }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['trip', tripGroupId] }),
    onError: (e) => setError(getGenericErrorMessage(e)),
  });

  const days = trip?.days ?? [];
  // A new day defaults to `max(existing dayNumbers) + 1`; the backend value returned by
  // `POST /trips/:tripId/days` stays authoritative (API_CONTRACT.md §8.10).
  const nextDayNumber = days.reduce((max, day) => Math.max(max, day.dayNumber), 0) + 1;

  function moveDay(index: number, direction: -1 | 1): void {
    const target = index + direction;
    if (target < 0 || target >= days.length) {
      return;
    }
    const next = [...days];
    [next[index], next[target]] = [next[target], next[index]];
    reorderDaysMutation.mutate(next.map((d) => d.id));
  }

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h5">Days</Typography>
      {error ? <Alert severity="error" onClose={() => setError(null)}>{error}</Alert> : null}
      {days.map((day, index) => (
        <DayEditor
          key={day.id}
          tripGroupId={tripGroupId}
          day={day}
          editing={editingDayId === day.id}
          onEditingChange={(next) => setEditingDayId(next ? day.id : null)}
          onMove={(direction) => moveDay(index, direction)}
        />
      ))}
      {addingDay ? (
        <DayForm
          tripGroupId={tripGroupId}
          existingDays={days}
          initialDayNumber={addingDay.dayNumber}
          onOpenExistingDay={(dayId) => {
            setAddingDay(null);
            setEditingDayId(dayId);
          }}
          onDone={() => setAddingDay(null)}
        />
      ) : (
        <Button variant="outlined" onClick={() => setAddingDay({ dayNumber: nextDayNumber })}>
          {`Add next day (Day ${nextDayNumber})`}
        </Button>
      )}
    </Box>
  );
}
