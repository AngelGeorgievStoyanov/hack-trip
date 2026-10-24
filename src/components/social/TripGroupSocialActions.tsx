'use client';

import { Tooltip, IconButton } from '@mui/material';
import { useState } from 'react';
import { absoluteUrl } from '@/config';
import { useAuth } from '@/hooks/useAuth';
import { useBackground } from '@/hooks/useBackground';
import { useTripGroupSocial } from '@/hooks/useTripGroup';
import { useSocialConfig } from '@/hooks/useSocialConfig';
import { getGenericErrorMessage } from '@/lib/errors';
import { isSocialOperationAllowed, socialConfigTargetKey } from '@/lib/socialConfig';
import { resolveShareImage, shareWithFallback } from '@/lib/share';
import { SocialConfigStatus } from './SocialConfigStatus';
import { ReportButton } from './ReportButton';
import BookmarkAddIcon from '@mui/icons-material/BookmarkAdd';
import BookmarkRemoveIcon from '@mui/icons-material/BookmarkRemove';
import ReportIcon from '@mui/icons-material/Report';
import ReportOffIcon from '@mui/icons-material/ReportOff';
import ShareIcon from '@mui/icons-material/Share';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import { useLikeAnimation } from '@/components/social/LikeAnimation';
import type { SocialState } from '@/types';

interface TripGroupSocialActionsProps {
  tripGroupId: number;
  /**
   * Current trip-group social state. It comes straight from the API response, which is the
   * only source of truth for the rendered icons (the backend reports the viewer's own
   * `likedByMe` / `favoritedByMe` / `reportedByMe`).
   */
  social: SocialState;
  /**
   * Which actions to render. `'all'` (default) keeps the original combined bar.
   * `'favorite'` renders only the Favorite action; `'like-report'` renders only
   * Like (with likes count) and Report — used to restore the legacy TripDetails
   * placement (Favorite beside the title, Like/Report in a bottom row).
   */
  variant?: 'all' | 'favorite' | 'like-report';
  /** Trip title for the Share action; falls back to `'Trip'`. */
  shareTitle?: string;
  /** Optional longer share text (the day description). */
  shareText?: string;
  /** Primary share image (the trip's representative image). */
  shareImage?: string | null;
  dayReportTarget?: { id: number; social: SocialState };
}

