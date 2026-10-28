'use client';

import { GoogleMapView } from '@/components/maps/GoogleMapView';
import { toMapPosition } from '@/lib/maps';
import { MAP_CONTAINER_HEIGHT, MAP_DEFAULT_ZOOM } from '@/constants/maps';
import type { TripPoint } from '@/types';

export function PointMap({ point }: { point: TripPoint }) {
  const position = toMapPosition(point);
  if (!position) return null;

  return (
    <GoogleMapView
      markers={[{ id: point.id, title: point.name, position }]}
      center={position}
      zoom={MAP_DEFAULT_ZOOM}
      height={MAP_CONTAINER_HEIGHT}
      maxWidth="100%"
    />
  );
}
