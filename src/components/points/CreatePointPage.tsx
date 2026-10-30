'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Alert,
  Box,
  CircularProgress,
  Paper,
} from '@mui/material';
import { tripApi } from '@/api/trips';
import { pointApi } from '@/api/points';
import { PointForm } from '@/components/points/PointForm';
import { PointList } from '@/components/points/PointList';
import { PointLocationPicker } from '@/components/maps/PointLocationPicker';
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
  const [pointLatitude, setPointLatitude] = useState('');
  const [pointLongitude, setPointLongitude] = useState('');
  const [findInMapTrigger, setFindInMapTrigger] = useState(0);
  const [mapSearchName, setMapSearchName] = useState('');

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

  function selectPoint(point?: TripPoint): void {
    setSelectedPoint(point);
    setMapSearchName('');
    setPointLatitude(point?.lat != null ? String(point.lat) : '');
    setPointLongitude(point?.lng != null ? String(point.lng) : '');
  }

  async function handlePointSaved(): Promise<void> {
    setSaving(true);
    setError(null);
    try {
      await refreshTrip();
      selectPoint();
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
      if (selectedPoint?.id === point.id) selectPoint();
    } catch (requestError) {
      setError(getGenericErrorMessage(requestError));
    }
  }

  async function handleMovePoint(point: TripPoint, direction: 'up' | 'down'): Promise<void> {
    if (!selectedDay || saving || !point.permissions.canEdit) return;

    const orderedPoints = [...selectedDay.points].sort(
      (first, second) => first.pointNumber - second.pointNumber,
    );
    const currentIndex = orderedPoints.findIndex((item) => item.id === point.id);
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

    if (currentIndex < 0 || targetIndex < 0 || targetIndex >= orderedPoints.length) return;

    const pointIds = orderedPoints.map((item) => item.id);
    const currentPointId = pointIds[currentIndex];
    const targetPointId = pointIds[targetIndex];
    if (currentPointId === undefined || targetPointId === undefined) return;

    pointIds[currentIndex] = targetPointId;
    pointIds[targetIndex] = currentPointId;

    setSaving(true);
    setError(null);
    try {
      await pointApi.reorderPoints(tripId, {
        pointIds,
      });
      await refreshTrip();
    } catch (requestError) {
      setError(getGenericErrorMessage(requestError));
    } finally {
      setSaving(false);
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
      {error ? <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert> : null}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 1fr)' },
          '@media (min-width:1021px)': { gridTemplateColumns: 'minmax(250px, 0.75fr) minmax(0, 1.6fr)' },
          alignItems: 'start',
          gap: { xs: 2, md: 3 },
        }}
      >
        <Box sx={{ minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <PointList
            points={selectedDay.points}
            onEdit={selectPoint}
            onDelete={(point) => void handleDeletePoint(point)}
            onMove={(point, direction) => void handleMovePoint(point, direction)}
            disabled={saving}
          />
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', minWidth: 0 }}>
          <PointLocationPicker
            latitude={pointLatitude}
            longitude={pointLongitude}
            findInMapTrigger={findInMapTrigger}
            onChange={(latitude, longitude) => {
              setPointLatitude(latitude);
              setPointLongitude(longitude);
            }}
            onAddressSelect={setMapSearchName}
          />

          <Paper
            variant="outlined"
            sx={{
              mt: 2.5,
              p: '30px',
              width: 'fit-content',
              maxWidth: '100%',
              minWidth: 0,
              backgroundColor: '#eee7e79e',
              border: '1px solid black',
              borderRadius: 0,
              boxShadow: '3px 2px 5px black',
              '& .MuiFormControl-root': { m: 0.5, width: 'calc(100% - 10px)' },
              '& .MuiButton-root': { m: 1, width: '32ch', maxWidth: 'calc(100% - 16px)' },
            }}
          >
            <PointForm
              key={selectedPoint?.id ?? 'new-point'}
              tripGroupId={tripGroup.id}
              tripId={tripId}
              point={selectedPoint}
              latitude={pointLatitude}
              longitude={pointLongitude}
              mapSearchName={mapSearchName}
              onLocationChange={(latitude, longitude) => {
                setPointLatitude(latitude);
                setPointLongitude(longitude);
              }}
              onFindInMap={() => setFindInMapTrigger((current) => current + 1)}
              onAddNextDay={() => router.push(`/trips/create?tripGroupId=${tripGroup.id}`)}
              onBack={handleBack}
              onDone={() => void handlePointSaved()}
            />
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}
