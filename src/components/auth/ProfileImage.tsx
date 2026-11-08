'use client';

import { useCallback, useEffect, useState, type ChangeEvent } from 'react';
import { Alert, Box, Button, CircularProgress, IconButton, Tooltip, Typography } from '@mui/material';
import HighlightOffSharpIcon from '@mui/icons-material/HighlightOffSharp';
import { authApi } from '@/api/auth';
import { AppImage } from '@/components/images/AppImage';
import CustomFileUploadButton from '@/components/CustomFileUploadButton';
import { useConfirm } from '@/components/common/ConfirmDialog';
import { getGenericErrorMessage } from '@/lib/errors';
import { validateImageFile } from '@/lib/images/validate';
import { ACCEPTED_IMAGE_MIME_TYPES, PROFILE_IMAGE_MAX_FILES } from '@/constants/images';
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

  function handleFilesChange(event: ChangeEvent<HTMLInputElement>): void {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = '';
    if (!file) return;

    const validationError = validateImageFile(file);
    if (validationError) {
      setSelectedFile(null);
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
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5, width: '100%' }}>
      {error ? <Alert severity="error" sx={{ width: '100%' }}>{error}</Alert> : null}

      <Box
        sx={{
          position: 'relative',
          display: loading || !!previewUrl || !!image ? 'flex' : 'none',
          width: 'min(300px, 75vw)',
          height: 'min(300px, 75vw)',
          borderRadius: '50%',
          overflow: 'hidden',
          border: '1px solid',
          boxShadow: '3px 2px 5px black',
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
            width={300}
            height={300}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <Typography variant="body2" color="text.secondary" textAlign="center" px={2}>
            No profile image
          </Typography>
        )}
        {!loading && image && !previewUrl ? (
          <Tooltip title="Remove profile image" arrow>
            <IconButton
              aria-label="Remove profile image"
              onClick={() => void handleDelete()}
              disabled={busy}
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                zIndex: 1,
                backgroundColor: 'white',
                color: 'error.main',
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.85)' },
              }}
            >
              <HighlightOffSharpIcon />
            </IconButton>
          </Tooltip>
        ) : null}
      </Box>

      {selectedFile ? (
        <Typography variant="caption" color="text.secondary" sx={{ maxWidth: '100%', overflowWrap: 'anywhere' }}>
          {selectedFile.name}
        </Typography>
      ) : null}

      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
        <CustomFileUploadButton
          handleFilesChange={handleFilesChange}
          images={[]}
          fileSelected={[]}
          iconFotoCamera={false}
          maxImages={PROFILE_IMAGE_MAX_FILES}
          accept={ACCEPT_TYPES}
          multiple={false}
          disabled={busy}
        />
        {selectedFile ? (
          <>
            <Button
              variant="contained"
              onClick={() => void handleUpload()}
              disabled={busy}
              startIcon={uploading ? <CircularProgress size={18} /> : undefined}
              sx={{ ':hover': { backgroundColor: '#4daf30' } }}
            >
              Save image
            </Button>
            <Button
              variant="contained"
              onClick={cancelSelection}
              disabled={busy}
              sx={{
                backgroundColor: 'rgb(194 194 224)',
                color: 'black',
                ':hover': { color: 'rgb(248 245 245)' },
              }}
            >
              Cancel
            </Button>
          </>
        ) : null}
      </Box>
    </Box>
  );
}
