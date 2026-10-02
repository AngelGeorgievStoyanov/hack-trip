'use client';

import { useState } from 'react';
import { Button } from '@mui/material';
import { useAuth } from '@/hooks/useAuth';
import { LikeButton } from './LikeButton';
import { ReportButton } from './ReportButton';
import { CommentsSection } from '@/components/comments/CommentsSection';
import type { CommentTarget } from '@/api/comments';
import type { SocialState, SocialTargetTypeInput } from '@/types';

interface EngagementBarProps {
  targetType: SocialTargetTypeInput;
  targetId: number;
  social: SocialState;
  commentTarget: CommentTarget;
}

export function EngagementBar({ targetType, targetId, social, commentTarget }: EngagementBarProps) {
  const { status } = useAuth();
  const [showComments, setShowComments] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', margin: '0.25rem 0' }}>
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
        {status === 'authenticated' ? (
          <>
            <LikeButton
              targetType={targetType}
              targetId={targetId}
              initialLiked={social.likedByMe}
              initialLikes={social.likes}
            />
            <ReportButton targetType={targetType} targetId={targetId} />
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
