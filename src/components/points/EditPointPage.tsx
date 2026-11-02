'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Alert, Box, CircularProgress, Paper } from '@mui/material';
import { pointApi } from '@/api/points';
import { PointForm } from '@/components/points/PointForm';
import { PointLocationPicker } from '@/components/maps/PointLocationPicker';
import { getGenericErrorMessage } from '@/lib/errors';
import type { TripPoint } from '@/types';

export function EditPointPage() {
  const router = useRouter();
  const params = useParams<{ pointId: string }>();
  const pointId = Number(params.pointId);
  const [point, setPoint] = useState<TripPoint | null>(null);
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [findInMapTrigger, setFindInMapTrigger] = useState(0);
  const [mapSearchSelection, setMapSearchSelection] = useState<{ name: string; revision: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!Number.isSafeInteger(pointId) || pointId < 1) {
      setError('A valid point ID is required.');
      setLoading(false);
      return;
    }

    let cancelled = false;
    pointApi.getPoint(pointId)
      .then((result) => {
        if (cancelled) return;
        if (!result.permissions.canEdit) {
          setError('You do not have permission to edit this point.');
          return;
        }
        setPoint(result);
        setLatitude(result.lat == null ? '' : String(result.lat));
        setLongitude(result.lng == null ? '' : String(result.lng));
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
  }, [pointId]);

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>;
  }

  if (error && !point) return <Alert severity="error">{error}</Alert>;
  if (!point) return <Alert severity="error">The point could not be loaded.</Alert>;

  return (
    <Box sx={{ width: '100%', maxWidth: 900, mx: 'auto', px: { xs: 1, sm: 2 }, py: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {error ? <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert> : null}
      <PointLocationPicker
        latitude={latitude}
        longitude={longitude}
        findInMapTrigger={findInMapTrigger}
        onChange={(nextLatitude, nextLongitude) => {
          setLatitude(nextLatitude);
          setLongitude(nextLongitude);
        }}
        onAddressSelect={(name) => setMapSearchSelection((current) => ({ name, revision: (current?.revision ?? 0) + 1 }))}
      />
      <Paper variant="outlined" sx={{ mt: 2.5, p: { xs: 2, sm: '30px' }, width: '100%', maxWidth: 600, boxSizing: 'border-box', backgroundColor: '#eee7e79e', border: '1px solid black', borderRadius: 0, boxShadow: '3px 2px 5px black', '& .MuiFormControl-root': { m: 0.5, width: 'calc(100% - 10px)' } }}>
        <PointForm
          key={point.id}
          tripGroupId={0}
          tripId={point.tripId}
          point={point}
          latitude={latitude}
          longitude={longitude}
          mapSearchSelection={mapSearchSelection}
          onLocationChange={(nextLatitude, nextLongitude) => {
            setLatitude(nextLatitude);
            setLongitude(nextLongitude);
          }}
          onFindInMap={() => setFindInMapTrigger((current) => current + 1)}
          onAddNextDay={() => undefined}
          onBack={() => router.back()}
          onDone={() => router.back()}
        />
      </Paper>
    </Box>
  );
}
