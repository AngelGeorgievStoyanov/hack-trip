'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { GoogleMap, MarkerF, PolylineF } from '@react-google-maps/api';
import { Alert, Box, Button, CircularProgress, Stack, Typography } from '@mui/material';
import { useGoogleMapsLoader } from '@/hooks/useGoogleMapsLoader';
import { useLiveTracking } from '@/hooks/useLiveTracking';
import {
  MAP_CONTAINER_HEIGHT,
  MAP_DEFAULT_CENTER,
  MAP_TRACKING_ZOOM,
} from '@/constants/maps';
import { formatDistance, formatDuration } from '@/lib/tracking';

export function LiveTracker() {
  const { isLoaded } = useGoogleMapsLoader();
  const { points, current, tracking, error, distanceMeters, elapsedSeconds, start, stop, reset } =
    useLiveTracking();
  const mapRef = useRef<google.maps.Map | null>(null);
  const [follow, setFollow] = useState(true);

  const path = useMemo(
    () => points.map((point) => ({ lat: point.lat, lng: point.lng })),
    [points],
  );

  useEffect(() => {
    if (!follow || !current) {
      return;
    }
    mapRef.current?.panTo({ lat: current.lat, lng: current.lng });
  }, [follow, current]);

  const stats = [
    { label: 'Elapsed', value: formatDuration(elapsedSeconds) },
    { label: 'Distance', value: formatDistance(distanceMeters) },
    { label: 'Points recorded', value: String(points.length) },
    { label: 'GPS time', value: current ? new Date(current.timestamp).toLocaleTimeString() : '—' },
    { label: 'Latitude', value: current ? current.lat.toFixed(7) : '—' },
    { label: 'Longitude', value: current ? current.lng.toFixed(7) : '—' },
    {
      label: 'Speed',
      value: current?.speed != null ? `${Math.round(current.speed * 3.6)} km/h` : '—',
    },
    {
      label: 'Altitude',
      value: current?.altitude != null ? `${Math.round(current.altitude)} m` : '—',
    },
  ];

  return (
    <Stack spacing={2}>
      {error ? <Alert severity="warning">{error}</Alert> : null}

      <Box
        sx={{
          width: '100%',
          height: MAP_CONTAINER_HEIGHT,
          border: '1px solid #e0e0e0',
          borderRadius: 1,
          overflow: 'hidden',
        }}
      >
        {isLoaded ? (
          <GoogleMap
            mapContainerStyle={{ width: '100%', height: '100%' }}
            center={MAP_DEFAULT_CENTER}
            zoom={MAP_TRACKING_ZOOM}
            onLoad={(map) => {
              mapRef.current = map;
            }}
            onUnmount={() => {
              mapRef.current = null;
            }}
            onDrag={() => setFollow(false)}
          >
            {path.length > 1 ? (
              <PolylineF
                path={path}
                options={{
                  strokeColor: '#1976d2',
                  strokeOpacity: 0.9,
                  strokeWeight: 4,
                  geodesic: true,
                }}
              />
            ) : null}
            {current ? <MarkerF position={{ lat: current.lat, lng: current.lng }} /> : null}
          </GoogleMap>
        ) : (
          <Box sx={{ display: 'grid', placeItems: 'center', width: '100%', height: '100%' }}>
            <CircularProgress size={28} />
          </Box>
        )}
      </Box>

      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
        {tracking ? (
          <Button type="button" variant="contained" onClick={stop}>
            Stop tracking
          </Button>
        ) : (
          <Button type="button" variant="contained" onClick={start}>
            Start tracking
          </Button>
        )}
        <Button type="button" onClick={reset} disabled={points.length === 0 && !tracking}>
          Reset
        </Button>
        <Button type="button" onClick={() => setFollow(true)} disabled={!current || follow}>
          Center on my location
        </Button>
        <Typography role="status" variant="body2" sx={{ alignSelf: 'center' }}>
          {tracking ? 'Tracking active' : 'Tracking stopped'}
        </Typography>
      </Stack>

      <Box
        component="dl"
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(4, 1fr)' },
          gap: 1,
          m: 0,
        }}
      >
        {stats.map((stat) => (
          <Box
            key={stat.label}
            component="div"
            sx={{ border: '1px solid #e0e0e0', borderRadius: 1, p: 1 }}
          >
            <Typography component="dt" variant="caption" color="text.secondary">
              {stat.label}
            </Typography>
            <Typography component="dd" variant="body2" sx={{ m: 0 }}>
              {stat.value}
            </Typography>
          </Box>
        ))}
      </Box>

      <Typography variant="caption">
        Tracking data is kept in this browser session only; it is never uploaded.
      </Typography>
    </Stack>
  );
}
