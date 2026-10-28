'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { GoogleMapView, type GoogleMapMarker } from '@/components/maps/GoogleMapView';
import { toMapPosition, type MapPosition } from '@/lib/maps';
import { MAP_DEFAULT_ZOOM, MAP_TRIP_HEIGHT, MAP_TRIP_OPTIONS, MAP_TRIP_WIDTH } from '@/constants/maps';
import type { TripPoint } from '@/types';

interface TripMapProps {
  points: TripPoint[];
  focusPointId?: number | null;
  onMarkerSelect?: (pointId: number) => void;
}

export function TripMap({ points, focusPointId, onMarkerSelect }: TripMapProps) {
  const [selected, setSelected] = useState<GoogleMapMarker | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);

  const markers = useMemo<GoogleMapMarker[]>(
    () =>
      points.flatMap((point, index) => {
        const position = toMapPosition(point);
        return position
          ? [{ id: point.id, title: point.name, label: String(index + 1), position }]
          : [];
      }),
    [points],
  );
  const path = useMemo<MapPosition[]>(() => markers.map((marker) => marker.position), [markers]);

  useEffect(() => {
    if (focusPointId == null || !mapRef.current) return;
    const marker = markers.find((item) => item.id === focusPointId);
    if (marker) {
      mapRef.current.panTo(marker.position);
      mapRef.current.setZoom(MAP_DEFAULT_ZOOM);
    }
  }, [focusPointId, markers]);

  if (markers.length === 0) return null;

  return (
    <GoogleMapView
      markers={markers}
      path={path}
      height={MAP_TRIP_HEIGHT}
      maxWidth={MAP_TRIP_WIDTH}
      options={MAP_TRIP_OPTIONS as google.maps.MapOptions}
      fitBounds
      selectedMarkerId={selected?.id ?? null}
      onMarkerSelect={(marker) => {
        setSelected(marker);
        if (marker) onMarkerSelect?.(Number(marker.id));
      }}
      onLoad={(map) => {
        mapRef.current = map;
      }}
      onUnmount={() => {
        mapRef.current = null;
      }}
      renderInfoWindow={(marker) => <Link href={`/points/${marker.id}`}>{marker.title}</Link>}
    />
  );
}
