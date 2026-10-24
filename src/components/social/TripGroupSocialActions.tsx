'use client';

import { useState } from 'react';
import { Badge, Box, IconButton, Tooltip } from '@mui/material';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ReportIcon from '@mui/icons-material/Report';
import ReportOffIcon from '@mui/icons-material/ReportOff';
import ShareIcon from '@mui/icons-material/Share';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import { absoluteUrl } from '@/config';
import { useAuth } from '@/hooks/useAuth';
import { useBackground } from '@/hooks/useBackground';
import { useTripGroupSocial } from '@/hooks/useTripGroup';
import { useSocialConfig } from '@/hooks/useSocialConfig';
import { getGenericErrorMessage } from '@/lib/errors';
import { isSocialOperationAllowed } from '@/lib/socialConfig';
import { resolveShareImage, shareWithFallback } from '@/lib/share';
import { SocialConfigStatus } from './SocialConfigStatus';
import { useLikeAnimation } from '@/components/social/LikeAnimation';
import type { SocialState } from '@/types';

interface TripGroupSocialActionsProps {
  tripGroupId: number;
  social: SocialState;
  shareTitle?: string;
  shareText?: string;
  shareImage?: string | null;
}

const BADGE_MAX = Number.MAX_SAFE_INTEGER;

export function TripGroupSocialActions({
  tripGroupId,
  social,
  shareTitle,
  shareText,
  shareImage,
}: TripGroupSocialActionsProps) {
  const [shareCopied, setShareCopied] = useState(false);
  const { likeMutation, favoriteMutation, reportActions } = useTripGroupSocial(tripGroupId, social);
  const { status } = useAuth();
  const isAuthenticated = status === 'authenticated';
  const socialConfig = useSocialConfig();
  const { currentUrl: backgroundUrl } = useBackground();

  const liked = social.likedByMe;
  const likes = social.likes;
  const favorited = social.favoritedByMe ?? false;
  const reported = social.reportedByMe;
  const likeAnimation = useLikeAnimation(liked, { failed: likeMutation.isError });

  const canLike = isSocialOperationAllowed(
    socialConfig.data,
    'like',
    'tripGroup',
    liked ? 'delete' : 'create',
  );
  const canFavorite = isSocialOperationAllowed(
    socialConfig.data,
    'favorite',
    'tripGroup',
    favorited ? 'delete' : 'create',
  );
  const canReport = isSocialOperationAllowed(
    socialConfig.data,
    'report',
    'tripGroup',
    reported ? 'delete' : 'create',
  );

  async function handleShare(): Promise<void> {
    const title = shareTitle ?? 'Trip';
    const image = resolveShareImage({ primary: shareImage, fallback: backgroundUrl });
    const result = await shareWithFallback({
      url: absoluteUrl(`/trips/${tripGroupId}`),
      title,
      text: shareText ?? title,
      image,
    });
    if (result === 'copied') {
      setShareCopied(true);
      window.setTimeout(() => setShareCopied(false), 2000);
    }
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25, flexWrap: 'wrap' }}>
      <SocialConfigStatus isLoading={socialConfig.isLoading} error={socialConfig.error} />
      {isAuthenticated && canLike ? (
        <Tooltip title={liked ? 'Unlike trip group' : 'Like trip group'} arrow>
          <span>
            <IconButton
              onClick={() => {
                likeAnimation.requestPlay();
                likeMutation.mutate();
              }}
              disabled={likeMutation.isPending}
              aria-label={liked ? `Unlike trip group (${likes} likes)` : `Like trip group (${likes} likes)`}
              aria-pressed={liked}
              color={liked ? 'primary' : 'default'}
            >
              <Badge badgeContent={likes} invisible={likes === 0} max={BADGE_MAX} color="primary">
                {liked ? (
                  <ThumbUpIcon sx={{ animation: likeAnimation.animation }} />
                ) : (
                  <ThumbUpOffAltIcon sx={{ animation: likeAnimation.animation }} />
                )}
              </Badge>
            </IconButton>
          </span>
        </Tooltip>
      ) : null}
      {isAuthenticated && canFavorite ? (
        <Tooltip title={favorited ? 'Remove trip group from favorites' : 'Add trip group to favorites'} arrow>
          <span>
            <IconButton
              onClick={() => favoriteMutation.mutate()}
              disabled={favoriteMutation.isPending}
              aria-label={favorited ? 'Remove trip group from favorites' : 'Add trip group to favorites'}
              aria-pressed={favorited}
              color={favorited ? 'error' : 'default'}
            >
              <Badge
                badgeContent={social.favorites ?? 0}
                invisible={(social.favorites ?? 0) === 0}
                max={BADGE_MAX}
                color="error"
              >
                {favorited ? <FavoriteIcon /> : <FavoriteBorderIcon />}
              </Badge>
            </IconButton>
          </span>
        </Tooltip>
      ) : null}
      {isAuthenticated && canReport ? (
        <Tooltip title={reported ? 'Withdraw trip group report' : 'Report trip group'} arrow>
          <span>
            <IconButton
              onClick={() => {
                if (reported) {
                  reportActions.unreport();
                } else {
                  reportActions.clearError();
                  reportActions.report();
                }
              }}
              disabled={reportActions.pending}
              aria-label={reported ? 'Withdraw trip group report' : 'Report trip group'}
              aria-pressed={reported}
              color={reported ? 'error' : 'default'}
            >
              {reported ? <ReportOffIcon /> : <ReportIcon />}
            </IconButton>
          </span>
        </Tooltip>
      ) : null}
      <Tooltip title={shareCopied ? 'Link copied' : 'Share trip group'} arrow>
        <IconButton onClick={() => void handleShare()} aria-label={shareCopied ? 'Link copied' : 'Share trip group'}>
          <ShareIcon />
        </IconButton>
      </Tooltip>
      {isAuthenticated && likeMutation.error ? (
        <span role="alert" style={{ color: 'red', fontSize: '0.75rem' }}>
          {getGenericErrorMessage(likeMutation.error)}
        </span>
      ) : null}
      {isAuthenticated && favoriteMutation.error ? (
        <span role="alert" style={{ color: 'red', fontSize: '0.75rem' }}>
          {getGenericErrorMessage(favoriteMutation.error)}
        </span>
      ) : null}
      {isAuthenticated && reportActions.error ? (
        <span role="alert" style={{ color: 'red', fontSize: '0.75rem' }}>
          {reportActions.error}
        </span>
      ) : null}
    </Box>
  );
}
