'use client';

import { Button } from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';

interface SingleImageUploadButtonProps {
  accept: string;
  disabled?: boolean;
  onFileSelected: (file: File | undefined) => void;
}

export function SingleImageUploadButton({
  accept,
  disabled = false,
  onFileSelected,
}: SingleImageUploadButtonProps) {
  return (
    <Button
      component="label"
      variant="contained"
      startIcon={<PhotoCamera />}
      disabled={disabled}
      sx={{ alignSelf: 'flex-start' }}
    >
      Choose image
      <input
        hidden
        type="file"
        accept={accept}
        onChange={(event) => {
          onFileSelected(event.currentTarget.files?.[0]);
          event.currentTarget.value = '';
        }}
      />
    </Button>
  );
}
