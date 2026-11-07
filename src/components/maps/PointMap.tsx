'use client';

import { GoogleMapView } from '@/components/maps/GoogleMapView';
import type { TripPoint } from '@/types';

interface PointMapProps {
  point: TripPoint;
}

export function PointMap({ point }: PointMapProps) {
  if (point.lat == null || point.lng == null) {
    return null;
  }

  const position = { lat: point.lat, lng: point.lng };

  return (
    <GoogleMapView
      center={position}
      markers={[{ id: point.id, position, title: point.name }]}
      height={320}
      maxWidth="100%"
    />
  );
}
