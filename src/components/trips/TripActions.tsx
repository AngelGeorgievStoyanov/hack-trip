'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Box, Button } from '@mui/material';
import { useAuth } from '@/hooks/useAuth';
import { useConfirm } from '@/components/common/ConfirmDialog';
import { tripApi } from '@/api/trips';
import { getGenericErrorMessage } from '@/lib/errors';
import type { TripGroupResponse } from '@/types';
import { tripGroupKeys } from '@/hooks/useTripGroup';
import { useNotification } from '@/components/common/NotificationProvider';

const LEGACY_BUTTON_SX = {
  ':hover': { background: '#4daf30' },
  padding: '10px',
  width: '100%',
  minHeight: '48px',
  boxSizing: 'border-box',
};

const ACTION_BUTTON_BOX_SX = {
  display: 'contents',
};

/** Owner-only navigation and management actions for the selected trip group. */
export function TripActions({
  tripGroup,
  tripId,
  section,
  onDayDeleted,
}: {
  tripGroup: TripGroupResponse;
  tripId: number;
  section: 'navigation' | 'management';
  onDayDeleted?: (updatedTripGroup: TripGroupResponse) => void;
}) {
  const { status, viewerCacheKey } = useAuth();
  const queryClient = useQueryClient();
  const { confirm } = useConfirm();
  const router = useRouter();
  const notification = useNotification();

  // Trip responses do not expose an owner id. GET /me/trips returns only
  // trip groups owned by the authenticated user.
  const { data: myTrips } = useQuery({
    queryKey: ['me', 'trips'],
    queryFn: () => tripApi.listMyTrips(),
    enabled: status === 'authenticated',
  });
  const isOwner = myTrips?.some((group) => group.id === tripGroup.id) ?? false;
  const selectedDay = tripGroup.days.find((day) => day.id === tripId);

  const deleteMutation = useMutation({
    mutationFn: () => tripApi.deleteTrip(tripGroup.id),
    onSuccess: () => {
      router.replace('/trips');
      router.refresh();
    },
    onError: (e) => notification.error(getGenericErrorMessage(e)),
  });

  const deleteDayMutation = useMutation({
    mutationFn: () => tripApi.deleteDay(tripGroup.id, tripId),
    onSuccess: (updatedTripGroup) => {
      queryClient.setQueryData(
        tripGroupKeys.detail(tripGroup.id, viewerCacheKey),
        updatedTripGroup,
      );
      onDayDeleted?.(updatedTripGroup);
    },
    onError: (e) => notification.error(getGenericErrorMessage(e)),
  });

  if (!isOwner) {
    return null;
  }

  if (section === 'navigation') {

    return (
      <Box sx={ACTION_BUTTON_BOX_SX}>
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
    <Box sx={ACTION_BUTTON_BOX_SX}>
      {isOwner ? (
        <>
          {selectedDay ? (
            <Button
              component={Link}
              href={`/trips/${tripGroup.id}/edit?dayId=${selectedDay.id}`}
              variant="contained"
              sx={LEGACY_BUTTON_SX}
            >
              EDIT DAY {selectedDay.dayNumber}
            </Button>
          ) : null}
          {tripGroup.days.length > 1 ? (
            <Button
              variant="contained"
              onClick={() =>
                void confirm(
                  `Are you sure you want to delete Day ${selectedDay?.dayNumber ?? ''}, including its points, photos, comments, likes, reports and favorites?`,
                  'Delete Day Confirmation',
                ).then((confirmed) => {
                  if (confirmed) {
                    deleteDayMutation.mutate();
                  }
                })
              }
              disabled={deleteDayMutation.isPending}
              sx={{
                ':hover': { background: '#ef0a0a' },
                padding: '10px',
                width: '100%',
                minHeight: '48px',
                boxSizing: 'border-box',
              }}
            >
              DELETE DAY {selectedDay?.dayNumber}
            </Button>
          ) : null}
          <Button
            variant="contained"
            onClick={() =>
              void confirm(
                'Are you sure you want to delete this trip, including all its days, points, photos and social activity?',
                'Delete Trip Confirmation',
              ).then((confirmed) => {
                if (confirmed) {
                  deleteMutation.mutate();
                }
              })
            }
            disabled={deleteMutation.isPending}
            sx={{
              ':hover': { background: '#ef0a0a' },
              padding: '10px',
              width: '100%',
              minHeight: '48px',
              boxSizing: 'border-box',
            }}
          >
            DELETE TRIP
          </Button>
        </>
      ) : null}
    </Box>
  );
}
