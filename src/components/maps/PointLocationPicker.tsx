'use client';

import { useEffect, useRef, useState } from 'react';
import { AddressAutocomplete } from '@/components/maps/AddressAutocomplete';
import { GoogleMapView } from '@/components/maps/GoogleMapView';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useGoogleMapsLoader } from '@/hooks/useGoogleMapsLoader';
import {
  GEOLOCATION_OPTIONS,
  MAP_DEFAULT_CENTER,
  MAP_GEOCODED_ZOOM,
  MAP_POINT_PICKER_HEIGHT,
  MAP_POINT_PICKER_ZOOM,
} from '@/constants/maps';
import {
  coordinatePairToMapPosition,
  formatCoordinate,
  sameMapPosition,
  type MapPosition,
} from '@/lib/maps';

interface PointLocationPickerProps {
  latitude: string;
  longitude: string;
  onChange: (latitude: string, longitude: string) => void;
  findInMapTrigger?: number;
}

export function PointLocationPicker({
  latitude,
  longitude,
  onChange,
  findInMapTrigger = 0,
}: PointLocationPickerProps) {
  const { isLoaded } = useGoogleMapsLoader();
  const [center, setCenter] = useState<MapPosition>(
    () => coordinatePairToMapPosition(latitude, longitude) ?? MAP_DEFAULT_CENTER,
  );
  const [address, setAddress] = useState('');
  const [locating, setLocating] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const emittedRef = useRef<MapPosition | null>(
    coordinatePairToMapPosition(latitude, longitude),
  );
  const mapRef = useRef<google.maps.Map | null>(null);

  const position = coordinatePairToMapPosition(latitude, longitude);

  useEffect(() => {
    const external = coordinatePairToMapPosition(latitude, longitude);
    if (!external || sameMapPosition(external, emittedRef.current)) {
      return;
    }
    emittedRef.current = external;
    setCenter(external);
  }, [latitude, longitude]);

  useEffect(() => {
    if (findInMapTrigger === 0 || !position) return;
    setCenter(position);
    mapRef.current?.panTo(position);
    mapRef.current?.setZoom(MAP_GEOCODED_ZOOM);
  }, [findInMapTrigger, latitude, longitude]);

  function emitPosition(next: MapPosition): void {
    emittedRef.current = next;
    setCenter(next);
    onChange(formatCoordinate(next.lat), formatCoordinate(next.lng));
  }

  function handleAddressSelected(nextPosition: MapPosition): void {
    emitPosition(nextPosition);
    setNotice(null);
    mapRef.current?.setZoom(MAP_GEOCODED_ZOOM);
  }

  function handleClearLocation(): void {
    emittedRef.current = null;
    setAddress('');
    setCenter(MAP_DEFAULT_CENTER);
    onChange('', '');
  }

  function handleUseMyLocation(): void {
    setNotice(null);
    if (!('geolocation' in navigator)) {
      setNotice('This browser does not support location access.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (coords) => {
        emitPosition({ lat: coords.coords.latitude, lng: coords.coords.longitude });
        setLocating(false);
      },
      () => {
        setNotice('Your location could not be read. Check browser permissions.');
        setLocating(false);
      },
      GEOLOCATION_OPTIONS,
    );
  }

  return (
    <Stack spacing={1}>
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          height: MAP_POINT_PICKER_HEIGHT,
          border: '1px solid #e0e0e0',
          borderRadius: 1,
          overflow: 'hidden',
        }}
      >
        <GoogleMapView
          center={center}
          zoom={MAP_POINT_PICKER_ZOOM}
          height="100%"
          maxWidth="100%"
          markers={position ? [{ id: 'selected-position', position, draggable: true }] : []}
          onLoad={(map) => {
            mapRef.current = map;
          }}
          onUnmount={() => {
            mapRef.current = null;
          }}
          onMapClick={emitPosition}
          onMarkerDragEnd={(nextPosition) => emitPosition(nextPosition)}
        />
        {!position ? (
          <Typography
            variant="caption"
            sx={{
              position: 'absolute',
              bottom: 8,
              left: 8,
              bgcolor: 'rgba(255, 255, 255, 0.92)',
              px: 1,
              py: 0.5,
              borderRadius: 1,
            }}
          >
            Click the map to place the point.
          </Typography>
        ) : null}
      </Box>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <AddressAutocomplete
          value={address}
          isLoaded={isLoaded}
          onChange={setAddress}
          onLocationSelect={handleAddressSelected}
          label="Search"
          size="small"
          buttonVariant="outlined"
          containerSx={{ flex: '1 1 220px', minWidth: 0 }}
        />
        <Button
          type="button"
          variant="outlined"
          onClick={handleUseMyLocation}
          disabled={locating}
          startIcon={locating ? <CircularProgress size={14} /> : undefined}
        >
          GPS position
        </Button>
        {position ? (
          <Button type="button" variant="outlined" color="error" onClick={handleClearLocation}>
            Remove Marker
          </Button>
        ) : null}
        {notice ? (
          <Alert severity="info" onClose={() => setNotice(null)} sx={{ flexBasis: '100%' }}>
            {notice}
          </Alert>
        ) : null}
      </Stack>

      <Typography variant="caption">
        Click the map or drag the marker to set the coordinates, or type latitude and longitude
        directly in the fields above.
      </Typography>
    </Stack>
  );
}
