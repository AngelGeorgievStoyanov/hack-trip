'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { GoogleMap, InfoWindowF, MarkerF, PolylineF } from '@react-google-maps/api';
import { Box } from '@mui/material';
import { useGoogleMapsLoader } from '@/hooks/useGoogleMapsLoader';
import { toMapPosition, type MapPosition } from '@/lib/maps';
import {
  MAP_DEFAULT_ZOOM,
  MAP_TRIP_HEIGHT,
  MAP_TRIP_OPTIONS,
  MAP_TRIP_WIDTH,
} from '@/constants/maps';
import type { TripPoint } from '@/types';

interface MarkerItem {
  id: number;
  title: string;
  label: string;
  position: MapPosition;
}

interface TripMapProps {
  points: TripPoint[];
  /** Stepper-selected point; the map pans to it, mirroring the legacy point navigation. */
  focusPointId?: number | null;
  /** Called when a user clicks a marker so the parent can select the corresponding point. */
  onMarkerSelect?: (pointId: number) => void;
}

export function TripMap({ points, focusPointId, onMarkerSelect }: TripMapProps) {
  const { isLoaded } = useGoogleMapsLoader();
  const [selected, setSelected] = useState<MarkerItem | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);

  const markers = useMemo<MarkerItem[]>(
    () =>
      points.flatMap((point, index) => {
        const position = toMapPosition(point);
        // Points arrive in server `pointNumber` order, so the list index is the marker label.
        return position
          ? [{ id: point.id, title: point.name, label: String(index + 1), position }]
          : [];
      }),
    [points],
  );

  const path = useMemo(() => markers.map((marker) => marker.position), [markers]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || focusPointId === null || focusPointId === undefined) {
      return;
    }
    const marker = markers.find((item) => item.id === focusPointId);
    if (marker) {
      map.panTo(marker.position);
      map.setZoom(MAP_DEFAULT_ZOOM);
    }
  }, [focusPointId, markers]);

  if (!isLoaded || markers.length === 0) {
    return null;
  }

  return (
    <Box sx={{ display: 'flex', maxWidth: MAP_TRIP_WIDTH, width: '100%' }}>
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: `${MAP_TRIP_HEIGHT}px` }}
        options={MAP_TRIP_OPTIONS as google.maps.MapOptions}
        onLoad={(map) => {
          mapRef.current = map;
          if (markers.length === 1) {
            map.setCenter(markers[0].position);
            map.setZoom(MAP_DEFAULT_ZOOM);
            return;
          }
          const bounds = new google.maps.LatLngBounds();
          markers.forEach((marker) => bounds.extend(marker.position));
          map.fitBounds(bounds);
        }}
        onUnmount={() => {
          mapRef.current = null;
        }}
      >
        {path.length > 1 ? <PolylineF path={path} /> : null}
        {markers.map((marker) => (
          <MarkerF
            key={marker.id}
            position={marker.position}
            title={marker.title}
            label={marker.label}
            animation={google.maps.Animation.DROP}
            onClick={() => {
              setSelected(marker);
              onMarkerSelect?.(marker.id);
            }}
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
