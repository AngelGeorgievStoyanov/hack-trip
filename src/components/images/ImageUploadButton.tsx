'use client';

import { useRef, useState } from 'react';
import { Button, CircularProgress } from '@mui/material';
import { ACCEPTED_IMAGE_MIME_TYPES } from '@/constants/images';
import { validateImageFile } from '@/lib/images/validate';

interface ImageUploadButtonProps {
  onUpload: (file: File) => Promise<unknown>;
  disabled?: boolean;
  label?: string;
}

export function ImageUploadButton({ onUpload, disabled, label = 'Add image' }: ImageUploadButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleChange(file: File | undefined): Promise<void> {
    if (!file) {
      return;
    }
    const validationError = validateImageFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }
    setUploading(true);
    setError(null);
    try {
      await onUpload(file);
    } catch {
      setError('Upload failed.');
    } finally {
      setUploading(false);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  }

  return (
    <>
      <Button
        component="label"
        variant="outlined"
        disabled={disabled || uploading}
        startIcon={uploading ? <CircularProgress size={16} /> : undefined}
      >
        {label}
        <input
          ref={inputRef}
          type="file"
          accept={(ACCEPTED_IMAGE_MIME_TYPES as readonly string[]).join(',')}
          hidden
          onChange={(e) => void handleChange(e.target.files?.[0])}
        />
      </Button>
      {error ? <span role="alert">{error}</span> : null}
    </>
  );
}
