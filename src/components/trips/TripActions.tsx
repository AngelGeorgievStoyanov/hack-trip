'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useMutation } from '@tanstack/react-query';
import { Alert, Box, Button } from '@mui/material';
import { useAuth } from '@/hooks/useAuth';
import { useConfirm } from '@/components/common/ConfirmDialog';
import { tripApi } from '@/api/trips';
import { ShareButton } from '@/components/social/ShareButton';
import { tripRepresentativeImage } from '@/lib/images/representative';
import { LikeButton } from '@/components/social/LikeButton';
import { FavoriteButton } from '@/components/social/FavoriteButton';
import { ReportButton } from '@/components/social/ReportButton';
import { absoluteUrl } from '@/config';
import { getGenericErrorMessage } from '@/lib/errors';
import { ROLES } from '@/constants/roles';
import type { TripDetails } from '@/types';

/** The trip page stays a Server Component; only these interactions run client-side. */
export function TripActions({ trip }: { trip: TripDetails }) {
  const { status, user } = useAuth();
  const { confirm } = useConfirm();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = status === 'authenticated';
  const isOwner = user !== null && user.id === trip.author.id;
  const isModerator = user !== null && (user.role === ROLES.admin || user.role === ROLES.manager);
  const canManage = isOwner || isModerator;

  const deleteMutation = useMutation({
    mutationFn: () => tripApi.deleteTrip(trip.id),
    onSuccess: () => {
      router.replace('/trips');
      router.refresh();
    },
    onError: (e) => setError(getGenericErrorMessage(e)),
  });

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center', my: 2 }}>
      <ShareButton
        url={absoluteUrl(`/trips/${trip.id}`)}
        title={trip.title}
        text={trip.description ?? undefined}
        image={tripRepresentativeImage(trip)}
      />
      {isAuthenticated ? (
        <>
          <LikeButton
            targetType="tripgroup"
            targetId={trip.id}
            initialLiked={trip.social.likedByMe}
            initialLikes={trip.social.likes}
          />
          <FavoriteButton
            tripGroupId={trip.id}
            initialFavorited={trip.social.favoritedByMe ?? false}
            initialFavorites={trip.social.favorites ?? 0}
          />
          <ReportButton targetType="tripgroup" targetId={trip.id} />
        </>
      ) : null}
      {canManage ? (
        <>
          <Link href={`/trips/${trip.id}/edit`}>
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
