'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Alert, Box, Button, CircularProgress, Container, Typography } from '@mui/material';
import { tripApi } from '@/api/trips';
import { TripList } from '@/components/trips/TripList';
import { getGenericErrorMessage } from '@/lib/errors';
import { headingTextStyle } from '@/constants/ui';

/**
 * Transparent full-width container. The backend background image is loaded once globally
 * (`BackgroundProvider`) and painted as a fixed cover/center layer, so the page must not
 * paint its own background or any opaque color that would cover it.
 */
const PAGE_SX = { width: '100%' } as const;

const CONTENT_SX = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  py: { xs: 3, md: 5 },
} as const;

const HEADING_SX = {
  textAlign: 'center',
  mb: { xs: 2, md: 3 },
  ...headingTextStyle,
} as const;

const EMPTY_STATE_SX = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  gap: 3,
  py: { xs: 6, md: 10 },
} as const;

/** Legacy empty-state CTA: near-black button that inverts to white on hover. */
const CREATE_TRIP_BUTTON_SX = {
  backgroundColor: '#0e0d0d',
  color: '#f3eeee',
  px: 4,
  ':hover': { backgroundColor: '#f3eeee', color: '#0e0d0d' },
} as const;

export default function MyTripsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['me', 'trips'],
    queryFn: () => tripApi.listMyTrips(),
  });

  const trips = data ?? [];

  return (
    <Box component="section" sx={PAGE_SX}>
      <Container maxWidth="lg" sx={CONTENT_SX}>
        <Typography variant="h4" component="h1" sx={HEADING_SX}>
          These are your trips
        </Typography>

        {isLoading ? (
          <CircularProgress size={32} sx={{ my: 4 }} aria-label="Loading your trips" />
        ) : error ? (
          <Alert severity="error" sx={{ width: '100%', maxWidth: 560 }}>
            {getGenericErrorMessage(error)}
          </Alert>
        ) : trips.length === 0 ? (
          <Box sx={EMPTY_STATE_SX}>
            <Typography variant="h5" component="p" sx={headingTextStyle}>
              You dont&apos;t have a published trip yet.
            </Typography>
            <Button
              component={Link}
              href="/trips/create"
              variant="contained"
              sx={CREATE_TRIP_BUTTON_SX}
            >
              CLICK HERE AN ADD YOUR FIRST TRIP
            </Button>
          </Box>
        ) : (
          <TripList trips={trips} />
        )}
      </Container>
    </Box>
  );
}
