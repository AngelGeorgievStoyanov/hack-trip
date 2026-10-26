'use client';

import { useState } from 'react';
import { Badge, Box, IconButton, Tooltip } from '@mui/material';
import CommentIcon from '@mui/icons-material/Comment';
import AddCommentIcon from '@mui/icons-material/AddComment';
import CloseIcon from '@mui/icons-material/Close';
import { useAuth } from '@/hooks/useAuth';
import { LikeButton } from './LikeButton';
import { FavoriteButton } from './FavoriteButton';
import { ReportButton } from './ReportButton';
import { SocialConfigStatus } from './SocialConfigStatus';
import { useSocialConfig } from '@/hooks/useSocialConfig';
import { isSocialOperationAllowed, socialConfigTargetKey } from '@/lib/socialConfig';
import { CommentsSection } from '@/components/comments/CommentsSection';
import type { CommentTarget } from '@/api/comments';
import type { SocialState, SocialTargetTypeInput } from '@/types';

interface EngagementBarProps {
  targetType: SocialTargetTypeInput;
  targetId: number;
  social: SocialState;
  commentTarget: CommentTarget;
  showConfigStatus?: boolean;
  showComments?: boolean;
  /** Whether to render the Favorite action. Used by Trip Details, which renders its own
   * Favorite at the original top-row position to avoid duplicating it in the same card. */
  showFavorite?: boolean;
  presentation?: 'inline' | 'overlay';
  /** Icon button size. `'medium'` inline, `'small'` for image overlays. */
  size?: 'small' | 'medium';
  commentsOpen?: boolean;
  onToggleComments?: () => void;
}

export function EngagementBar({
  targetType,
  targetId,
  social,
  commentTarget,
  showConfigStatus = true,
  showComments = true,
  showFavorite = true,
  presentation = 'inline',
  size = 'medium',
  commentsOpen,
  onToggleComments,
}: EngagementBarProps) {
  const { status } = useAuth();
  const socialConfig = useSocialConfig();
  const [internalCommentsOpen, setInternalCommentsOpen] = useState(false);
  const targetKey = socialConfigTargetKey(targetType);
  const canLike = isSocialOperationAllowed(
    socialConfig.data,
    'like',
    targetKey,
    social.likedByMe ? 'delete' : 'create',
  );
  const canFavorite = isSocialOperationAllowed(
    socialConfig.data,
    'favorite',
    targetKey,
    social.favoritedByMe ? 'delete' : 'create',
  );
  const canReport = isSocialOperationAllowed(
    socialConfig.data,
    'report',
    targetKey,
    social.reportedByMe ? 'delete' : 'create',
  );
  const externallyControlledComments = onToggleComments !== undefined;
  const isCommentsOpen = externallyControlledComments
    ? commentsOpen ?? false
    : internalCommentsOpen;

  function toggleComments(): void {
    if (onToggleComments) {
      onToggleComments();
      return;
    }
    setInternalCommentsOpen((previous) => !previous);
  }

  const reportLabel = targetType === 'day' || targetType === 'trip'
    ? 'REPORT TRIP'
    : `REPORT ${targetType.toUpperCase()}`;

  return (
    <Box
      onClick={(event) => event.stopPropagation()}
      onPointerDown={(event) => event.stopPropagation()}
      onTouchStart={(event) => event.stopPropagation()}
      onTouchMove={(event) => event.stopPropagation()}
      onTouchEnd={(event) => event.stopPropagation()}
      sx={presentation === 'overlay'
        ? {
            position: 'absolute',
            top: 8,
            right: 8,
            zIndex: 2,
            p: 0.35,
            border: '1px solid rgba(255,255,255,0.22)',
            borderRadius: 3,
            backgroundColor: 'rgba(24, 31, 26, 0.82)',
            boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
      '& .MuiIconButton-root': { color: 'common.white', p: size === 'small' ? 0.5 : 0.65 },
      '& .MuiIconButton-root:hover': { backgroundColor: 'rgba(255,255,255,0.16)' },
      '& .MuiBadge-badge': {
        fontSize: size === 'small' ? '0.65rem' : undefined,
        height: size === 'small' ? 14 : undefined,
        minWidth: size === 'small' ? 14 : undefined,
        padding: size === 'small' ? '0 3px' : undefined,
        lineHeight: size === 'small' ? 1 : undefined,
      },
          }
        : { display: 'flex', flexDirection: 'column', gap: '0.25rem', margin: '0.25rem 0' }}
    >
      {showConfigStatus ? (
        <SocialConfigStatus isLoading={socialConfig.isLoading} error={socialConfig.error} />
      ) : null}
      <Box sx={{ display: 'flex', gap: 0.25, alignItems: 'center', flexWrap: 'wrap' }}>
        {status === 'authenticated' ? (
          <>
            {canLike ? (
              <LikeButton
                targetType={targetType}
                targetId={targetId}
                initialLiked={social.likedByMe}
                initialLikes={social.likes}
                size={size}
              />
            ) : null}
            {showFavorite && canFavorite ? (
              <FavoriteButton
                targetType={targetType}
                targetId={targetId}
                initialFavorited={social.favoritedByMe ?? false}
                initialFavorites={social.favorites ?? 0}
                size={size}
              />
            ) : null}
            {canReport ? (
              <ReportButton
                targetType={targetType}
                targetId={targetId}
                initialReported={social.reportedByMe}
                label={reportLabel}
                size={size}
              />
            ) : null}
          </>
        ) : null}
        {showComments ? (
        <Tooltip title={isCommentsOpen ? 'Hide comments' : social.comments.count > 0 ? `Show ${social.comments.count} comments` : 'Add comment'} arrow>
          <IconButton
            onClick={toggleComments}
            aria-label={isCommentsOpen ? 'Hide comments' : social.comments.count > 0 ? `Show ${social.comments.count} comments` : 'Add comment'}
              aria-expanded={isCommentsOpen}
              color="primary"
              size={size}
            >
              {isCommentsOpen ? (
                <CloseIcon />
              ) : social.comments.count > 0 ? (
                <Badge badgeContent={social.comments.count} max={Number.MAX_SAFE_INTEGER} color="primary">
                  <CommentIcon />
                </Badge>
              ) : (
                <AddCommentIcon />
              )}
            </IconButton>
          </Tooltip>
        ) : null}
      </Box>
      {!externallyControlledComments && showComments && isCommentsOpen ? (
        <CommentsSection
          target={commentTarget}
          defaultFormOpen={social.comments.count === 0}
        />
      ) : null}
    </Box>
  );
}
