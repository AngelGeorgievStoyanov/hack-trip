'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, Badge, Box, CircularProgress, IconButton, TextField, Tooltip, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import CheckIcon from '@mui/icons-material/Check';
import ReplyIcon from '@mui/icons-material/Reply';
import { commentApi } from '@/api/comments';
import { useAuth } from '@/hooks/useAuth';
import { useConfirm } from '@/components/common/ConfirmDialog';
import { LikeButton } from '@/components/social/LikeButton';
import { FavoriteButton } from '@/components/social/FavoriteButton';
import { ReportButton } from '@/components/social/ReportButton';
import { SocialConfigStatus } from '@/components/social/SocialConfigStatus';
import { getGenericErrorMessage } from '@/lib/errors';
import { isSocialOperationAllowed } from '@/lib/socialConfig';
import { useSocialConfig } from '@/hooks/useSocialConfig';
import { invalidateSocialQueries } from '@/lib/socialQuerySync';
import type { CommentDto, SocialConfigTargetKey } from '@/types';

interface RepliesSectionProps {
  commentId: number;
  initialRepliesCount: number;
  parentTargetType: SocialConfigTargetKey;
}

export function RepliesSection({
  commentId,
  initialRepliesCount,
  parentTargetType,
}: RepliesSectionProps) {
  const { status, viewerCacheKey } = useAuth();
  const { confirm } = useConfirm();
  const queryClient = useQueryClient();
  const socialConfig = useSocialConfig();
  const [reply, setReply] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingReply, setEditingReply] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  useEffect(() => {
    setReply('');
    setEditingId(null);
    setEditingReply('');
    setErrorMessage(null);
  }, [viewerCacheKey]);
  const queryKey = ['comments', viewerCacheKey, 'replies', commentId];
  const authenticated = status === 'authenticated';
  const sessionResolved = status === 'anonymous' || authenticated;
  const canCreateReply = isSocialOperationAllowed(
    socialConfig.data,
    'replyComment',
    'comment',
    'create',
    parentTargetType,
  );

  const { data, isLoading, isError, error } = useQuery({
    queryKey,
    queryFn: () => commentApi.replies(commentId),
    enabled: sessionResolved,
  });

  const refresh = () => {
    invalidateSocialQueries(queryClient, 'comment');
  };

  const createMutation = useMutation({
    mutationFn: (comment: string) => commentApi.createReply(commentId, { comment }),
    onSuccess: () => {
      setReply('');
      setErrorMessage(null);
      void refresh();
    },
    onError: (cause) => setErrorMessage(getGenericErrorMessage(cause)),
  });

  const updateMutation = useMutation({
    mutationFn: (input: { id: number; comment: string }) =>
      commentApi.updateReply(input.id, { comment: input.comment }),
    onSuccess: () => {
      setEditingId(null);
      setEditingReply('');
      setErrorMessage(null);
      void refresh();
    },
    onError: (cause) => setErrorMessage(getGenericErrorMessage(cause)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => commentApi.deleteReply(id),
    onSuccess: () => void refresh(),
    onError: (cause) => setErrorMessage(getGenericErrorMessage(cause)),
  });

  function renderReply(item: CommentDto) {
    const canLike = isSocialOperationAllowed(
      socialConfig.data,
      'like',
      'comment',
      item.social.likedByMe ? 'delete' : 'create',
    );
    const canFavorite = isSocialOperationAllowed(
      socialConfig.data,
      'favorite',
      'comment',
      item.social.favoritedByMe ? 'delete' : 'create',
    );
    const canReport = isSocialOperationAllowed(
      socialConfig.data,
      'report',
      'comment',
      item.social.reportedByMe ? 'delete' : 'create',
    );
    const canEdit = item.permissions.canEdit && isSocialOperationAllowed(
      socialConfig.data,
      'replyComment',
      'comment',
      'edit',
      parentTargetType,
    );
    const canDelete = item.permissions.canDelete && isSocialOperationAllowed(
      socialConfig.data,
      'replyComment',
      'comment',
      'delete',
      parentTargetType,
    );
    const hasReplyActions = canLike || canFavorite || canReport || canEdit || canDelete;

    return (
      <Box
        key={item.id}
        sx={{ borderLeft: '2px solid', borderColor: 'divider', pl: 2, py: 1, mt: 1 }}
      >
        <Typography variant="subtitle2">{item.author.name}</Typography>
        {authenticated && editingId === item.id && canEdit ? (
          <Box
            component="form"
            onSubmit={(event) => {
              event.preventDefault();
              if (editingReply.trim()) {
                updateMutation.mutate({ id: item.id, comment: editingReply });
              }
            }}
            sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}
          >
            <TextField
              size="small"
              value={editingReply}
              onChange={(event) => setEditingReply(event.target.value)}
              multiline
            />
            <Tooltip title="Save reply" arrow>
              <span>
                <IconButton type="submit" aria-label="Save reply" disabled={updateMutation.isPending}>
                  <CheckIcon />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Cancel edit" arrow>
              <IconButton
                type="button"
                aria-label="Cancel edit"
                onClick={() => {
                  setEditingId(null);
                  setEditingReply('');
                }}
              >
                <CloseIcon />
              </IconButton>
            </Tooltip>
          </Box>
        ) : (
          <Typography sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
            {item.comment}
          </Typography>
        )}
        {authenticated && hasReplyActions ? (
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap', mt: 1 }}>
            {canLike ? <LikeButton
              targetType="comment"
              targetId={item.id}
              initialLiked={item.social.likedByMe}
              initialLikes={item.social.likes}
            /> : null}
            {canFavorite ? <FavoriteButton
              targetType="comment"
              targetId={item.id}
              initialFavorited={item.social.favoritedByMe ?? false}
              initialFavorites={item.social.favorites ?? 0}
            /> : null}
            {canReport ? <ReportButton
              targetType="comment"
              targetId={item.id}
              initialReported={item.social.reportedByMe}
              label="REPORT REPLY"
              onReportedChange={() => void refresh()}
            /> : null}
            {canEdit ? (
              <Tooltip title="Edit reply" arrow>
                <IconButton
                  size="small"
                  aria-label="Edit reply"
                  onClick={() => {
                    setEditingId(item.id);
                    setEditingReply(item.comment);
                  }}
                >
                  <EditOutlinedIcon />
                </IconButton>
              </Tooltip>
            ) : null}
            {canDelete ? (
              <Tooltip title="Delete reply" arrow>
                <IconButton
                  size="small"
                  color="error"
                  aria-label="Delete reply"
                  onClick={() =>
                    void confirm('Delete this reply?', 'Delete Confirmation').then((confirmed) => {
                      if (confirmed) deleteMutation.mutate(item.id);
                    })
                  }
                >
                  <DeleteOutlineIcon />
                </IconButton>
              </Tooltip>
            ) : null}
          </Box>
        ) : null}
      </Box>
    );
  }

  return (
    <Box component="section" aria-label={`Replies, ${data?.total ?? initialRepliesCount} total`} sx={{ mt: 1, pl: 2 }}>
      <Typography variant="subtitle2">Replies</Typography>
      <SocialConfigStatus isLoading={socialConfig.isLoading} error={socialConfig.error} />
      {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}
      {isLoading ? <CircularProgress size={20} /> : null}
      {isError ? <Alert severity="error">{getGenericErrorMessage(error)}</Alert> : null}
      {data?.items.map(renderReply)}
      {authenticated && canCreateReply ? (
        <Box
          component="form"
          onSubmit={(event) => {
            event.preventDefault();
            if (reply.trim()) createMutation.mutate(reply);
          }}
          sx={{ display: 'flex', gap: 1, alignItems: 'flex-start', mt: 1 }}
        >
          <TextField
            size="small"
            label="Write a reply"
            value={reply}
            onChange={(event) => setReply(event.target.value)}
            multiline
            fullWidth
          />
          <Tooltip title="Reply" arrow>
            <span>
              <IconButton
                type="submit"
                aria-label="Reply"
                disabled={!reply.trim() || createMutation.isPending}
                color="primary"
              >
                <ReplyIcon aria-hidden="true" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Cancel reply" arrow>
            <IconButton
              type="button"
              aria-label="Cancel reply"
              onClick={() => {
                setReply('');
                setErrorMessage(null);
              }}
              disabled={createMutation.isPending}
            >
              <CloseIcon />
            </IconButton>
          </Tooltip>
        </Box>
      ) : status === 'anonymous' ? (
        <Typography variant="body2">Log in to reply.</Typography>
      ) : null}
    </Box>
  );
}
