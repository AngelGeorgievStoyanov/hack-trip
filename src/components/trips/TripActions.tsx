'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Alert, Box, Button } from '@mui/material';
import { useAuth } from '@/hooks/useAuth';
import { useConfirm } from '@/components/common/ConfirmDialog';
import { tripApi } from '@/api/trips';
import { ShareButton } from '@/components/social/ShareButton';
import { tripRepresentativeImage } from '@/lib/images/representative';
import { absoluteUrl } from '@/config';
import { getGenericErrorMessage } from '@/lib/errors';
import { isModeratorUser } from '@/constants/roles';
import type { TripGroupDay, TripGroupResponse } from '@/types';

/** The trip page stays a Server Component; only these interactions run client-side. */
export function TripActions({
  tripGroup,
  day,
}: {
  tripGroup: TripGroupResponse;
  day: TripGroupDay;
}) {
  const { status, user } = useAuth();
  const { confirm } = useConfirm();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const isModerator = isModeratorUser(user);
  // Trip responses never expose an owner id, so ownership is derived from the authenticated
  // `GET /me/trips` result, which returns only the current user's owned trip groups.
  const { data: myTrips } = useQuery({
    queryKey: ['me', 'trips'],
    queryFn: () => tripApi.listMyTrips(),
    enabled: status === 'authenticated' && !isModerator,
  });
  const isOwner = myTrips?.some((group) => group.id === tripGroup.id) ?? false;
  const canManage = isOwner || isModerator;

  const deleteMutation = useMutation({
    mutationFn: () => tripApi.deleteTrip(tripGroup.id),
    onSuccess: () => {
      router.replace('/trips');
      router.refresh();
    },
    onError: (e) => setError(getGenericErrorMessage(e)),
  });

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center', my: 2 }}>
      <ShareButton
        url={absoluteUrl(`/trips/${tripGroup.id}`)}
        title={day.title ?? tripGroup.days[0]?.title ?? 'Trip'}
        text={day.description ?? undefined}
        image={tripRepresentativeImage(tripGroup)}
      />
      {canManage ? (
        <>
          <Link href={`/trips/${tripGroup.id}/edit`}>
            <Button variant="outlined">Edit</Button>
          </Link>
          <Button
            variant="outlined"
            color="error"
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
          >
            Delete
          </Button>
        </>
      ) : null}
      {error ? <Alert severity="error">{error}</Alert> : null}
    </Box>
  );
}