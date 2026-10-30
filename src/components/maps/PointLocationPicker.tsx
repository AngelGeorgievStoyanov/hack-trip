'use client';

import { useEffect, useRef, useState } from 'react';
import { AddressAutocomplete } from '@/components/maps/AddressAutocomplete';
import { GoogleMapView } from '@/components/maps/GoogleMapView';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Snackbar,
  Stack,
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
import { getPointNameFromMapAddress } from '@/lib/pointName';

interface PointLocationPickerProps {
  latitude: string;
  longitude: string;
  onChange: (latitude: string, longitude: string) => void;
  onAddressSelect?: (name: string) => void;
  findInMapTrigger?: number;
}

export function PointLocationPicker({
  latitude,
  longitude,
  onChange,
  onAddressSelect,
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

  function handleAddressSelected(nextPosition: MapPosition, selectedAddress: string): void {
    emitPosition(nextPosition);
    onAddressSelect?.(getPointNameFromMapAddress(selectedAddress));
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
      </Box>

      <Stack
        direction="row"
        spacing={1}
        sx={{
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-around',
          m: '10px',
          '@media (max-width:900px)': {
            flexDirection: 'column',
            alignItems: 'center',
          },
        }}
      >
        <AddressAutocomplete
          value={address}
          isLoaded={isLoaded}
          onChange={setAddress}
          onLocationSelect={handleAddressSelected}
          label="Search field"
          inputSx={{
            backgroundColor: '#f2f1e58f',
            borderRadius: '5px',
            m: '2px',
            maxWidth: '190px',
          }}
          size="small"
          buttonVariant="outlined"
          containerSx={{ flex: '1 1 190px', minWidth: 0, maxWidth: 190 }}
        />
        <Button
          type="button"
          variant="contained"
          onClick={handleClearLocation}
          sx={{ backgroundColor: 'rgb(194, 194, 224)', color: 'black', '&:hover': { color: 'rgb(248 245 245)' } }}
        >
          Remove Marker
        </Button>
        <Button
          type="button"
          variant="outlined"
          onClick={handleUseMyLocation}
          disabled={locating}
          startIcon={locating ? <CircularProgress size={14} /> : undefined}
        >
          Gps position
        </Button>

      </Stack>

      <Snackbar
        open={Boolean(notice)}
        autoHideDuration={10000}
        onClose={() => setNotice(null)}
        sx={{ position: 'relative', left: 0, right: 0 }}
      >
        <Alert onClose={() => setNotice(null)} severity="error">
          {notice}
        </Alert>
      </Snackbar>
    </Stack>
  );
}
