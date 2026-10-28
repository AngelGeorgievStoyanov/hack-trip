'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { GoogleMap, InfoWindowF, MarkerF, PolylineF } from '@react-google-maps/api';
import { Box, CircularProgress } from '@mui/material';
import { useGoogleMapsLoader } from '@/hooks/useGoogleMapsLoader';
import { MAP_DEFAULT_CENTER, MAP_DEFAULT_ZOOM, MAP_TRIP_OPTIONS } from '@/constants/maps';
import type { MapPosition } from '@/lib/maps';

export interface GoogleMapMarker {
  id: string | number;
  position: MapPosition;
  title?: string;
  label?: string;
  draggable?: boolean;
}

interface GoogleMapViewProps {
  markers?: GoogleMapMarker[];
  path?: MapPosition[];
  center?: MapPosition;
  zoom?: number;
  height?: number | string;
  maxWidth?: number | string;
  options?: google.maps.MapOptions;
  fitBounds?: boolean;
  selectedMarkerId?: string | number | null;
  onMarkerSelect?: (marker: GoogleMapMarker) => void;
  onMarkerDragEnd?: (position: MapPosition, marker: GoogleMapMarker) => void;
  onMapClick?: (position: MapPosition) => void;
  onLoad?: (map: google.maps.Map) => void;
  onUnmount?: () => void;
  renderInfoWindow?: (marker: GoogleMapMarker) => ReactNode;
  showLoading?: boolean;
}

/**
 * Shared Google Maps renderer. Feature-specific components own their controls and
 * state; this component owns SDK loading, map layout, markers, paths and map events.
 */
export function GoogleMapView({
  markers = [],
  path = [],
  center = MAP_DEFAULT_CENTER,
  zoom = MAP_DEFAULT_ZOOM,
  height = 250,
  maxWidth = 600,
  options = MAP_TRIP_OPTIONS as google.maps.MapOptions,
  fitBounds = false,
  selectedMarkerId = null,
  onMarkerSelect,
  onMarkerDragEnd,
  onMapClick,
  onLoad,
  onUnmount,
  renderInfoWindow,
  showLoading = true,
}: GoogleMapViewProps) {
  const { isLoaded } = useGoogleMapsLoader();
  const mapRef = useRef<google.maps.Map | null>(null);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !fitBounds || markers.length === 0) return;

    if (markers.length === 1) {
      map.setCenter(markers[0].position);
      map.setZoom(zoom);
      return;
    }

    const bounds = new google.maps.LatLngBounds();
    markers.forEach((marker) => bounds.extend(marker.position));
    map.fitBounds(bounds);
  }, [fitBounds, markers, zoom]);

  useEffect(() => {
    if (!mapRef.current || fitBounds) return;
    mapRef.current.setCenter(center);
  }, [center.lat, center.lng, fitBounds]);

  if (!isLoaded) {
    return showLoading ? (
      <Box sx={{ display: 'grid', placeItems: 'center', width: '100%', maxWidth, height }}>
        <CircularProgress size={28} />
      </Box>
    ) : null;
  }

  const selectedMarker =
    selectedMarkerId == null ? undefined : markers.find((marker) => marker.id === selectedMarkerId);

  return (
    <Box sx={{ display: 'flex', width: '100%', maxWidth, minWidth: 0 }}>
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: typeof height === 'number' ? `${height}px` : height }}
        center={center}
        zoom={zoom}
        options={options}
        onLoad={(map) => {
          mapRef.current = map;
          onLoad?.(map);
          if (fitBounds && markers.length > 0) {
            if (markers.length === 1) {
              map.setCenter(markers[0].position);
              map.setZoom(zoom);
            } else {
              const bounds = new google.maps.LatLngBounds();
              markers.forEach((marker) => bounds.extend(marker.position));
              map.fitBounds(bounds);
            }
          }
        }}
        onUnmount={() => {
          mapRef.current = null;
          onUnmount?.();
        }}
        onClick={(event) => {
          if (event.latLng) onMapClick?.({ lat: event.latLng.lat(), lng: event.latLng.lng() });
        }}
      >
        {path.length > 1 ? <PolylineF path={path} /> : null}
        {markers.map((marker) => (
          <MarkerF
            key={marker.id}
            position={marker.position}
            title={marker.title}
            label={marker.label}
            draggable={marker.draggable}
            animation={google.maps.Animation.DROP}
            onClick={() => onMarkerSelect?.(marker)}
            onDragEnd={(event) => {
              if (event.latLng) {
                onMarkerDragEnd?.(
                  { lat: event.latLng.lat(), lng: event.latLng.lng() },
                  marker,
                );
              }
            }}
          />
        ))}
        {selectedMarker && renderInfoWindow ? (
          <InfoWindowF
            position={selectedMarker.position}
            onCloseClick={() => onMarkerSelect?.(selectedMarker)}
          >
            {renderInfoWindow(selectedMarker)}
          </InfoWindowF>
        ) : null}
      </GoogleMap>
    </Box>
  );
}
