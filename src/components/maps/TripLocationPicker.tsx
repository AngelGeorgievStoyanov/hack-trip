'use client';

import { useRef, useState } from 'react';
import { Autocomplete } from '@react-google-maps/api';
import { Alert, Box, Button, CircularProgress, Stack, TextField, Typography } from '@mui/material';
import { GoogleMapView } from '@/components/maps/GoogleMapView';
import { useGoogleMapsLoader } from '@/hooks/useGoogleMapsLoader';
import {
  MAP_DEFAULT_CENTER,
  MAP_GEOCODED_ZOOM,
  MAP_POINT_PICKER_HEIGHT,
  MAP_POINT_PICKER_ZOOM,
  MAP_SEARCH_MIN_LENGTH,
} from '@/constants/maps';
import { formatCoordinate, type MapPosition } from '@/lib/maps';

interface TripLocationPickerProps {
  latitude: string;
  longitude: string;
  onChange: (latitude: string, longitude: string) => void;
}

const PLACE_FIELDS = ['geometry.location', 'formatted_address'];

export function TripLocationPicker({ latitude, longitude, onChange }: TripLocationPickerProps) {
  const { isLoaded } = useGoogleMapsLoader();
  const [center, setCenter] = useState<MapPosition>(() =>
    latitude !== '' && longitude !== ''
      ? { lat: Number(latitude), lng: Number(longitude) }
      : MAP_DEFAULT_CENTER,
  );
  const [address, setAddress] = useState('');
  const [searching, setSearching] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const position: MapPosition | null =
    latitude !== '' && longitude !== ''
      ? { lat: Number(latitude), lng: Number(longitude) }
      : null;
  const supportsAutocomplete =
    isLoaded && typeof google.maps.places?.Autocomplete === 'function';

  function emitPosition(next: MapPosition): void {
    setCenter(next);
    onChange(formatCoordinate(next.lat), formatCoordinate(next.lng));
    setNotice(null);
  }

  async function handleSearch(): Promise<void> {
    const query = address.trim();
    if (query.length < MAP_SEARCH_MIN_LENGTH) {
      setNotice('Enter a location to search.');
      return;
    }
    setSearching(true);
    setNotice(null);
    try {
      const response = await new google.maps.Geocoder().geocode({ address: query });
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
    const place = autocompleteRef.current?.getPlace();
    const location = place?.geometry?.location;
    if (!location) {
      void handleSearch();
      return;
    }
    emitPosition({ lat: location.lat(), lng: location.lng() });
    setAddress(place?.formatted_address ?? address);
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

  const addressField = (
    <TextField
      fullWidth
      label="Search field"
      type="search"
      value={address}
      onChange={(event) => setAddress(event.target.value)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' && !supportsAutocomplete) {
          event.preventDefault();
          void handleSearch();
        }
      }}
      sx={{
        backgroundColor: '#f2f1e58f',
        borderRadius: '5px',
        m: '2px',
        '& .MuiInputBase-root': {
          color: '#222',
        },
        '& .MuiInputLabel-root': {
          color: '#333',
        },
        '& .MuiInputLabel-root.Mui-focused': {
          color: 'primary.main',
        },
        '& .MuiOutlinedInput-notchedOutline': {
          borderColor: 'rgba(0, 0, 0, 0.35)',
        },
        '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
          borderColor: 'rgba(0, 0, 0, 0.7)',
        },
        '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
          borderColor: 'primary.main',
        },
      }}
    />
  );

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

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1}>
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
          ) : addressField}
        </Box>
        <Button
          type="button"
          variant="contained"
          onClick={() => void handleSearch()}
          disabled={searching || !isLoaded || address.trim().length < MAP_SEARCH_MIN_LENGTH}
          startIcon={searching ? <CircularProgress size={14} /> : undefined}
          sx={{
            m: '2px',
            whiteSpace: 'nowrap',
            '&.Mui-disabled': {
              backgroundColor: 'primary.main',
              color: '#fff',
              opacity: 1,
            },
            ':hover': { background: '#4daf30' },
          }}
        >
          Search
        </Button>
        <Button
          type="button"
          variant="contained"
          onClick={handleClearMarker}
          disabled={!position}
          sx={{
            m: '2px',
            whiteSpace: 'nowrap',
            background: 'rgb(194, 194, 224)',
            color: 'black',
            '&.Mui-disabled': {
              backgroundColor: 'rgb(194, 194, 224)',
              color: 'black',
              opacity: 1,
            },
            ':hover': {
              color: 'rgb(248, 245, 245)',
            },
          }}
        >
          Remove Marker
        </Button>
      </Stack>

      {notice ? <Alert severity="info" onClose={() => setNotice(null)}>{notice}</Alert> : null}
    </Stack>
  );
}
