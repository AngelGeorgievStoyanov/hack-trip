'use client';

import { useRef, useState } from 'react';
import { Alert, Box, Button, Stack, Typography } from '@mui/material';
import { AddressAutocomplete } from '@/components/maps/AddressAutocomplete';
import { GoogleMapView } from '@/components/maps/GoogleMapView';
import { useGoogleMapsLoader } from '@/hooks/useGoogleMapsLoader';
import {
  MAP_DEFAULT_CENTER,
  MAP_GEOCODED_ZOOM,
  MAP_POINT_PICKER_HEIGHT,
  MAP_POINT_PICKER_ZOOM,
} from '@/constants/maps';
import { formatCoordinate, type MapPosition } from '@/lib/maps';

interface TripLocationPickerProps {
  latitude: string;
  longitude: string;
  onChange: (latitude: string, longitude: string) => void;
}

export function TripLocationPicker({ latitude, longitude, onChange }: TripLocationPickerProps) {
  const { isLoaded } = useGoogleMapsLoader();
  const [center, setCenter] = useState<MapPosition>(() =>
    latitude !== '' && longitude !== ''
      ? { lat: Number(latitude), lng: Number(longitude) }
      : MAP_DEFAULT_CENTER,
  );
  const [address, setAddress] = useState('');
  const [notice, setNotice] = useState<string | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const position: MapPosition | null =
    latitude !== '' && longitude !== ''
      ? { lat: Number(latitude), lng: Number(longitude) }
      : null;

  function emitPosition(next: MapPosition): void {
    setCenter(next);
    onChange(formatCoordinate(next.lat), formatCoordinate(next.lng));
    setNotice(null);
  }

  function handleAddressSelected(nextPosition: MapPosition): void {
    emitPosition(nextPosition);
    mapRef.current?.setZoom(MAP_GEOCODED_ZOOM);
  }

  function handleClearMarker(): void {
    setCenter(MAP_DEFAULT_CENTER);
    setAddress('');
    setNotice(null);
    mapRef.current?.setCenter(MAP_DEFAULT_CENTER);
    mapRef.current?.setZoom(MAP_POINT_PICKER_ZOOM);
    onChange('', '');
  }

  return (
    <Stack spacing={1}>
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          height: MAP_POINT_PICKER_HEIGHT,
          border: '1px solid #e0e0e0',
          overflow: 'hidden',
        }}
      >
        <GoogleMapView
          center={center}
          zoom={MAP_POINT_PICKER_ZOOM}
          height="100%"
          maxWidth="100%"
          markers={position ? [{ id: 'trip-location', position, draggable: true, title: address || 'Trip location' }] : []}
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
            }}
          >
            Click the map to place a marker.
          </Typography>
        ) : null}
      </Box>

      <AddressAutocomplete
        value={address}
        isLoaded={isLoaded}
        onChange={setAddress}
        onLocationSelect={handleAddressSelected}
        label="Search field"
        size="medium"
        buttonVariant="contained"
        inputSx={{
      backgroundColor: '#f2f1e58f',
      borderRadius: '5px',
      m: '2px',
      '& .MuiInputBase-root': { color: '#222' },
      '& .MuiInputLabel-root': { color: '#333' },
      '& .MuiInputLabel-root.Mui-focused': { color: 'primary.main' },
      '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0, 0, 0, 0.35)' },
      '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0, 0, 0, 0.7)' },
      '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'primary.main' },
        }}
        buttonSx={{
          m: '2px',
          whiteSpace: 'nowrap',
          '&.Mui-disabled': {
            backgroundColor: 'primary.main',
            color: '#fff',
            opacity: 1,
          },
          ':hover': { background: '#4daf30' },
        }}
        containerSx={{ width: '100%' }}
      />

      {notice ? <Alert severity="info" onClose={() => setNotice(null)}>{notice}</Alert> : null}
    </Stack>
  );
}
