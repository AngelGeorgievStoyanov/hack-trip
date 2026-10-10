'use client';

import { useEffect, useRef } from 'react';
import { Typography, Card, CardContent } from '@mui/material';
import { ImageGallery } from '@/components/images/ImageGallery';
import { ExpandableText } from '@/components/common/ExpandableText';
import { CARD_BORDER, CARD_SHADOW, COLORS } from '@/constants/ui';
import type { TripPoint } from '@/types';

interface PointSectionProps {
  points: TripPoint[];
  selectedPointIndex: number;
  onPointChange: (index: number) => void;
}

const POINT_CARD_STYLE = {
  display: 'flex',
  flexDirection: 'column' as const,
  alignItems: 'center',
  maxWidth: '500px',
  margin: '20px auto',
  padding: '25px 0px 0px 0px',
  backgroundColor: COLORS.cardBackground,
  boxShadow: CARD_SHADOW,
  border: CARD_BORDER,
  borderRadius: '0px',
};

const POINT_NAME_STYLE = {
  margin: '0 0 0.35em',
  padding: '0px 15px',
  fontSize: '1.5rem',
  fontWeight: 500,
};

const POINT_NOTE_STYLE = {
  margin: '0 0 0.35em',
  padding: '0px 25px',
  fontSize: '0.875rem',
};

export function PointSection({ points, selectedPointIndex, onPointChange }: PointSectionProps) {
  const point = points[selectedPointIndex];
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const section = document.getElementById('point-section');
    section?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [selectedPointIndex]);

  if (points.length === 0) {
    return null;
  }

  return (
    <section id="point-section" aria-label="Trip points">
      <Card style={POINT_CARD_STYLE}>
        <CardContent>
          <Typography variant="h5" component="div" style={POINT_NAME_STYLE}>
            Point name: {point.name}
          </Typography>

          {point.images.length > 0 ? (
            <ImageGallery images={point.images} alt={point.name} preset="tripPointThumb" variant="row" />
          ) : (
            <Typography variant="body2" style={POINT_NOTE_STYLE}>
              FOR THIS POINT DON'T HAVE IMAGES
            </Typography>
          )}

          {point.lat === null || point.lng === null ? (
            <Typography variant="body2" style={POINT_NOTE_STYLE}>
              NO MAP MARKER ADDED
            </Typography>
          ) : null}

          {point.description ? (
            <div style={{ padding: '0 15px', marginTop: '10px' }}>
              <ExpandableText text={point.description} />
            </div>
          ) : null}
        </CardContent>
      </Card>
    </section>
  );
}