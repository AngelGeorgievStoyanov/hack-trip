'use client';

import { Box } from '@mui/material';
import { SocialObjectPlaceholder } from '@/components/placeholders';
import { ImageGallery } from '@/components/images/ImageGallery';
import type { CommentTarget } from '@/api/comments';
import type { TripGroupDay } from '@/types';

interface DayImagesGalleryProps {
  day: TripGroupDay;
  tripCommentTarget: CommentTarget | null;
  toggleTripComments: (target: CommentTarget) => void;
  tripCoverImage?: string | null;
  tripTitle?: string;
}

export function DayImagesGallery({
  day,
  tripCommentTarget,
  toggleTripComments,
  tripCoverImage,
  tripTitle,
}: DayImagesGalleryProps) {
  const dayLabel = day.title ?? `Day ${day.dayNumber}`;

  return day.images.length > 0 ? (
    <ImageGallery
      images={day.images}
      alt={dayLabel}
      preset="gallery"
      variant="grid"
      prioritizeFirstImage
      activeCommentTarget={tripCommentTarget}
      onToggleComments={toggleTripComments}
    />
  ) : (
    <Box sx={{ width: '50%', maxWidth: 280, aspectRatio: '1 / 1', mx: 'auto' }}>
      <SocialObjectPlaceholder />
    </Box>
  );
}
