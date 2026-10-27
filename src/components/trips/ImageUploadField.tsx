'use client';

import { useEffect, useRef, useState, type ChangeEvent, type Dispatch, type SetStateAction } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import { DeleteAllImagesIcon, RemoveImageIcon } from '@/constants/icons';
import { TRIP_MAX_IMAGES } from '@/constants/trips';
import CustomFileUploadButton from '@/components/CustomFileUploadButton';

const MAX_SOURCE_FILE_SIZE = 25 * 1024 * 1024;
const MAX_COMPRESSED_FILE_SIZE = 2 * 1024 * 1024;
const JPEG_QUALITY = 0.88;

interface ImageUploadFieldProps {
  files: File[];
  setFiles: Dispatch<SetStateAction<File[]>>;
}

function loadImage(file: File): Promise<{ image: CanvasImageSource; width: number; height: number; cleanup: () => void }> {
  if (typeof createImageBitmap === 'function') {
    return createImageBitmap(file).then((bitmap) => ({
      image: bitmap,
      width: bitmap.width,
      height: bitmap.height,
      cleanup: () => bitmap.close(),
    }));
  }

  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => resolve({
      image,
      width: image.naturalWidth,
      height: image.naturalHeight,
      cleanup: () => URL.revokeObjectURL(url),
    });
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not read image'));
    };
    image.src = url;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Could not encode image'));
    }, 'image/jpeg', quality);
  });
}

async function compressImage(file: File): Promise<File> {
  const { image, width, height, cleanup } = await loadImage(file);
  try {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Windows Phone/i.test(
      window.navigator.userAgent,
    );
    const maxDimension = isMobile ? 2048 : 2560;
    const scale = Math.min(1, maxDimension / Math.max(width, height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(width * scale));
    canvas.height = Math.max(1, Math.round(height * scale));
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Image processing is unavailable');
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    let blob = await canvasToBlob(canvas, JPEG_QUALITY);
    for (const quality of [0.78, 0.68, 0.58, 0.48, 0.38, 0.28]) {
      if (blob.size <= MAX_COMPRESSED_FILE_SIZE) break;
      blob = await canvasToBlob(canvas, quality);
    }
    if (blob.size > MAX_COMPRESSED_FILE_SIZE) {
      throw new Error('Image could not be reduced below 2 MB');
    }

    const nameWithoutExtension = file.name.replace(/\.[^/.]+$/, '');
    return new File([blob], `${nameWithoutExtension}.jpg`, {
      type: 'image/jpeg',
      lastModified: file.lastModified,
    });
  } finally {
    cleanup();
  }
}

export default function ImageUploadField({ files, setFiles }: ImageUploadFieldProps) {
  const isMobileUpload = useMediaQuery('(max-width:599px)');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const processingRef = useRef(false);
  const [previews, setPreviews] = useState<Array<{ file: File; url: string }>>([]);

  useEffect(() => {
    const nextPreviews = files.map((file) => ({ file, url: URL.createObjectURL(file) }));
    setPreviews(nextPreviews);
    return () => nextPreviews.forEach(({ url }) => URL.revokeObjectURL(url));
  }, [files]);

  async function handleFilesChange(event: ChangeEvent<HTMLInputElement>): Promise<void> {
    const input = event.currentTarget;
    const incomingFiles = Array.from(input.files ?? []);
    input.value = '';
    if (incomingFiles.length === 0 || processingRef.current) return;

    processingRef.current = true;
    setProcessing(true);
    setErrorMessage(null);
    try {
      const currentCount = files.length;
      const remainingSlots = TRIP_MAX_IMAGES - currentCount;
      if (remainingSlots <= 0) {
        setErrorMessage(`${TRIP_MAX_IMAGES} images are the maximum number to upload.`);
        return;
      }

      const candidates = incomingFiles.slice(0, remainingSlots);
      const messages: string[] = [];
      if (incomingFiles.length > remainingSlots) {
        messages.push(`${TRIP_MAX_IMAGES} images are the maximum number to upload.`);
      }

      const accepted = candidates.filter((file) => {
        if (!file.type.startsWith('image/')) {
          messages.push(`“${file.name}” is not a supported image.`);
          return false;
        }
        if (file.size > MAX_SOURCE_FILE_SIZE) {
          messages.push(`“${file.name}” exceeds the 25 MB limit.`);
          return false;
        }
        return true;
      });

      const processed: File[] = [];
      for (const file of accepted) {
        try {
          processed.push(await compressImage(file));
        } catch {
          messages.push(`Could not process “${file.name}”. Choose another image.`);
        }
      }

      if (processed.length > 0) {
        setFiles((current) => [...current, ...processed].slice(0, TRIP_MAX_IMAGES));
      }
      if (messages.length > 0) setErrorMessage(messages.join(' '));
    } finally {
      processingRef.current = false;
      setProcessing(false);
    }
  }

  function removeFile(indexToRemove: number): void {
    setFiles((current) => current.filter((_, index) => index !== indexToRemove));
  }

  function removeAllFiles(): void {
    setFiles([]);
    setErrorMessage(null);
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, minWidth: 0, width: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
        <CustomFileUploadButton
          handleFilesChange={handleFilesChange}
          images={[]}
          fileSelected={files}
          iconFotoCamera={isMobileUpload}
          maxImages={TRIP_MAX_IMAGES}
          disabled={processing}
        />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {processing ? <CircularProgress size={18} aria-label="Processing images" /> : null}
          <Typography variant="overline" sx={{ mr: 1 }}>
            {files.length}/{TRIP_MAX_IMAGES} uploaded images
          </Typography>
          {files.length > 0 ? (
            isMobileUpload ? (
              <Tooltip title="REMOVE ALL IMAGES" arrow>
                <IconButton aria-label="Remove all images" color="primary" onClick={removeAllFiles} disabled={processing} size="large">
                  <DeleteAllImagesIcon fontSize="large" />
                </IconButton>
              </Tooltip>
            ) : (
              <Button variant="contained" onClick={removeAllFiles} disabled={processing}>
                Remove all images
              </Button>
            )
          ) : null}
        </Box>
      </Box>

      {errorMessage ? <Alert severity="warning" onClose={() => setErrorMessage(null)}>{errorMessage}</Alert> : null}

      {previews.length > 0 ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {previews.map(({ file, url }, index) => (
            <Box
              key={`${file.name}-${file.lastModified}-${index}`}
              sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0, p: 1, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}
            >
              <Box
                component="img"
                src={url}
                alt={file.name}
                sx={{ width: 48, height: 56, objectFit: 'cover', flexShrink: 0, borderRadius: 0.5 }}
              />
              <Typography variant="body2" title={file.name} sx={{ flex: 1, minWidth: 0, overflowWrap: 'anywhere' }}>
                {file.name}
              </Typography>
              <Tooltip title="Remove image" arrow>
                <IconButton aria-label={`Remove ${file.name}`} color="error" onClick={() => removeFile(index)} disabled={processing} size="small">
                  <RemoveImageIcon />
                </IconButton>
              </Tooltip>
            </Box>
          ))}
        </Box>
      ) : null}
    </Box>
  );
}
