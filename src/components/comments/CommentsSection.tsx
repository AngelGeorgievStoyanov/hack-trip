'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, Box, Button, CircularProgress, TextField, Typography } from '@mui/material';
import { commentApi, type CommentCreateInput, type CommentTarget } from '@/api/comments';
import { useAuth } from '@/hooks/useAuth';
import { useConfirm } from '@/components/common/ConfirmDialog';
import { ReportButton } from '@/components/social/ReportButton';
import { getGenericErrorMessage } from '@/lib/errors';

function commentKey(target: CommentTarget): unknown[] {
  switch (target.type) {
    case 'tripGroup':
      return ['comments', 'tripGroup', target.tripGroupId];
    case 'day':
      return ['comments', 'day', target.tripGroupId, target.tripId];
    case 'point':
      return ['comments', 'point', target.pointId];
    case 'image':
      return ['comments', 'image', target.imageId];
  }
}

export function CommentsSection({ target }: { target: CommentTarget }) {
  const { status } = useAuth();
  const { confirm } = useConfirm();
  const queryClient = useQueryClient();
  const [comment, setComment] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingComment, setEditingComment] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: commentKey(target),
    queryFn: () => commentApi.list(target),
  });

  const createMutation = useMutation({
    mutationFn: (input: CommentCreateInput) => commentApi.create(target, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: commentKey(target) });
      setComment('');
    },
    onError: (e) => setFormError(getGenericErrorMessage(e)),
  });

  const updateMutation = useMutation({
    mutationFn: (input: { id: number; comment: string }) =>
      commentApi.update(input.id, { comment: input.comment }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: commentKey(target) });
      setEditingId(null);
      setEditingComment('');
    },
    onError: (e) => setFormError(getGenericErrorMessage(e)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => commentApi.delete(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: commentKey(target) });
    },
    onError: (e) => setFormError(getGenericErrorMessage(e)),
  });

  const isAuthenticated = status === 'authenticated';

  return (
    <section>
      <Typography variant="h5" component="h2">
        Comments ({data?.total ?? 0})
      </Typography>
      {formError ? <Alert severity="error">{formError}</Alert> : null}

       {isAuthenticated ? (
         <Box
           component="form"
           onSubmit={(e) => {
             e.preventDefault();
             if (comment.trim()) {
               createMutation.mutate({ comment });
             }
           }}
           sx={{ display: 'flex', flexDirection: 'column', gap: 1, my: 1 }}
         >
           <TextField
             label="Add a comment"
             multiline
             minRows={2}
             value={comment}
             onChange={(e) => setComment(e.target.value)}
           />
           <Box>
            <Button type="submit" variant="contained" disabled={createMutation.isPending}>
              Post
            </Button>
          </Box>
        </Box>
      ) : (
        <Typography variant="body2">Log in to comment.</Typography>
      )}

      {isLoading ? <CircularProgress size={24} /> : null}
      {isError ? <Alert severity="error">{getGenericErrorMessage(error)}</Alert> : null}

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {data?.items.map((comment) => (
          <li key={comment.id} style={{ borderBottom: '1px solid #eee', padding: '0.5rem 0' }}>
            {editingId === comment.id ? (
              <Box
                component="form"
                onSubmit={(e) => {
                   e.preventDefault();
                   if (editingComment.trim()) {
                     updateMutation.mutate({ id: comment.id, comment: editingComment });
                   }
                 }}
                sx={{ display: 'flex', gap: 1 }}
              >
                <TextField
                  size="small"
                  value={editingComment}
                  onChange={(e) => setEditingComment(e.target.value)}
                />
                <Button type="submit" size="small">
                  Save
                </Button>
                <Button size="small" onClick={() => setEditingId(null)}>
                  Cancel
                </Button>
              </Box>
            ) : (
              <>
                <Typography variant="body1">{comment.comment}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {comment.author.name}
                </Typography>
                {isAuthenticated ? (
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                    <ReportButton targetType="comment" targetId={comment.id} />
                    {comment.permissions?.canEdit ? (
                      <>
                        <Button
                          size="small"
                          onClick={() => {
                            setEditingId(comment.id);
                            setEditingComment(comment.comment);
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          onClick={() =>
                            void confirm('Are you sure you want to delete this comment?', 'Delete Confirmation').then(
                              (confirmed) => {
                                if (confirmed) {
                                  deleteMutation.mutate(comment.id);
                                }
                              },
                            )
                          }
                        >
                          Delete
                        </Button>
                      </>
                    ) : null}
                  </Box>
                ) : null}
              </>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
