'use client';

import { useState } from 'react';
import { Box } from '@mui/material';
import { AppImage } from './AppImage';
import { ImageLightbox } from './ImageLightbox';
import { EngagementBar } from '@/components/social/EngagementBar';
import type { ImagePresetName } from '@/constants/images/presets';
import type { SocialImageDto } from '@/types';

interface SocialImageGalleryProps {
  images: SocialImageDto[];
  alt: string;
  preset?: ImagePresetName;
  leadPreset?: ImagePresetName;
  variant?: 'row' | 'stack';
}

export function SocialImageGallery({
  images,
  alt,
  preset = 'gallery',
  leadPreset,
  variant = 'row',
}: SocialImageGalleryProps) {
  const [index, setIndex] = useState<number | null>(null);

  if (images.length === 0) {
    return null;
  }

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: variant === 'stack' ? 'column' : 'row',
          flexWrap: 'wrap',
          alignItems: 'flex-start',
          gap: '0.5rem',
        }}
      >
        {images.map((image, position) => (
          <Box
            key={image.id}
            sx={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}
          >
            <Box
              component="button"
              type="button"
              onClick={() => setIndex(position)}
              aria-label={`Open image ${position + 1} of ${images.length}: ${alt}`}
              sx={{
                p: 0,
                m: 0,
                border: 0,
                bgcolor: 'transparent',
                cursor: 'pointer',
                display: 'block',
                lineHeight: 0,
                borderRadius: 1,
                overflow: 'hidden',
                '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main' },
              }}
            >
              <AppImage
                image={image}
                alt={alt}
                preset={position === 0 && leadPreset ? leadPreset : preset}
              />
            </Box>
            <EngagementBar
              targetType="image"
              targetId={image.id}
              social={image.social}
              commentTarget={{ type: 'image', imageId: image.id }}
            />
          </Box>
        ))}
      </Box>
      <ImageLightbox
        images={images}
        index={index}
        alt={alt}
        onIndexChange={setIndex}
        onClose={() => setIndex(null)}
      />
    </>
  );
}
