'use client';

import { useState } from 'react';
import { Button } from '@mui/material';
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
}

export function EngagementBar({
  targetType,
  targetId,
  social,
  commentTarget,
  showConfigStatus = true,
}: EngagementBarProps) {
  const { status } = useAuth();
  const socialConfig = useSocialConfig();
  const [showComments, setShowComments] = useState(false);
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', margin: '0.25rem 0' }}>
      {showConfigStatus ? (
        <SocialConfigStatus isLoading={socialConfig.isLoading} error={socialConfig.error} />
      ) : null}
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
        {status === 'authenticated' ? (
          <>
            {canLike ? <LikeButton
              targetType={targetType}
              targetId={targetId}
              initialLiked={social.likedByMe}
              initialLikes={social.likes}
            /> : null}
            {canFavorite ? <FavoriteButton
              targetType={targetType}
              targetId={targetId}
              initialFavorited={social.favoritedByMe ?? false}
              initialFavorites={social.favorites ?? 0}
            /> : null}
            {canReport ? <ReportButton
              targetType={targetType}
              targetId={targetId}
              initialReported={social.reportedByMe}
              label="REPORT IMAGE"
            /> : null}
          </>
        ) : null}
        <Button size="small" onClick={() => setShowComments((prev) => !prev)}>
          {showComments ? 'Hide comments' : `Comments (${social.comments.count})`}
        </Button>
      </div>
      {showComments ? <CommentsSection target={commentTarget} /> : null}
    </div>
  );
}
