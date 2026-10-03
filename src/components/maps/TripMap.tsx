'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { GoogleMap, InfoWindowF, MarkerF, useJsApiLoader } from '@react-google-maps/api';
import { Box } from '@mui/material';
import { googleMapsInitConfig, toMapPosition, type MapPosition } from '@/lib/maps';
import { MAP_CONTAINER_HEIGHT, MAP_DEFAULT_ZOOM } from '@/constants/maps';
import type { TripPoint } from '@/types';

interface MarkerItem {
  id: number;
  title: string;
  position: MapPosition;
}

export function TripMap({ points }: { points: TripPoint[] }) {
  const { isLoaded } = useJsApiLoader({ ...googleMapsInitConfig, id: 'trip-map' });
  const [selected, setSelected] = useState<MarkerItem | null>(null);

  const markers = useMemo<MarkerItem[]>(
    () =>
      points.flatMap((point) => {
        const position = toMapPosition(point);
        return position ? [{ id: point.id, title: point.title, position }] : [];
      }),
    [points],
  );

  if (!isLoaded || markers.length === 0) {
    return null;
  }

  return (
    <Box sx={{ width: '100%', height: MAP_CONTAINER_HEIGHT, mt: 2 }}>
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        onLoad={(map) => {
          if (markers.length === 1) {
            map.setCenter(markers[0].position);
            map.setZoom(MAP_DEFAULT_ZOOM);
            return;
          }
          const bounds = new google.maps.LatLngBounds();
          markers.forEach((marker) => bounds.extend(marker.position));
          map.fitBounds(bounds);
        }}
      >
        {markers.map((marker) => (
          <MarkerF
            key={marker.id}
            position={marker.position}
            title={marker.title}
            onClick={() => setSelected(marker)}
          />
        ))}
        {selected ? (
          <InfoWindowF position={selected.position} onCloseClick={() => setSelected(null)}>
            <Link href={`/points/${selected.id}`}>{selected.title}</Link>
          </InfoWindowF>
        ) : null}
      </GoogleMap>
    </Box>
  );
}
