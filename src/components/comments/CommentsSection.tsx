'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, Box, Button, CircularProgress, TextField, Typography } from '@mui/material';
import { commentApi, type CommentCreateInput, type CommentTarget } from '@/api/comments';
import { useAuth } from '@/hooks/useAuth';
import { getGenericErrorMessage } from '@/lib/errors';

function commentKey(target: CommentTarget): unknown[] {
  switch (target.type) {
    case 'tripGroup':
      return ['comments', 'tripGroup', target.tripGroupId];
    case 'day':
      return ['comments', 'day', target.tripId, target.dayId];
    case 'point':
      return ['comments', 'point', target.pointId];
    case 'image':
      return ['comments', 'image', target.imageId];
  }
}

export function CommentsSection({ target }: { target: CommentTarget }) {
  const { status, user } = useAuth();
  const queryClient = useQueryClient();
  const [text, setText] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: commentKey(target),
    queryFn: () => commentApi.list(target),
  });

  const createMutation = useMutation({
    mutationFn: (input: CommentCreateInput) => commentApi.create(target, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: commentKey(target) });
      setText('');
    },
    onError: (e) => setFormError(getGenericErrorMessage(e)),
  });

  const updateMutation = useMutation({
    mutationFn: (input: { id: number; text: string }) =>
      commentApi.update(input.id, { text: input.text }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: commentKey(target) });
      setEditingId(null);
      setEditingText('');
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
            if (text.trim()) {
              createMutation.mutate({ text });
            }
          }}
          sx={{ display: 'flex', flexDirection: 'column', gap: 1, my: 1 }}
        >
          <TextField
            label="Add a comment"
            multiline
            minRows={2}
            value={text}
            onChange={(e) => setText(e.target.value)}
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
                  if (editingText.trim()) {
                    updateMutation.mutate({ id: comment.id, text: editingText });
                  }
                }}
                sx={{ display: 'flex', gap: 1 }}
              >
                <TextField
                  size="small"
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
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
                <Typography variant="body1">{comment.text}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {comment.author.name}
                </Typography>
                {user && user.id === comment.author.id ? (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      size="small"
                      onClick={() => {
                        setEditingId(comment.id);
                        setEditingText(comment.text);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      onClick={() => deleteMutation.mutate(comment.id)}
                    >
                      Delete
                    </Button>
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
