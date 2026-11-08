'use client';

import { useCallback, useEffect, useMemo, useState, type ChangeEvent } from 'react';
import { Box, CircularProgress, IconButton, Tooltip, Typography } from '@mui/material';
import HighlightOffSharpIcon from '@mui/icons-material/HighlightOffSharp';
import { AppImage } from '@/components/images/AppImage';
import { authApi } from '@/api/auth';
import CustomFileUploadButton from '@/components/CustomFileUploadButton';
import { useConfirm } from '@/components/common/ConfirmDialog';
import { useNotification } from '@/components/common/NotificationProvider';
import { getGenericErrorMessage } from '@/lib/errors';
import { ACCEPTED_IMAGE_MIME_TYPES, PROFILE_IMAGE_MAX_FILES } from '@/constants/images';
import type { ImageDto } from '@/types';

const ACCEPT_TYPES = (ACCEPTED_IMAGE_MIME_TYPES as readonly string[]).join(',');

interface ProfileImageProps {
  selectedFile: File | null;
  onSelectedFileChange: (file: File | null) => void;
}

export function ProfileImage({ selectedFile, onSelectedFileChange }: ProfileImageProps) {
  const { confirm } = useConfirm();
  const notification = useNotification();
  const [image, setImage] = useState<ImageDto | null>(null);
  const previewUrl = useMemo(() => selectedFile ? URL.createObjectURL(selectedFile) : null, [selectedFile]);

  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setImage(await authApi.getProfileImage());
    } catch (e) {
      notification.error(getGenericErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [notification]);

  useEffect(() => {
    if (!selectedFile) void load();
  }, [load, selectedFile]);

  function handleFilesChange(event: ChangeEvent<HTMLInputElement>): void {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = '';
    if (!file) return;

    onSelectedFileChange(file);
  }

  function cancelSelection(): void {
    onSelectedFileChange(null);
  }

  async function handleDelete(): Promise<void> {
    if (!image) return;

    const confirmed = await confirm(
      'Are you sure you want to delete your profile image?',
      'Delete profile image',
    );
    if (!confirmed) return;

    setDeleting(true);
    try {
      await authApi.deleteProfileImage();
      setImage(null);
      notification.success('Profile image deleted.');
    } catch (e) {
      notification.error(getGenericErrorMessage(e));
    } finally {
      setDeleting(false);
    }
  }

  const busy = loading || deleting;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5, width: '100%' }}>
      <Box
        sx={{
          position: 'relative',
          display: loading || !!image ? 'flex' : 'none',
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
        {!loading && image ? (
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

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: '100%', alignItems: 'center' }}>
        <CustomFileUploadButton
          handleFilesChange={handleFilesChange}
          images={[]}
          fileSelected={selectedFile ? [selectedFile] : []}
          iconFotoCamera={false}
          maxImages={PROFILE_IMAGE_MAX_FILES}
          accept={ACCEPT_TYPES}
          multiple={false}
          disabled={busy}
        />
        {selectedFile ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%', maxWidth: 360, p: 1, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
            <Box component="img" src={URL.createObjectURL(selectedFile)} alt="Selected profile image preview" sx={{ width: 55, height: 45, objectFit: 'cover', borderRadius: 1 }} />
            <Box component="span" sx={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selectedFile.name}</Box>
            <Tooltip title="Remove selected image" arrow>
              <IconButton aria-label="Remove selected image" onClick={cancelSelection} disabled={busy} size="small">
                <HighlightOffSharpIcon />
              </IconButton>
            </Tooltip>
          </Box>
        ) : null}
      </Box>
    </Box>
  );
}
