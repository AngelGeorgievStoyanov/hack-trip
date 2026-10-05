'use client';

import { Box } from '@mui/material';
import { useAuth } from '@/hooks/useAuth';
import { ShareButton } from '@/components/social/ShareButton';
import { LikeButton } from '@/components/social/LikeButton';
import { ReportButton } from '@/components/social/ReportButton';
import { absoluteUrl } from '@/config';
import type { TripPoint } from '@/types';

export function PointActions({ point }: { point: TripPoint }) {
  const { status } = useAuth();
  const isAuthenticated = status === 'authenticated';

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center', my: 2 }}>
      <ShareButton
        url={absoluteUrl(`/points/${point.id}`)}
        title={point.title}
        text={point.description ?? undefined}
      />
      {isAuthenticated ? (
        <>
          <LikeButton
            targetType="point"
            targetId={point.id}
            initialLiked={point.social.likedByMe}
            initialLikes={point.social.likes}
          />
          <ReportButton targetType="point" targetId={point.id} />
        </>
      ) : null}
    </Box>
  );
}
