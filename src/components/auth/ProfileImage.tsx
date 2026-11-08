'use client';

import { useCallback, useEffect, useState } from 'react';
import CustomFileUploadButton from '@/components/CustomFileUploadButton';
import { ACCEPTED_IMAGE_MIME_TYPES, PROFILE_IMAGE_MAX_FILES } from '@/constants/images';
import { validateImageFile } from '@/lib/images/validate';
import { Box, CircularProgress, Dialog, IconButton, Tooltip } from '@mui/material';
import HighlightOffSharpIcon from '@mui/icons-material/HighlightOffSharp';
import CloseIcon from '@mui/icons-material/Close';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import { AppImage } from '@/components/images/AppImage';
import { authApi } from '@/api/auth';
import { useConfirm } from '@/components/common/ConfirmDialog';
import { useNotification } from '@/components/common/NotificationProvider';
import { getGenericErrorMessage } from '@/lib/errors';
import type { ImageDto } from '@/types';

const ACCEPT_TYPES = (ACCEPTED_IMAGE_MIME_TYPES as readonly string[]).join(',');

export function ProfileImage() {
  const { confirm } = useConfirm();
  const notification = useNotification();
  const [image, setImage] = useState<ImageDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setImage(await authApi.getProfileImage());
    } catch (error) {
      notification.error(getGenericErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [notification]);

  useEffect(() => {
    void load();
  }, [load]);

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
      setFullscreen(false);
      notification.success('Profile image deleted.');
    } catch (error) {
      notification.error(getGenericErrorMessage(error));
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', py: 2 }}><CircularProgress size={24} /></Box>;
  }

  if (!image) return null;

  return (
    <>
      <Box sx={{ position: 'relative', width: 'min(300px, 75vw)', height: 'min(300px, 75vw)', borderRadius: '50%', overflow: 'hidden', border: '1px solid', boxShadow: '3px 2px 5px black', mb: 1 }}>
        <Tooltip title="View profile image" arrow>
          <Box
            component="button"
            type="button"
            aria-label="View profile image full screen"
            onClick={() => setFullscreen(true)}
            sx={{ display: 'block', width: '100%', height: '100%', p: 0, border: 0, cursor: 'zoom-in', background: 'transparent' }}
          >
            <AppImage image={image} alt="Profile image" preset="profile" width={300} height={300} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <ZoomInIcon sx={{ position: 'absolute', bottom: 10, right: 12, color: 'white', filter: 'drop-shadow(0 1px 3px black)' }} />
          </Box>
        </Tooltip>
        <Tooltip title="Delete profile image" arrow>
          <IconButton
            aria-label="Delete profile image"
            onClick={() => void handleDelete()}
            disabled={deleting}
            sx={{ position: 'absolute', top: 7, right: 7, zIndex: 2, backgroundColor: 'white', color: 'error.main', '&:hover': { backgroundColor: 'rgba(255,255,255,0.85)' } }}
          >
            <HighlightOffSharpIcon />
          </IconButton>
        </Tooltip>
      </Box>
      <Dialog open={fullscreen} onClose={() => setFullscreen(false)} maxWidth="xl" fullWidth>
        <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', maxHeight: '90vh', p: 2, backgroundColor: 'black' }}>
          <IconButton aria-label="Close full screen image" onClick={() => setFullscreen(false)} sx={{ position: 'absolute', top: 8, right: 8, zIndex: 2, color: 'white', backgroundColor: 'rgba(0,0,0,0.45)' }}>
            <CloseIcon />
          </IconButton>
          <AppImage image={image} alt="Profile image full screen" useThumbnail={false} width={1600} height={1200} style={{ width: '100%', height: 'auto', maxHeight: '85vh', objectFit: 'contain' }} />
        </Box>
      </Dialog>
    </>
  );
}

interface ProfileImageUploadProps {
  selectedFile: File | null;
  onSelectedFileChange: (file: File | null) => void;
}

export function ProfileImageUpload({ selectedFile, onSelectedFileChange }: ProfileImageUploadProps) {
  const notification = useNotification();
  const previewUrl = selectedFile ? URL.createObjectURL(selectedFile) : null;

  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  function handleFilesChange(event: React.ChangeEvent<HTMLInputElement>): void {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = '';
    if (!file) return;
    const validationError = validateImageFile(file);
    if (validationError) {
      notification.error(validationError);
      return;
    }
    onSelectedFileChange(file);
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: '100%', alignItems: 'center' }}>
      <CustomFileUploadButton
        handleFilesChange={handleFilesChange}
        images={[]}
        fileSelected={selectedFile ? [selectedFile] : []}
        iconFotoCamera={false}
        maxImages={PROFILE_IMAGE_MAX_FILES}
        accept={ACCEPT_TYPES}
        multiple={false}
      />
      {selectedFile && previewUrl ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%', maxWidth: 360, p: 1, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
          <Box component="img" src={previewUrl} alt="Selected profile image preview" sx={{ width: 55, height: 45, objectFit: 'cover', borderRadius: 1 }} />
          <Box component="span" sx={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selectedFile.name}</Box>
          <Tooltip title="Remove selected image" arrow>
            <IconButton aria-label="Remove selected image" onClick={() => onSelectedFileChange(null)} size="small">
              <HighlightOffSharpIcon />
            </IconButton>
          </Tooltip>
        </Box>
      ) : null}
    </Box>
  );
}
