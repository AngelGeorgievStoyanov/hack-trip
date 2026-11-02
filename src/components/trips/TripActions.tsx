'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Alert, Box, Button } from '@mui/material';
import { useAuth } from '@/hooks/useAuth';
import { useConfirm } from '@/components/common/ConfirmDialog';
import { tripApi } from '@/api/trips';
import { getGenericErrorMessage } from '@/lib/errors';
import type { TripGroupResponse } from '@/types';

const LEGACY_BUTTON_SX = {
  ':hover': { background: '#4daf30' },
  padding: '10px 10px',
  margin: '5px',
};

/** Owner-only navigation and management actions for the selected trip group. */
export function TripActions({
  tripGroup,
  tripId,
  section,
}: {
  tripGroup: TripGroupResponse;
  tripId: number;
  section: 'navigation' | 'management';
}) {
  const { status } = useAuth();
  const { confirm } = useConfirm();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  // Trip responses do not expose an owner id. GET /me/trips returns only
  // trip groups owned by the authenticated user.
  const { data: myTrips } = useQuery({
    queryKey: ['me', 'trips'],
    queryFn: () => tripApi.listMyTrips(),
    enabled: status === 'authenticated',
  });
  const isOwner = myTrips?.some((group) => group.id === tripGroup.id) ?? false;

  const deleteMutation = useMutation({
    mutationFn: () => tripApi.deleteTrip(tripGroup.id),
    onSuccess: () => {
      router.replace('/trips');
      router.refresh();
    },
    onError: (e) => setError(getGenericErrorMessage(e)),
  });

  if (!isOwner && !error) {
    return null;
  }

  if (section === 'navigation') {
    if (!isOwner) return null;

    return (
      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
        <Button
          component={Link}
          href={`/trips/create?tripGroupId=${tripGroup.id}`}
          variant="contained"
          sx={LEGACY_BUTTON_SX}
        >
          ADD NEXT DAY TRIP
        </Button>
        <Button
          component={Link}
          href={`/trips/create/points?tripGroupId=${tripGroup.id}&tripId=${tripId}`}
          variant="contained"
          sx={LEGACY_BUTTON_SX}
        >
          ADD OR EDIT POINTS FOR YOUR TRIP
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
      {isOwner ? (
        <>
          <Button
            component={Link}
            href={`/trips/${tripGroup.id}/edit`}
            variant="contained"
            sx={LEGACY_BUTTON_SX}
          >
            EDIT TRIP
          </Button>
          <Button
            variant="contained"
            onClick={() =>
              void confirm('Are you sure you want to delete this trip?', 'Delete Confirmation').then(
                (confirmed) => {
                  if (confirmed) {
                    deleteMutation.mutate();
                  }
                },
              )
            }
            disabled={deleteMutation.isPending}
            sx={{
              ':hover': { background: '#ef0a0a' },
              margin: '5px',
            }}
          >
            DELETE TRIP
          </Button>
        </>
      ) : null}
      {error ? <Alert severity="error">{error}</Alert> : null}
    </Box>
  );
}
