'use client';

import { useEffect, useRef, useState } from 'react';
import { Autocomplete, GoogleMap, MarkerF } from '@react-google-maps/api';
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
  MAP_DEFAULT_ZOOM,
  MAP_GEOCODED_ZOOM,
  MAP_POINT_PICKER_HEIGHT,
  MAP_SEARCH_MIN_LENGTH,
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
}

const PLACE_FIELDS = ['geometry.location', 'formatted_address'];

export function PointLocationPicker({
  latitude,
  longitude,
  onChange,
}: PointLocationPickerProps) {
  const { isLoaded } = useGoogleMapsLoader();
  const [center, setCenter] = useState<MapPosition>(
    () => coordinatePairToMapPosition(latitude, longitude) ?? MAP_DEFAULT_CENTER,
  );
  const [address, setAddress] = useState('');
  const [searching, setSearching] = useState(false);
  const [locating, setLocating] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const emittedRef = useRef<MapPosition | null>(
    coordinatePairToMapPosition(latitude, longitude),
  );
  const mapRef = useRef<google.maps.Map | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const position = coordinatePairToMapPosition(latitude, longitude);
  const supportsAutocomplete =
    isLoaded && typeof google.maps.places?.Autocomplete === 'function';

  useEffect(() => {
    const external = coordinatePairToMapPosition(latitude, longitude);
    if (!external || sameMapPosition(external, emittedRef.current)) {
      return;
    }
    emittedRef.current = external;
    setCenter(external);
  }, [latitude, longitude]);

  function emitPosition(next: MapPosition): void {
    emittedRef.current = next;
    setCenter(next);
    onChange(formatCoordinate(next.lat), formatCoordinate(next.lng));
  }

  async function handleSearch(): Promise<void> {
    const query = address.trim();
    if (query.length < MAP_SEARCH_MIN_LENGTH) {
      return;
    }
    setSearching(true);
    setNotice(null);
    try {
      const geocoder = new google.maps.Geocoder();
      const response = await geocoder.geocode({ address: query });
      const match = response.results[0];
      if (!match) {
        setNotice('No address matched that search.');
        return;
      }
      const location = match.geometry.location;
      emitPosition({ lat: location.lat(), lng: location.lng() });
      setAddress(match.formatted_address);
      mapRef.current?.setZoom(MAP_GEOCODED_ZOOM);
    } catch {
      setNotice('Address search is unavailable right now.');
    } finally {
      setSearching(false);
    }
  }

  function handlePlaceChanged(): void {
    const location = autocompleteRef.current?.getPlace()?.geometry?.location;
    if (location) {
      emitPosition({ lat: location.lat(), lng: location.lng() });
      setAddress(autocompleteRef.current?.getPlace()?.formatted_address ?? address);
      mapRef.current?.setZoom(MAP_GEOCODED_ZOOM);
      return;
    }
    // The user pressed Enter without picking a suggestion, so fall back to geocoding.
    void handleSearch();
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

  const addressField = (
    <TextField
      size="small"
      fullWidth
      label="Search address"
      value={address}
      onChange={(event) => setAddress(event.target.value)}
      onKeyDown={
        supportsAutocomplete
          ? undefined
          : (event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                void handleSearch();
              }
            }
      }
    />
  );

  return (
    <Stack spacing={1}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {supportsAutocomplete ? (
            <Autocomplete
              fields={PLACE_FIELDS}
              onLoad={(autocomplete) => {
                autocompleteRef.current = autocomplete;
              }}
              onUnmount={() => {
                autocompleteRef.current = null;
              }}
              onPlaceChanged={handlePlaceChanged}
            >
              {addressField}
            </Autocomplete>
          ) : (
            addressField
          )}
        </Box>
        <Button
          type="button"
          variant="outlined"
          onClick={() => void handleSearch()}
          disabled={searching || !isLoaded || address.trim().length < MAP_SEARCH_MIN_LENGTH}
          startIcon={searching ? <CircularProgress size={14} /> : undefined}
        >
          Search
        </Button>
        <Button
          type="button"
          variant="outlined"
          onClick={handleUseMyLocation}
          disabled={locating}
          startIcon={locating ? <CircularProgress size={14} /> : undefined}
        >
          My location
        </Button>
      </Stack>

      {notice ? (
        <Alert severity="info" onClose={() => setNotice(null)}>
          {notice}
        </Alert>
      ) : null}

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
        {isLoaded ? (
          <GoogleMap
            mapContainerStyle={{ width: '100%', height: '100%' }}
            center={center}
            zoom={MAP_DEFAULT_ZOOM}
            onLoad={(map) => {
              mapRef.current = map;
            }}
            onUnmount={() => {
              mapRef.current = null;
            }}
            onClick={(event) => {
              if (event.latLng) {
                emitPosition({ lat: event.latLng.lat(), lng: event.latLng.lng() });
              }
            }}
          >
            {position ? (
              <MarkerF
                position={position}
                draggable
                onDragEnd={(event) => {
                  if (event.latLng) {
                    emitPosition({ lat: event.latLng.lat(), lng: event.latLng.lng() });
                  }
                }}
              />
            ) : null}
          </GoogleMap>
        ) : (
          <Box sx={{ display: 'grid', placeItems: 'center', width: '100%', height: '100%' }}>
            <CircularProgress size={28} />
          </Box>
        )}
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

      <Typography variant="caption">
        Click the map or drag the marker to set the coordinates, or type latitude and longitude
        directly in the fields above.
      </Typography>
    </Stack>
  );
}
