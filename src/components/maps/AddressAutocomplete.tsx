'use client';

import { useRef, useState, type ReactNode } from 'react';
import { Autocomplete } from '@react-google-maps/api';
import { Alert, Box, Button, CircularProgress, Stack, TextField } from '@mui/material';
import type { TextFieldProps } from '@mui/material/TextField';
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
  showSearchButton?: boolean;
  extraAction?: ReactNode;
  textFieldProps?: Omit<TextFieldProps, 'value' | 'onChange' | 'type'>;
}

const PLACE_FIELDS = ['geometry.location', 'formatted_address', 'name'];

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
  showSearchButton = true,
  extraAction,
  textFieldProps,
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

    const selectedName = place.name ?? place.formatted_address ?? value;
    onChange(selectedName);
    onLocationSelect(
      { lat: location.lat(), lng: location.lng() },
      selectedName,
    );
    setNotice(null);
  }

  const addressField = (
    <TextField
      {...textFieldProps}
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
    <Stack spacing={0.5} sx={containerSx}>
      <Stack
        direction={direction}
        spacing={0.5}
        alignItems="stretch"
        sx={{ width: '100%', minWidth: 0 }}
      >
        <Box sx={{ flex: '1 1 0', width: '100%', minWidth: 0, '& .MuiFormControl-root': { width: '100%' } }}>
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
        {showSearchButton ? (
          <Button
            type="button"
            variant={buttonVariant}
            onClick={() => void handleSearch()}
            disabled={searching || !isLoaded || value.trim().length < MAP_SEARCH_MIN_LENGTH}
            startIcon={searching ? <CircularProgress size={14} /> : undefined}
            sx={{
              flex: '0 1 auto',
              width: { xs: '100%', sm: 'auto' },
              minWidth: 0,
              whiteSpace: 'nowrap',
              ...((buttonSx ?? {}) as object),
            }}
          >
            Search
          </Button>
        ) : null}
        {extraAction ? (
          <Box sx={{ flex: '1 1 0', width: '100%', minWidth: 0, display: 'flex', '& > *': { width: '100%' } }}>
            {extraAction}
          </Box>
        ) : null}
      </Stack>
      {notice ? (
        <Alert severity="info" onClose={() => setNotice(null)}>
          {notice}
        </Alert>
      ) : null}
    </Stack>
  );
}
