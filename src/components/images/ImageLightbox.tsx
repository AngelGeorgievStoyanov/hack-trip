'use client';

import { useEffect, useRef } from 'react';
import { Box, Dialog, IconButton, Typography } from '@mui/material';
import { AppImage } from './AppImage';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CloseIcon from '@mui/icons-material/Close';
import { LIGHTBOX_SWIPE_THRESHOLD_PX } from '@/constants/ui';
import type { ImageDto } from '@/types';

interface ImageLightboxProps {
  images: readonly ImageDto[];
  index: number | null;
  alt: string;
  onIndexChange: (index: number) => void;
  onClose: () => void;
}

const controlSx = {
  color: '#fff',
  bgcolor: 'rgba(0, 0, 0, 0.45)',
  '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.7)' },
};

export function ImageLightbox({
  images,
  index,
  alt,
  onIndexChange,
  onClose,
}: ImageLightboxProps) {
  const touchStartX = useRef<number | null>(null);
  const count = images.length;
  const current = index !== null ? images[index] : undefined;

  useEffect(() => {
    if (index === null || count < 2) {
      return;
    }
    const startIndex = index;
    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === 'ArrowRight') {
        onIndexChange((startIndex + 1) % count);
      }
      if (event.key === 'ArrowLeft') {
        onIndexChange((startIndex - 1 + count) % count);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [index, count, onIndexChange]);

  return (
    <Dialog
      open={current !== undefined}
      onClose={onClose}
      fullScreen
      slotProps={{ paper: { sx: { bgcolor: 'rgba(17, 17, 17, 0.96)' } } }}
    >
      <Box
        sx={{ position: 'relative', width: '100%', height: '100%' }}
        onTouchStart={(event) => {
          touchStartX.current = event.touches[0].clientX;
        }}
        onTouchEnd={(event) => {
          const startX = touchStartX.current;
          touchStartX.current = null;
          if (startX === null || index === null || count < 2) {
            return;
          }
          const delta = event.changedTouches[0].clientX - startX;
          if (Math.abs(delta) < LIGHTBOX_SWIPE_THRESHOLD_PX) {
            return;
          }
          onIndexChange(
            delta < 0 ? (index + 1) % count : (index - 1 + count) % count,
          );
        }}
      >
        {current && index !== null ? (
          <>
            <IconButton
              aria-label="Close image"
              onClick={onClose}
              sx={{ position: 'absolute', top: 8, right: 8, zIndex: 2, ...controlSx }}
            >
              <CloseIcon />
            </IconButton>
            <Typography
              variant="caption"
              sx={{
                position: 'absolute',
                top: 18,
                left: '50%',
                transform: 'translateX(-50%)',
                color: '#fff',
                zIndex: 2,
              }}
            >
              {index + 1} / {count}
            </Typography>
            {count > 1 ? (
              <>
                <IconButton
                  aria-label="Previous image"
                  onClick={() => onIndexChange((index - 1 + count) % count)}
                  sx={{
                    position: 'absolute',
                    left: 8,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    zIndex: 2,
                    ...controlSx,
                  }}
                >
                  <ChevronLeftIcon />
                </IconButton>
                <IconButton
                  aria-label="Next image"
                  onClick={() => onIndexChange((index + 1) % count)}
                  sx={{
                    position: 'absolute',
                    right: 8,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    zIndex: 2,
                    ...controlSx,
                  }}
                >
                  <ChevronRightIcon />
                </IconButton>
              </>
            ) : null}
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                display: 'grid',
                placeItems: 'center',
                p: { xs: 1, sm: 3 },
              }}
            >
              <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
                <AppImage
                  src={current.url}
                  alt={alt}
                  fill
                  sizes="100vw"
                  style={{ objectFit: 'contain' }}
                />
              </Box>
            </Box>
          </>
        ) : null}
      </Box>
    </Dialog>
  );
}
