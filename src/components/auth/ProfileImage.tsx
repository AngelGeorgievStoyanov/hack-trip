'use client';

import { useCallback, useEffect, useState } from 'react';
import { Alert, Box, Button, CircularProgress, Typography } from '@mui/material';
import { authApi } from '@/api/auth';
import { AppImage } from '@/components/images/AppImage';
import { getGenericErrorMessage } from '@/lib/errors';
import { ACCEPTED_IMAGE_MIME_TYPES, MAX_UPLOAD_BYTES } from '@/constants/images';
import type { ImageDto } from '@/types';

const ACCEPT_TYPES = (ACCEPTED_IMAGE_MIME_TYPES as readonly string[]).join(',');

export function ProfileImage() {
  const [image, setImage] = useState<ImageDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setImage(await authApi.getProfileImage());
    } catch (e) {
      setError(getGenericErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleFile(file: File | undefined): Promise<void> {
    if (!file) {
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      setError('The file is too large (max 25 MB).');
      return;
    }
    if (!(ACCEPTED_IMAGE_MIME_TYPES as readonly string[]).includes(file.type)) {
      setError('Unsupported image format.');
      return;
    }

    setUploading(true);
    setError(null);
    try {
      const uploaded = await authApi.uploadProfileImage(file);
      setImage(uploaded);
    } catch (e) {
      setError(getGenericErrorMessage(e));
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(): Promise<void> {
    setError(null);
    try {
      await authApi.deleteProfileImage();
      setImage(null);
    } catch (e) {
      setError(getGenericErrorMessage(e));
    }
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="h5" component="h2">
        Profile image
      </Typography>
      {error ? <Alert severity="error">{error}</Alert> : null}
      {loading ? (
        <CircularProgress size={24} />
      ) : image ? (
        <AppImage image={image} alt="Profile image" width={160} height={160} />
      ) : (
        <Typography variant="body2">No profile image.</Typography>
      )}
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button component="label" variant="outlined" disabled={uploading}>
          Upload
          <input
            type="file"
            accept={ACCEPT_TYPES}
            hidden
            onChange={(e) => void handleFile(e.target.files?.[0])}
          />
        </Button>
        {image ? (
          <Button variant="outlined" color="error" onClick={() => void handleDelete()}>
            Remove
          </Button>
        ) : null}
      </Box>
    </Box>
  );
}
