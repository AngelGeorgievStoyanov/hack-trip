'use client';

import { Box } from '@mui/material';
import { useAuth } from '@/hooks/useAuth';
import { ShareButton } from '@/components/social/ShareButton';
import { LikeButton } from '@/components/social/LikeButton';
import { FavoriteButton } from '@/components/social/FavoriteButton';
import { ReportButton } from '@/components/social/ReportButton';
import { SocialConfigStatus } from '@/components/social/SocialConfigStatus';
import { useSocialConfig } from '@/hooks/useSocialConfig';
import { isSocialOperationAllowed } from '@/lib/socialConfig';
import { absoluteUrl } from '@/config';
import type { TripPoint } from '@/types';

export function PointActions({ point }: { point: TripPoint }) {
  const { status } = useAuth();
  const socialConfig = useSocialConfig();
  const isAuthenticated = status === 'authenticated';
  const canLike = isSocialOperationAllowed(
    socialConfig.data,
    'like',
    'point',
    point.social.likedByMe ? 'delete' : 'create',
  );
  const canFavorite = isSocialOperationAllowed(
    socialConfig.data,
    'favorite',
    'point',
    point.social.favoritedByMe ? 'delete' : 'create',
  );
  const canReport = isSocialOperationAllowed(
    socialConfig.data,
    'report',
    'point',
    point.social.reportedByMe ? 'delete' : 'create',
  );

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.25, alignItems: 'center', my: 0 }}>
      <SocialConfigStatus isLoading={socialConfig.isLoading} error={socialConfig.error} />
      <ShareButton
        url={absoluteUrl(`/points/${point.id}`)}
        title={point.name}
        text={point.description ?? undefined}
      />
      {isAuthenticated && (canLike || canFavorite || canReport) ? (
        <>
          {canLike ? <LikeButton
            targetType="point"
            targetId={point.id}
            initialLiked={point.social.likedByMe}
            initialLikes={point.social.likes}
          /> : null}
          {canFavorite ? <FavoriteButton
            targetType="point"
            targetId={point.id}
            initialFavorited={point.social.favoritedByMe ?? false}
            initialFavorites={point.social.favorites ?? 0}
          /> : null}
          {canReport ? <ReportButton
            targetType="point"
            targetId={point.id}
            initialReported={point.social.reportedByMe}
            label="REPORT POINT"
          /> : null}
        </>
      ) : null}
    </Box>
  );
}
