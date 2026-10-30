'use client';

import { useRef, useState } from 'react';
import { Autocomplete } from '@react-google-maps/api';
import { Alert, Box, Button, CircularProgress, Stack, TextField } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';
import type { StackProps } from '@mui/material/Stack';
import { MAP_SEARCH_MIN_LENGTH } from '@/constants/maps';
import type { MapPosition } from '@/lib/maps';

interface AddressAutocompleteProps {
  value: string;
  isLoaded: boolean;
  onChange: (value: string) => void;
  onLocationSelect: (position: MapPosition, address: string) => void;
  label?: string;
  size?: 'small' | 'medium';
  buttonVariant?: 'text' | 'outlined' | 'contained';
  inputSx?: SxProps<Theme>;
  buttonSx?: SxProps<Theme>;
  containerSx?: SxProps<Theme>;
  direction?: StackProps['direction'];
}

const PLACE_FIELDS = ['geometry.location', 'formatted_address'];

export function AddressAutocomplete({
  value,
  isLoaded,
  onChange,
  onLocationSelect,
  label = 'Search address',
  size = 'small',
  buttonVariant = 'outlined',
  inputSx,
  buttonSx,
  containerSx,
  direction = { xs: 'column', sm: 'row' },
}: AddressAutocompleteProps) {
  const [searching, setSearching] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const supportsAutocomplete =
    isLoaded && typeof google.maps.places?.Autocomplete === 'function';

  async function handleSearch(): Promise<void> {
    const query = value.trim();
    if (query.length < MAP_SEARCH_MIN_LENGTH || !isLoaded) {
      if (query.length < MAP_SEARCH_MIN_LENGTH) {
        setNotice('Enter a location to search.');
      }
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
      const formattedAddress = match.formatted_address;
      onChange(formattedAddress);
      onLocationSelect(
        { lat: location.lat(), lng: location.lng() },
        formattedAddress,
      );
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

    const formattedAddress = place.formatted_address ?? value;
    onChange(formattedAddress);
    onLocationSelect(
      { lat: location.lat(), lng: location.lng() },
      formattedAddress,
    );
    setNotice(null);
  }

  const addressField = (
    <TextField
      size={size}
      fullWidth
      label={label}
      type="search"
      value={value}
      onChange={(event) => onChange(event.target.value)}
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
      sx={inputSx}
    />
  );

  return (
    <Stack spacing={1} sx={containerSx}>
      <Stack direction={direction} spacing={1} alignItems="stretch">
        <Box sx={{ flex: '1 1 220px', minWidth: 0 }}>
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
          variant={buttonVariant}
          onClick={() => void handleSearch()}
          disabled={searching || !isLoaded || value.trim().length < MAP_SEARCH_MIN_LENGTH}
          startIcon={searching ? <CircularProgress size={14} /> : undefined}
          sx={buttonSx ?? { whiteSpace: 'nowrap' }}
        >
          Search
        </Button>
      </Stack>
      {notice ? (
        <Alert severity="info" onClose={() => setNotice(null)}>
          {notice}
        </Alert>
      ) : null}
    </Stack>
  );
}
