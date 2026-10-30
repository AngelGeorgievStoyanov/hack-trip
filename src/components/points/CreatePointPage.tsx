'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { tripApi } from '@/api/trips';
import { pointApi } from '@/api/points';
import { PointForm } from '@/components/points/PointForm';
import { useConfirm } from '@/components/common/ConfirmDialog';
import { getGenericErrorMessage } from '@/lib/errors';
import { buildTripUrl } from '@/lib/tripUrl';
import type { TripGroupResponse, TripPoint } from '@/types';

export function CreatePointPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { confirm } = useConfirm();
  const tripGroupId = Number(searchParams.get('tripGroupId'));
  const tripId = Number(searchParams.get('tripId'));
  const [tripGroup, setTripGroup] = useState<TripGroupResponse | null>(null);
  const [dayNumber, setDayNumber] = useState<number | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<TripPoint | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const selectedDay = useMemo(
    () => tripGroup?.days.find((day) => day.id === tripId) ?? null,
    [tripGroup, tripId],
  );

  async function refreshTrip(): Promise<void> {
    const result = await tripApi.getTrip(tripGroupId);
    const day = result.days.find((item) => item.id === tripId);
    if (!day) {
      throw new Error('The requested trip does not belong to this trip group.');
    }
    setTripGroup(result);
    setDayNumber(day.dayNumber);
  }

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

  function handleBack(): void {
    if (tripGroup && dayNumber !== null) {
      router.replace(buildTripUrl(tripGroup.id, dayNumber));
      router.refresh();
      return;
    }
    router.replace('/trips');
  }

  async function handlePointSaved(): Promise<void> {
    setSaving(true);
    setError(null);
    try {
      await refreshTrip();
      setSelectedPoint(undefined);
    } catch (requestError) {
      setError(getGenericErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  }

  async function handleDeletePoint(point: TripPoint): Promise<void> {
    const accepted = await confirm(
      `Are you sure you want to delete "${point.name}"?`,
      'Delete Confirmation',
    );
    if (!accepted) return;

    setError(null);
    try {
      await pointApi.deletePoint(point.id);
      await refreshTrip();
      if (selectedPoint?.id === point.id) setSelectedPoint(undefined);
    } catch (requestError) {
      setError(getGenericErrorMessage(requestError));
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && !tripGroup) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!tripGroup || !selectedDay || dayNumber === null) {
    return <Alert severity="error">The requested trip could not be loaded.</Alert>;
  }

  return (
    <Box sx={{ width: '100%', maxWidth: 1440, mx: 'auto', px: { xs: 1, sm: 2 }, py: 2 }}>
      <Typography variant="h5" component="h1" sx={{ mb: 2, textAlign: 'center', textTransform: 'uppercase' }}>
        Add points — Day {dayNumber}
      </Typography>

      {error ? <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert> : null}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(250px, 0.75fr) minmax(0, 1.6fr)' },
          alignItems: 'start',
          gap: { xs: 2, md: 3 },
        }}
      >
        <Paper variant="outlined" sx={{ p: { xs: 1.5, sm: 2 }, minWidth: 0 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
            <Typography variant="h6">Points ({selectedDay.points.length})</Typography>
            <Button
              size="small"
              variant="contained"
              onClick={() => setSelectedPoint(undefined)}
              disabled={saving}
            >
              Add point
            </Button>
          </Stack>
          <Divider sx={{ my: 1.5 }} />

          {selectedDay.points.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No points added to this day yet.
            </Typography>
          ) : (
            <Stack spacing={1}>
              {selectedDay.points.map((point) => (
                <Paper
                  key={point.id}
                  variant="outlined"
                  sx={{
                    p: 1.5,
                    borderColor: selectedPoint?.id === point.id ? 'primary.main' : 'divider',
                    backgroundColor: selectedPoint?.id === point.id ? 'action.selected' : 'background.paper',
                  }}
                >
                  <Typography variant="subtitle1" sx={{ overflowWrap: 'anywhere' }}>
                    {point.pointNumber}. {point.name}
                  </Typography>
                  {point.description ? (
                    <Typography variant="body2" color="text.secondary" sx={{ my: 0.5 }}>
                      {point.description}
                    </Typography>
                  ) : null}
                  {point.lat != null && point.lng != null ? (
                    <Typography variant="caption" color="text.secondary">
                      {point.lat.toFixed(6)}, {point.lng.toFixed(6)}
                    </Typography>
                  ) : null}
                  <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                    <Button size="small" onClick={() => setSelectedPoint(point)}>Edit</Button>
                    <Button size="small" color="error" onClick={() => void handleDeletePoint(point)}>
                      Delete
                    </Button>
                  </Stack>
                </Paper>
              ))}
            </Stack>
          )}

          <Button fullWidth sx={{ mt: 2 }} onClick={handleBack}>
            Back to trip
          </Button>
        </Paper>

        <Paper variant="outlined" sx={{ p: { xs: 1.5, sm: 3 }, minWidth: 0 }}>
          <PointForm
            key={selectedPoint?.id ?? 'new-point'}
            tripGroupId={tripGroup.id}
            tripId={tripId}
            point={selectedPoint}
            onDone={() => void handlePointSaved()}
          />
        </Paper>
      </Box>
    </Box>
  );
}
