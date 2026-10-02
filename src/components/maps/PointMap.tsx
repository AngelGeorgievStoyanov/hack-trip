'use client';

import { GoogleMap, MarkerF, useJsApiLoader } from '@react-google-maps/api';
import { Box } from '@mui/material';
import { googleMapsInitConfig, toMapPosition } from '@/lib/maps';
import type { TripPoint } from '@/types';

export function PointMap({ point }: { point: TripPoint }) {
  const { isLoaded } = useJsApiLoader({ ...googleMapsInitConfig, id: 'point-map' });
  const position = toMapPosition(point);

  if (!isLoaded || !position) {
    return null;
  }

  return (
    <Box sx={{ width: '100%', height: 400, mt: 2 }}>
      <GoogleMap mapContainerStyle={{ width: '100%', height: '100%' }} center={position} zoom={14}>
        <MarkerF position={position} title={point.title} />
      </GoogleMap>
    </Box>
  );
}
