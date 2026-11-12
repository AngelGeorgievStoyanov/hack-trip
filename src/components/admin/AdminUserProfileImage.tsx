'use client';

import { useState } from 'react';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, Avatar, Box, Button, CircularProgress, Stack, Typography } from '@mui/material';
import { adminApi } from '@/api/admin';
import { useConfirm } from '@/components/common/ConfirmDialog';
import ImageUploadField from '@/components/images/ImageUploadField';
import { AppImage } from '@/components/images/AppImage';
import { ImageLightbox } from '@/components/images/ImageLightbox';
import { getGenericErrorMessage } from '@/lib/errors';
import type { ImageDto } from '@/types';

export function AdminUserProfileImage({ userId }: { userId: string }) {
  const queryClient = useQueryClient();
  const { confirm } = useConfirm();
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const imageQuery = useQuery({
    queryKey: ['admin', 'user', userId, 'image'],
    queryFn: () => adminApi.getUserProfileImage(userId),
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => adminApi.uploadUserProfileImage(userId, file),
    onSuccess: (image) => {
      queryClient.setQueryData<ImageDto | null>(['admin', 'user', userId, 'image'], image);
      void queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      setFiles([]);
      setError(null);
    },
    onError: (cause) => setError(getGenericErrorMessage(cause)),
  });

  const deleteMutation = useMutation({
    mutationFn: () => adminApi.deleteUserProfileImage(userId),
    onSuccess: () => {
      queryClient.setQueryData<ImageDto | null>(['admin', 'user', userId, 'image'], null);
      void queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      setFiles([]);
      setError(null);
    },
    onError: (cause) => setError(getGenericErrorMessage(cause)),
  });

  const image = imageQuery.data;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="h6">Profile image</Typography>
      {error ? (
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      ) : null}
      {imageQuery.isLoading ? <CircularProgress size={24} /> : null}
      {imageQuery.error ? (
        <Alert severity="error">{getGenericErrorMessage(imageQuery.error)}</Alert>
      ) : null}
      {image ? (
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar
            component="button"
            type="button"
            aria-label="Open profile image"
            onClick={() => setLightboxOpen(true)}
            sx={{ width: 88, height: 88, cursor: 'zoom-in', p: 0, border: 0 }}
          >
            <AppImage
              image={image}
              alt="User profile image"
              useThumbnail
              width={88}
              height={88}
              sizes="88px"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </Avatar>
          <Button
            color="error"
            variant="outlined"
            startIcon={<DeleteOutlineRoundedIcon />}
            disabled={deleteMutation.isPending || uploadMutation.isPending}
            onClick={() => {
              void confirm('Delete this user profile image?', 'Delete profile image').then((ok) => {
                if (ok) deleteMutation.mutate();
              });
            }}
          >
            {deleteMutation.isPending ? <CircularProgress size={18} /> : 'Delete image'}
          </Button>
        </Stack>
      ) : !imageQuery.isLoading && !imageQuery.error ? (
        <Typography variant="body2" color="text.secondary">
          No profile image uploaded.
        </Typography>
      ) : null}
      <ImageUploadField files={files} setFiles={setFiles} maxImages={1} />
      <Button
        variant="contained"
        disabled={files.length !== 1 || uploadMutation.isPending || deleteMutation.isPending}
        onClick={() => uploadMutation.mutate(files[0])}
        sx={{ alignSelf: 'flex-start' }}
      >
        {uploadMutation.isPending ? (
          <CircularProgress size={18} />
        ) : image ? (
          'Replace image'
        ) : (
          'Upload image'
        )}
      </Button>
      {image ? (
        <ImageLightbox
          images={[image]}
          index={lightboxOpen ? 0 : null}
          alt="User profile image"
          onIndexChange={() => undefined}
          onClose={() => setLightboxOpen(false)}
        />
      ) : null}
    </Box>
  );
}
