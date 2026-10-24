'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Alert,
  Avatar,
  Box,
  Button,
  CircularProgress,
  IconButton,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import AddCommentIcon from '@mui/icons-material/AddComment';
import CloseIcon from '@mui/icons-material/Close';
import { commentApi, type CommentCreateInput, type CommentTarget } from '@/api/comments';
import { useAuth } from '@/hooks/useAuth';
import { useConfirm } from '@/components/common/ConfirmDialog';
import { ReportButton } from '@/components/social/ReportButton';
import { LikeButton } from '@/components/social/LikeButton';
import { FavoriteButton } from '@/components/social/FavoriteButton';
import { RepliesSection } from '@/components/comments/RepliesSection';
import { SocialConfigStatus } from '@/components/social/SocialConfigStatus';
import { getGenericErrorMessage } from '@/lib/errors';
import { isSocialOperationAllowed, socialConfigTargetKey } from '@/lib/socialConfig';
import { useSocialConfig } from '@/hooks/useSocialConfig';
import { commentCardStyle, commentListStyle, commentsPanelStyle } from '@/constants/ui';

function commentKey(target: CommentTarget, viewerCacheKey: string): unknown[] {
  switch (target.type) {
    case 'tripGroup':
      return ['comments', viewerCacheKey, 'tripGroup', target.tripGroupId];
    case 'day':
      return ['comments', viewerCacheKey, 'day', target.tripGroupId, target.tripId];
    case 'point':
      return ['comments', viewerCacheKey, 'point', target.pointId];
    case 'image':
      return ['comments', viewerCacheKey, 'image', target.imageId];
  }
}

function formatTimestamp(value: string | null): string | null {
  if (!value) {
    return null;
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toLocaleString();
}

function initials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) {
    return '?';
  }
  const parts = trimmed.split(/\s+/).slice(0, 2);
  return parts.map((part) => part.charAt(0).toUpperCase()).join('');
}

interface CommentsSectionProps {
  target: CommentTarget;
  /** Comment count already present in the trip DTO; used until the list is loaded. */
  initialCommentsCount?: number;
  /**
   * When false the section renders nothing and no request is sent. The trip details page
   * keeps the show/hide toggle in the trip information card and renders the list in this
   * separate section, so the two concerns stay independent.
   */
  open?: boolean;
}

/**
 * Comment list of one social target.
 *
 * The list is rendered as its own section (never inside the trip information card) and
 * keeps the legacy comment card look: a wrapping row of translucent comment cards with
 * the author, the comment text, the timestamp and the comment actions. A future sorting
 * control belongs to this section, so the trip details card only owns the toggle.
 */