export function TripGroupSocialActions({
  tripGroupId,
  social,
  variant = 'all',
  shareTitle,
  shareText,
  shareImage,
  dayReportTarget,
}: TripGroupSocialActionsProps) {
  const [shareCopied, setShareCopied] = useState(false);

  const { likeMutation, favoriteMutation, reportActions } = useTripGroupSocial(tripGroupId, social);

  const liked = social.likedByMe;
  const likes = social.likes;
  const favorited = social.favoritedByMe ?? false;
  const reported = social.reportedByMe;

  // The animation follows the like state, so it plays exactly when a real like/unlike
  // action changed the state - never on the first render and never on a failed request.
  const likeAnimation = useLikeAnimation(liked, { failed: likeMutation.isError });

  const { status } = useAuth();
  const isAuthenticated = status === 'authenticated';
  const socialConfig = useSocialConfig();
  const { currentUrl: backgroundUrl } = useBackground();

  const canFavorite = isSocialOperationAllowed(
    socialConfig.data,
    'favorite',
    'tripGroup',
    favorited ? 'delete' : 'create',
  );
  const canLike = isSocialOperationAllowed(
    socialConfig.data,
    'like',
    'tripGroup',
    liked ? 'delete' : 'create',
  );
  const canReport = isSocialOperationAllowed(
    socialConfig.data,
    'report',
    'tripGroup',
    reported ? 'delete' : 'create',
  );
  const canReportDay = dayReportTarget
    ? isSocialOperationAllowed(
        socialConfig.data,
        'report',
        socialConfigTargetKey('day'),
        dayReportTarget.social.reportedByMe ? 'delete' : 'create',
      )
    : false;

  const shareUrl = absoluteUrl(`/trips/${tripGroupId}`);

  // Mirrors ShareButton's share flow: the trip Share action moved into this bottom
  // action row, so the same native-share-with-image and clipboard fallback applies.
  async function handleShare(): Promise<void> {
    const title = shareTitle ?? 'Trip';
    const image = resolveShareImage({ primary: shareImage, fallback: backgroundUrl });
    const result = await shareWithFallback({
      url: shareUrl,
      title,
      text: shareText ?? title,
      image,
    });
    if (result === 'copied') {
      setShareCopied(true);
      window.setTimeout(() => setShareCopied(false), 2000);
    }
  }

  const showFavorite = variant === 'all' || variant === 'favorite';
  const showLikeReport = variant === 'all' || variant === 'like-report';

  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
      <SocialConfigStatus isLoading={socialConfig.isLoading} error={socialConfig.error} />
      {showFavorite && canFavorite && (
        <>
          <Tooltip title={!isAuthenticated ? 'Log in to add to favorites' : (favorited ? 'REMOVE FROM FAVORITE' : 'ADD TO FAVORITE')} arrow>
            <span style={{ display: 'inline-flex' }}>
              <IconButton
                onClick={() => favoriteMutation.mutate()}
                disabled={!isAuthenticated || favoriteMutation.isPending}
                aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
                color="primary"
                sx={favorited ? { '&:hover': { color: 'red' } } : undefined}
              >
                {favorited ? <BookmarkRemoveIcon /> : <BookmarkAddIcon />}
              </IconButton>
            </span>
          </Tooltip>
          {favoriteMutation.error ? (
            <span role="alert" style={{ color: 'red', fontSize: '0.75rem' }}>
              {getGenericErrorMessage(favoriteMutation.error)}
            </span>
          ) : null}
        </>
      )}

      {showLikeReport && (
        <>
          {canLike ? <>
          <Tooltip title={!isAuthenticated ? 'Log in to like' : (liked ? 'UN LIKE' : 'LIKE')} arrow>
            <span style={{ display: 'inline-flex' }}>
              <IconButton
                onClick={() => {
                  // The animation plays when the action actually changed the state.
                  likeAnimation.requestPlay();
                  likeMutation.mutate();
                }}
                disabled={!isAuthenticated || likeMutation.isPending}
                aria-label={liked ? 'Unlike' : 'Like'}
                color="primary"
              >
                {liked ? (
                  <ThumbUpIcon
                    sx={{
                      ':hover': { cursor: 'pointer' },
                      margin: '5px',
                      animation: likeAnimation.animation,
                    }}
                  />
                ) : (
                  <ThumbUpOffAltIcon
                    sx={{
                      ':hover': { cursor: 'pointer' },
                      margin: '5px',
                      animation: likeAnimation.animation,
                    }}
                  />
                )}
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title={`${likes} likes`} arrow>
            <span style={{ fontSize: '0.875rem', minWidth: '2.5rem', textAlign: 'center' }}>{likes}</span>
          </Tooltip>
          {likeMutation.error ? (
            <span role="alert" style={{ color: 'red', fontSize: '0.75rem' }}>
              {getGenericErrorMessage(likeMutation.error)}
            </span>
          ) : null}
          </> : null}

          {canReport ? <>
          <Tooltip title={!isAuthenticated ? 'Log in to report' : (reported ? 'UN REPORT TRIP' : 'REPORT TRIP')} arrow>
            <span style={{ display: 'inline-flex' }}>
              <IconButton
                onClick={() => {
                  if (reported) {
                    // Already reported by this user: withdraw the report again.
                    reportActions.unreport();
                    return;
                  }
                  reportActions.clearError();
                  reportActions.report();
                }}
                disabled={!isAuthenticated || reportActions.pending}
                aria-label={reported ? 'Withdraw report' : 'Report trip'}
                color={reported ? 'error' : 'primary'}
                sx={reported ? { '&:hover': { color: 'red' } } : undefined}
              >
                {reported ? <ReportOffIcon /> : <ReportIcon />}
              </IconButton>
            </span>
          </Tooltip>
          {reportActions.error ? (
            <span role="alert" style={{ color: 'red', fontSize: '0.75rem' }}>
              {reportActions.error}
            </span>
          ) : null}
          </> : null}

          {canReportDay && dayReportTarget ? (
            <ReportButton
              targetType="day"
              targetId={dayReportTarget.id}
              initialReported={dayReportTarget.social.reportedByMe}
              label="REPORT DAY"
            />
          ) : null}

          <Tooltip title={shareCopied ? 'Link copied!' : 'SHARE'} arrow>
            <span style={{ display: 'inline-flex' }}>
              <IconButton
                onClick={() => void handleShare()}
                aria-label={shareCopied ? 'Link copied!' : 'Share'}
              >
                <ShareIcon />
              </IconButton>
            </span>
          </Tooltip>
        </>
      )}
    </div>
  );
}
