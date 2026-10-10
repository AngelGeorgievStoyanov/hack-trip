'use client';

import type { CSSProperties } from 'react';
import { Typography, Card, CardContent } from '@mui/material';
import { ImageGallery } from '@/components/images/ImageGallery';
import { AppImage } from '@/components/images/AppImage';
import { NO_IMAGES_STYLE } from '@/constants/ui';
import type { TripGroupDay } from '@/types';

interface DayImagesGalleryProps {
  day: TripGroupDay;
  tripCoverImage?: string | null;
  tripTitle?: string;
}

const DAY_LABEL_STYLE: CSSProperties = { marginBottom: '1rem' };
const GALLERY_WRAPPER: CSSProperties = { width: '100%' };

/**
 * Day Images Gallery — standalone visual section.
 * Pure image grid using ImageGallery (no social actions).
 * Falls back to trip cover image if day has no images.
 */
export function DayImagesGallery({ day, tripCoverImage, tripTitle }: DayImagesGalleryProps) {
  const dayLabel = day.title ?? `Day ${day.dayNumber}`;

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" component="h2" style={DAY_LABEL_STYLE}>
          {dayLabel}
        </Typography>
        <div style={GALLERY_WRAPPER}>
          {day.images.length > 0 ? (
            <ImageGallery images={day.images} alt={dayLabel} preset="gallery" />
          ) : tripCoverImage ? (
            <AppImage src={tripCoverImage} alt={tripTitle ?? dayLabel} preset="tripCard" />
          ) : (
            <Typography variant="h6" style={NO_IMAGES_STYLE}>
              FOR THIS TRIP DON'T HAVE IMAGES
            </Typography>
          )}
        </div>
      </CardContent>
    </Card>
  );
}