export function CommentsSection({
  target,
  initialCommentsCount = 0,
  open = true,
}: CommentsSectionProps) {
  const { status, viewerCacheKey } = useAuth();
  const { confirm } = useConfirm();
  const queryClient = useQueryClient();
  const socialConfig = useSocialConfig();
  const [comment, setComment] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingComment, setEditingComment] = useState('');
  const [openRepliesId, setOpenRepliesId] = useState<number | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  // The add-comment form starts closed and is opened from the toggle at the bottom of
  // the section; opening it only changes local state, it never refetches the list.
  const [formOpen, setFormOpen] = useState(false);

  // The comment list carries the viewer's own report state, so the request must not run
  // before the session is known: an anonymous read would report every comment as
  // "not reported by me".
  const sessionResolved = status === 'anonymous' || status === 'authenticated';
  const targetKey = socialConfigTargetKey(target.type);
  const canCreateComment = isSocialOperationAllowed(
    socialConfig.data,
    'comment',
    targetKey,
    'create',
  );
  const queryKey = commentKey(target, viewerCacheKey);

  const { data, isLoading, isError, error } = useQuery({
    queryKey,
    queryFn: () => commentApi.list(target),
    enabled: open && sessionResolved,
  });

  const createMutation = useMutation({
    mutationFn: (input: CommentCreateInput) => commentApi.create(target, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey });
      setComment('');
      setFormOpen(false);
    },
    onError: (e) => setFormError(getGenericErrorMessage(e)),
  });

  const updateMutation = useMutation({
    mutationFn: (input: { id: number; comment: string }) =>
      commentApi.update(input.id, { comment: input.comment }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey });
      setEditingId(null);
      setEditingComment('');
    },
    onError: (e) => setFormError(getGenericErrorMessage(e)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => commentApi.delete(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey });
    },
    onError: (e) => setFormError(getGenericErrorMessage(e)),
  });

  const isAuthenticated = status === 'authenticated';
  const total = data?.total ?? initialCommentsCount;

  if (!open) {
    return null;
  }

  return (
    <section aria-label="Comments" style={commentsPanelStyle}>
      <Typography variant="h5" component="h2" sx={{ marginBottom: '10px' }}>
        Comments ({total})
      </Typography>
      <SocialConfigStatus isLoading={socialConfig.isLoading} error={socialConfig.error} />
      {formError ? (
        <Alert severity="error" sx={{ marginBottom: '10px' }}>
          {formError}
        </Alert>
      ) : null}

      {isLoading ? <CircularProgress size={24} /> : null}
      {isError ? <Alert severity="error">{getGenericErrorMessage(error)}</Alert> : null}

      {!isLoading && !isError && data && (data.items.length ?? 0) === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No comments yet{target.type === 'day' ? ' for this day' : ''}.
        </Typography>
      ) : null}

      <ul style={commentListStyle}>
        {data?.items.map((commentItem) => {
          const createdAt = formatTimestamp(commentItem.createdAt);
          const updatedAt = formatTimestamp(commentItem.updatedAt);
          const canLike = isSocialOperationAllowed(
            socialConfig.data,
            'like',
            'comment',
            commentItem.social.likedByMe ? 'delete' : 'create',
          );
          const canFavorite = isSocialOperationAllowed(
            socialConfig.data,
            'favorite',
            'comment',
            commentItem.social.favoritedByMe ? 'delete' : 'create',
          );
          const canReport = isSocialOperationAllowed(
            socialConfig.data,
            'report',
            'comment',
            commentItem.social.reportedByMe ? 'delete' : 'create',
          );
          const canEdit = commentItem.permissions.canEdit && isSocialOperationAllowed(
            socialConfig.data,
            'comment',
            'comment',
            'edit',
          );
          const canDelete = commentItem.permissions.canDelete && isSocialOperationAllowed(
            socialConfig.data,
            'comment',
            'comment',
            'delete',
          );
          const hasCommentActions = canLike || canFavorite || canReport || canEdit || canDelete;

          return (
            <li key={commentItem.id} style={commentCardStyle}>
              {editingId === commentItem.id ? (
                <Box
                  component="form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (editingComment.trim()) {
                      updateMutation.mutate({ id: commentItem.id, comment: editingComment });
                    }
                  }}
                  sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: '100%' }}
                >
                  <TextField
                    label="Edit comment"
                    multiline
                    minRows={2}
                    value={editingComment}
                    onChange={(e) => setEditingComment(e.target.value)}
                  />
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Button type="submit" size="small" disabled={updateMutation.isPending}>
                      Save
                    </Button>
                    <Button size="small" onClick={() => setEditingId(null)}>
                      Cancel
                    </Button>
                  </Box>
                </Box>
              ) : (
                <>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, marginBottom: '8px' }}>
                    <Avatar
                      alt={commentItem.author.name}
                      sx={{ backgroundColor: 'primary.main', width: 40, height: 40 }}
                    >
                      {initials(commentItem.author.name)}
                    </Avatar>
                    <Typography variant="subtitle1" component="h3" sx={{ fontWeight: 500 }}>
                      Author name: {commentItem.author.name}
                    </Typography>
                  </Box>

                  <Typography
                    variant="body1"
                    component="p"
                    sx={{
                      margin: 0,
                      padding: '5px',
                      whiteSpace: 'pre-wrap',
                      overflowWrap: 'anywhere',
                      wordBreak: 'break-word',
                    }}
                  >
                    {commentItem.comment}
                  </Typography>

                  {createdAt ? (
                    <Typography variant="caption" color="text.secondary" sx={{ marginTop: '8px' }}>
                      {updatedAt && updatedAt !== createdAt
                        ? `Edited on ${updatedAt}`
                        : `Posted on ${createdAt}`}
                    </Typography>
                  ) : null}

                  {isAuthenticated && hasCommentActions ? (
                    <Box
                      sx={{
                        display: 'flex',
                        gap: 1,
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        marginTop: '10px',
                      }}
                    >
                      {canLike ? <LikeButton targetType="comment" targetId={commentItem.id} initialLiked={commentItem.social.likedByMe} initialLikes={commentItem.social.likes} /> : null}
                      {canFavorite ? <FavoriteButton targetType="comment" targetId={commentItem.id} initialFavorited={commentItem.social.favoritedByMe ?? false} initialFavorites={commentItem.social.favorites ?? 0} /> : null}
                      {canReport ? <ReportButton
                        targetType="comment"
                        targetId={commentItem.id}
                        initialReported={commentItem.social.reportedByMe}
                        label="REPORT COMMENT"
                        onReportedChange={() => {
                          void queryClient.invalidateQueries({ queryKey });
                        }}
                      /> : null}
                      {canEdit ? (
                        <Button
                          size="small"
                          onClick={() => {
                            setEditingId(commentItem.id);
                            setEditingComment(commentItem.comment);
                          }}
                        >
                          EDIT COMMENT
                        </Button>
                      ) : null}
                      {canDelete ? (
                        <Button
                          size="small"
                          color="error"
                          onClick={() =>
                            void confirm(
                              'Are you sure you want to delete this comment?',
                              'Delete Confirmation',
                            ).then((confirmed) => {
                              if (confirmed) {
                                deleteMutation.mutate(commentItem.id);
                              }
                            })
                          }
                        >
                          DELETE COMMENT
                        </Button>
                      ) : null}
                    </Box>
                  ) : null}
                </>
              )}
              <Button size="small" onClick={() => setOpenRepliesId((current) => current === commentItem.id ? null : commentItem.id)}>
                {openRepliesId === commentItem.id ? 'Hide replies' : 'Replies (' + commentItem.social.comments.count + ')'}
              </Button>
              {openRepliesId === commentItem.id ? (
                <RepliesSection
                  commentId={commentItem.id}
                  initialRepliesCount={commentItem.social.comments.count}
                  parentTargetType={targetKey}
                />
              ) : null}
            </li>
          );
        })}
      </ul>

      {isAuthenticated && canCreateComment ? (
        <>
          {/* The form expands from the bottom of the section, right above its toggle. */}
          {formOpen ? (
            <Box
              component="form"
              onSubmit={(e) => {
                e.preventDefault();
                if (comment.trim()) {
                  createMutation.mutate({ comment });
                }
              }}
              sx={{ display: 'flex', flexDirection: 'column', gap: 1, marginTop: '10px' }}
            >
              <TextField
                label="Add a comment"
                multiline
                minRows={2}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <Box>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={!comment.trim() || createMutation.isPending}
                >
                  Post
                </Button>
              </Box>
            </Box>
          ) : null}

          <Box sx={{ display: 'flex', justifyContent: 'flex-start', marginTop: '10px' }}>
            <Tooltip title={formOpen ? 'Close' : 'Add comment'} arrow>
              <IconButton
                onClick={() => setFormOpen((previous) => !previous)}
                aria-label={formOpen ? 'Close' : 'Add comment'}
                aria-expanded={formOpen}
                color="primary"
              >
                {formOpen ? <CloseIcon /> : <AddCommentIcon />}
              </IconButton>
            </Tooltip>
          </Box>
        </>
      ) : status === 'anonymous' ? (
        <Typography variant="body2" sx={{ marginTop: '10px' }}>
          Log in to comment.
        </Typography>
      ) : null}
    </section>
  );
}
