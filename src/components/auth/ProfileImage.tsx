'use client';

import { useCallback, useEffect, useState } from 'react';
import { Alert, Box, Button, CircularProgress, Typography } from '@mui/material';
import { authApi } from '@/api/auth';
import { AppImage } from '@/components/images/AppImage';
import { SingleImageUploadButton } from '@/components/common/SingleImageUploadButton';
import { useConfirm } from '@/components/common/ConfirmDialog';
import { getGenericErrorMessage } from '@/lib/errors';
import { validateImageFile } from '@/lib/images/validate';
import { ACCEPTED_IMAGE_MIME_TYPES } from '@/constants/images';
import type { ImageDto } from '@/types';

const ACCEPT_TYPES = (ACCEPTED_IMAGE_MIME_TYPES as readonly string[]).join(',');

export function ProfileImage() {
  const { confirm } = useConfirm();
  const [image, setImage] = useState<ImageDto | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);

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

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  function handleFileSelected(file: File | undefined): void {
    if (!file) return;

    const validationError = validateImageFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setSelectedFile(file);
  }

  async function handleUpload(): Promise<void> {
    if (!selectedFile) return;

    setUploading(true);
    setError(null);
    try {
      const uploaded = await authApi.uploadProfileImage(selectedFile);
      setImage(uploaded);
      setSelectedFile(null);
    } catch (e) {
      setError(getGenericErrorMessage(e));
    } finally {
      setUploading(false);
    }
  }

  function cancelSelection(): void {
    setSelectedFile(null);
    setError(null);
  }

  async function handleDelete(): Promise<void> {
    if (!image) return;

    const confirmed = await confirm(
      'Are you sure you want to delete your profile image?',
      'Delete profile image',
    );
    if (!confirmed) return;

    setDeleting(true);
    setError(null);
    try {
      await authApi.deleteProfileImage();
      setImage(null);
    } catch (e) {
      setError(getGenericErrorMessage(e));
    } finally {
      setDeleting(false);
    }
  }

  const busy = loading || uploading || deleting;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      <Typography variant="h6" component="h2">
        Profile image
      </Typography>

      {error ? <Alert severity="error" sx={{ width: '100%' }}>{error}</Alert> : null}

      <Box
        sx={{
          width: 160,
          height: 160,
          borderRadius: '50%',
          overflow: 'hidden',
          border: '1px solid',
          boxShadow: '3px 2px 5px black',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(255,255,255,0.35)',
        }}
      >
        {loading ? (
          <CircularProgress size={24} />
        ) : previewUrl ? (
          <Box
            component="img"
            src={previewUrl}
            alt="Selected profile image preview"
            sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : image ? (
          <AppImage
            image={image}
            alt="Profile image"
            preset="profile"
            style={{ width: '160px', height: '160px', objectFit: 'cover' }}
          />
        ) : (
          <Typography variant="body2" color="text.secondary" textAlign="center" px={2}>
            No profile image
          </Typography>
        )}
      </Box>

      {selectedFile ? (
        <Typography variant="caption" color="text.secondary" sx={{ maxWidth: '100%', overflowWrap: 'anywhere' }}>
          {selectedFile.name}
        </Typography>
      ) : null}

      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
        <SingleImageUploadButton
          accept={ACCEPT_TYPES}
          disabled={busy}
          onFileSelected={handleFileSelected}
        />
        {selectedFile ? (
          <>
            <Button
              variant="contained"
              onClick={() => void handleUpload()}
              disabled={busy}
              startIcon={uploading ? <CircularProgress size={18} /> : undefined}
            >
              Save image
            </Button>
            <Button variant="outlined" onClick={cancelSelection} disabled={busy}>
              Cancel
            </Button>
          </>
        ) : image ? (
          <Button
            variant="outlined"
            color="error"
            onClick={() => void handleDelete()}
            disabled={busy}
            startIcon={deleting ? <CircularProgress size={18} /> : undefined}
          >
            Remove
          </Button>
        ) : null}
      </Box>
    </Box>
  );
}
