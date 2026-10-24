'use client';

import { useState } from 'react';
import { Box } from '@mui/material';
import { AppImage } from './AppImage';
import { ImageLightbox } from './ImageLightbox';
import { EngagementBar } from '@/components/social/EngagementBar';
import { SocialConfigStatus } from '@/components/social/SocialConfigStatus';
import { useSocialConfig } from '@/hooks/useSocialConfig';
import type { CommentTarget } from '@/api/comments';
import type { ImagePresetName } from '@/constants/images/presets';
import type { SocialImageDto, SocialState } from '@/types';

interface ImageEngagementTarget {
  targetType: 'trip' | 'point';
  targetId: number;
  social: SocialState;
  commentTarget: CommentTarget;
  commentsOpen: boolean;
  onToggleComments: () => void;
}

interface ImageGalleryProps {
  images: SocialImageDto[];
  alt: string;
  preset?: ImagePresetName;
  leadPreset?: ImagePresetName;
  variant?: 'row' | 'stack' | 'grid';
  engagementTarget: ImageEngagementTarget;
}

export function ImageGallery({
  images,
  alt,
  preset = 'gallery',
  leadPreset,
  variant = 'row',
  engagementTarget,
}: ImageGalleryProps) {
  const [index, setIndex] = useState<number | null>(null);
  const socialConfig = useSocialConfig();

  if (images.length === 0) {
    return null;
  }

  return (
    <>
      <SocialConfigStatus isLoading={socialConfig.isLoading} error={socialConfig.error} />
      <Box
        sx={{
          display: variant === 'grid' ? 'grid' : 'flex',
          gridTemplateColumns:
            variant === 'grid'
               ? `repeat(${Math.min(images.length, 3)}, minmax(0, 1fr))`
              : undefined,
          flexDirection: variant === 'stack' ? 'column' : 'row',
          flexWrap: 'wrap',
          alignItems: 'flex-start',
          gap: variant === 'grid' ? '4px' : '0.5rem',
          width: variant === 'grid' ? '100%' : undefined,
          maxWidth: variant === 'grid' ? 520 : undefined,
          height: 'auto',
          '@media (max-width: 600px)': {
            width: variant === 'grid' ? '100%' : undefined,
          },
        }}
      >
        {images.map((image, position) => (
          <Box
            key={image.id}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.25rem',
              minWidth: 0,
              position: 'relative',
              ...(variant === 'grid' ? { width: '100%' } : {}),
            }}
          >
            <Box sx={{ position: 'relative', width: variant === 'grid' ? '100%' : undefined }}>
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
                  width: variant === 'grid' ? '100%' : undefined,
                  lineHeight: 0,
                  borderRadius: 1,
                  overflow: 'hidden',
                  ...(variant === 'grid'
                    ? { aspectRatio: '1 / 1', position: 'relative' }
                    : {}),
                  '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main' },
                }}
              >
                <AppImage
                  image={image}
                  alt={alt}
                  preset={position === 0 && leadPreset ? leadPreset : preset}
                  fill={variant === 'grid'}
                  style={variant === 'grid' ? { objectFit: 'cover' } : undefined}
                />
              </Box>
              <EngagementBar
                targetType={engagementTarget.targetType}
                targetId={engagementTarget.targetId}
                social={engagementTarget.social}
                commentTarget={engagementTarget.commentTarget}
                showConfigStatus={false}
                presentation="overlay"
                commentsOpen={engagementTarget.commentsOpen}
                onToggleComments={engagementTarget.onToggleComments}
              />
            </Box>
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
