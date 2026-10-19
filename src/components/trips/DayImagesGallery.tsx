'use client';

import { Typography } from '@mui/material';
import { ImageGallery } from '@/components/images/ImageGallery';
import { NO_IMAGES_STYLE } from '@/constants/ui';
import type { TripGroupDay } from '@/types';

interface DayImagesGalleryProps {
  day: TripGroupDay;
  tripCoverImage?: string | null;
  tripTitle?: string;
}

/**
 * Day images use the same compact, cropped grid as the legacy trip gallery.
 * Keep the shared thumbnail and lightbox implementation.
 */
export function DayImagesGallery({ day }: DayImagesGalleryProps) {
  const dayLabel = day.title ?? `Day ${day.dayNumber}`;

  return day.images.length > 0 ? (
    <ImageGallery images={day.images} alt={dayLabel} preset="gallery" variant="grid" />
  ) : (
    <Typography variant="h6" style={NO_IMAGES_STYLE}>
      FOR THIS TRIP DON'T HAVE IMAGES
    </Typography>
  );
}
