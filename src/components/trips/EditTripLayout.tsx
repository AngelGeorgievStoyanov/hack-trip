'use client';

import { useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Button, TextField, Typography } from '@mui/material';
import { AppImage } from '@/components/images/AppImage';
import { TripLocationPicker } from '@/components/maps/TripLocationPicker';
import type { TripGroupResponse, TripGroupDay } from '@/types';

interface EditTripLayoutProps {
  trip: TripGroupResponse;
  children: ReactNode;
  selectedDayId?: number;
}

function ReadOnlyField({ label, value, multiline = false }: {
  label: string;
  value: string;
  multiline?: boolean;
}) {
  return (
    <TextField
      label={label}
      value={value}
      multiline={multiline}
      minRows={multiline ? 4 : undefined}
      fullWidth
      InputProps={{ readOnly: true }}
      InputLabelProps={{ shrink: true }}
    />
  );
}

function formatPrice(day: TripGroupDay): string {
  if (day.price == null) return '';
  return day.currency?.code ? `${day.price} ${day.currency.code}` : String(day.price);
}

/**
 * Legacy-inspired visual shell for Edit Trip.
 * The current API does not expose a trip-group metadata update endpoint, so the
 * overview fields and map are intentionally presentation-only until that contract exists.
 */
export function EditTripLayout({ trip, children, selectedDayId }: EditTripLayoutProps) {
  const router = useRouter();
  const selectedDay = trip.days.find((day) => day.id === selectedDayId) ?? trip.days[0];
  const [latitude, setLatitude] = useState(() => {
    const value = selectedDay?.lat;
    return value == null ? '' : String(value);
  });
  const [longitude, setLongitude] = useState(() => {
    const value = selectedDay?.lng;
    return value == null ? '' : String(value);
  });

  const firstDay = selectedDay;
  const images = firstDay?.images ?? [];

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: 1440,
        mx: 'auto',
        px: { xs: 1, sm: 2 },
        py: { xs: 2, sm: 2 },
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
      }}
    >
      <Box sx={{ width: '100%', maxWidth: 1100 }}>
        <TripLocationPicker
          latitude={latitude}
          longitude={longitude}
          onChange={(nextLatitude, nextLongitude) => {
            setLatitude(nextLatitude);
            setLongitude(nextLongitude);
          }}
        />
      </Box>

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'flex-start',
          gap: 2,
          width: '100%',
          '@media (max-width: 1120px)': {
            flexDirection: 'column-reverse',
            alignItems: 'center',
          },
        }}
      >
        <Box
          component="section"
          sx={{
            boxSizing: 'border-box',
            m: { xs: 0, sm: 2 },
            p: { xs: 2, sm: '30px' },
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            width: 'min(100%, 520px)',
            flex: '0 1 520px',
            minWidth: 0,
            height: 'fit-content',
            backgroundColor: '#eee7e79e',
            boxShadow: '3px 2px 5px black',
            border: '1px solid',
            borderRadius: 0,
            '& .MuiFormControl-root': { my: 0.5, width: '100%' },
          }}
        >
          <Typography
            component="h1"
            variant="h5"
            sx={{ m: '10px auto', textTransform: 'uppercase', textAlign: 'center' }}
          >
            EDIT TRIP
          </Typography>

          {firstDay ? (
            <>
              <ReadOnlyField label="DAY" value={String(firstDay.dayNumber)} />
              <ReadOnlyField label="TITLE" value={firstDay.title ?? ''} />
              <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <ReadOnlyField label="PRICE" value={formatPrice(firstDay)} />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <ReadOnlyField label="CURRENCY" value={firstDay.currency?.code ?? ''} />
                </Box>
              </Box>
              <ReadOnlyField label="TRANSPORT" value={firstDay.transport?.name ?? ''} />
              <ReadOnlyField label="COUNT OF PEOPLE" value={String(firstDay.countPeoples)} />
              <ReadOnlyField label="TYPE OF THE GROUP" value={firstDay.group?.name ?? ''} />
              <ReadOnlyField label="DESTINATION" value={firstDay.destination ?? ''} />
              <ReadOnlyField label="DESCRIPTION" value={firstDay.description ?? ''} multiline />
            </>
          ) : (
            <Typography>No trip days found.</Typography>
          )}

          <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 1, mt: 1 }}>
            <Button variant="contained" disabled sx={{ minWidth: 180, ':hover': { background: '#4daf30' } }}>
              EDIT YOUR TRIP
            </Button>
            <Button
              variant="contained"
              onClick={() => router.back()}
              sx={{
                minWidth: 120,
                background: 'rgb(194 194 224)',
                color: 'black',
                ':hover': { color: 'rgb(248 245 245)', background: 'rgb(194 194 224)' },
              }}
            >
              BACK
            </Button>
          </Box>
        </Box>

        <Box
          component="section"
          sx={{
            boxSizing: 'border-box',
            width: 'min(100%, 520px)',
            flex: '0 1 520px',
            minWidth: 0,
            m: { xs: 0, sm: 2 },
            p: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {images.length > 0 ? (
            <Box
              sx={{
                display: 'grid',
                width: '100%',
                gridTemplateColumns: `repeat(${images.length > 3 ? 3 : images.length}, minmax(0, 1fr))`,
                gap: 1,
              }}
            >
              {images.map((image) => (
                <Box
                  key={image.id}
                  sx={{
                    position: 'relative',
                    width: '100%',
                    aspectRatio: '1 / 1',
                    overflow: 'hidden',
                    border: '1px solid rgba(0, 0, 0, 0.2)',
                    p: 0.5,
                  }}
                >
                  <AppImage
                    image={image}
                    alt={firstDay?.title ?? 'Trip image'}
                    fill
                    sizes="(max-width: 600px) 33vw, 170px"
                  />
                </Box>
              ))}
            </Box>
          ) : (
            <Typography
              variant="h6"
              sx={{ m: 2, maxWidth: '95%', textAlign: 'center', textTransform: 'uppercase' }}
            >
              FOR THIS TRIP DON'T HAVE IMAGES
            </Typography>
          )}
        </Box>
      </Box>

      <Box sx={{ width: '100%', maxWidth: 1100 }}>
        {children}
      </Box>
    </Box>
  );
}
