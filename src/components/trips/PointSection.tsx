'use client';

import { Typography, Card, CardContent } from '@mui/material';
import { ImageGallery } from '@/components/images/ImageGallery';
import { ExpandableText } from '@/components/common/ExpandableText';
import { CARD_BORDER, CARD_SHADOW, COLORS } from '@/constants/ui';
import type { TripPoint } from '@/types';

interface PointSectionProps {
  point: TripPoint;
}

// Legacy `TripDetailsPointCard` skin: card with centered content, translucent
// background, and the legacy border/shadow treatment.
const POINT_CARD_STYLE = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  maxWidth: '500px',
  margin: '20px auto',
  padding: '25px 0px 0px 0px',
  backgroundColor: COLORS.cardBackground,
  boxShadow: CARD_SHADOW,
  border: CARD_BORDER,
  borderRadius: '0px',
} as const;

const POINT_NAME_STYLE = {
  margin: '0 0 0.35em',
  padding: '0px 15px',
  fontSize: '1.5rem',
  fontWeight: 500,
} as const;

const POINT_NOTE_STYLE = {
  margin: '0 0 0.35em',
  padding: '0px 25px',
  fontSize: '0.875rem',
} as const;

export function PointSection({ point }: PointSectionProps) {
  if (!point) {
    return null;
  }

  return (
    <section aria-label="Trip points">
      <Card sx={POINT_CARD_STYLE}>
        <CardContent>
          <Typography variant="h5" component="div" sx={POINT_NAME_STYLE}>
            Point name: {point.name}
          </Typography>

          {point.images.length > 0 ? (
            <ImageGallery images={point.images} alt={point.name} preset="tripPointThumb" variant="grid" />
          ) : (
            <Typography variant="body2" sx={POINT_NOTE_STYLE}>
              FOR THIS POINT DON&apos;T HAVE IMAGES
            </Typography>
          )}

          {point.lat === null || point.lng === null ? (
            <Typography variant="body2" sx={POINT_NOTE_STYLE}>
              NO MAP MARKER ADDED
            </Typography>
          ) : null}

          {point.description ? (
            <div style={{ padding: '0px 15px', marginTop: '10px' }}>
              <ExpandableText text={point.description} />
            </div>
          ) : null}
        </CardContent>
      </Card>
    </section>
  );
}
