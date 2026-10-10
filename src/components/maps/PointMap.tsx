'use client';

import { GoogleMap, MarkerF } from '@react-google-maps/api';
import { Box } from '@mui/material';
import { useGoogleMapsLoader } from '@/hooks/useGoogleMapsLoader';
import { toMapPosition } from '@/lib/maps';
import { MAP_CONTAINER_HEIGHT, MAP_DEFAULT_ZOOM } from '@/constants/maps';
import type { TripPoint } from '@/types';

export function PointMap({ point }: { point: TripPoint }) {
  const { isLoaded } = useGoogleMapsLoader();
  const position = toMapPosition(point);

  if (!isLoaded || !position) {
    return null;
  }

  return (
    <Box sx={{ width: '100%', height: MAP_CONTAINER_HEIGHT, mt: 2 }}>
      <GoogleMap mapContainerStyle={{ width: '100%', height: '100%' }} center={position} zoom={MAP_DEFAULT_ZOOM}>
        <MarkerF position={position} title={point.name} />
      </GoogleMap>
    </Box>
  );
}
