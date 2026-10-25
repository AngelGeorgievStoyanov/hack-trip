'use client';

import { Typography } from '@mui/material';
import { ImageGallery } from '@/components/images/ImageGallery';
import type { CommentTarget } from '@/api/comments';
import { NO_IMAGES_STYLE } from '@/constants/ui';
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
      activeCommentTarget={tripCommentTarget}
      onToggleComments={toggleTripComments}
    />
  ) : (
    <Typography variant="h6" style={NO_IMAGES_STYLE}>
      FOR THIS TRIP DON'T HAVE IMAGES
    </Typography>
  );
}
