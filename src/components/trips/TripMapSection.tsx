'use client';

import { useCallback } from 'react';
import { Box, Button, MobileStepper, useTheme } from '@mui/material';
import { TripMap } from '@/components/maps/TripMap';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { BREAKPOINTS, CARD_BORDER, CARD_SHADOW, mediaDown } from '@/constants/ui';
import type { TripPoint } from '@/types';

interface TripMapSectionProps {
  points: TripPoint[];
  /** Index of the currently selected point in `points` (0..n-1). */
  selectedPointIndex: number;
  onPointChange: (index: number) => void;
}

/**
 * Client Component: the legacy map was paired with a point stepper that stepped through the
 * day's points and scrolled the matching point card into view.
 */
export function TripMapSection({ points, selectedPointIndex, onPointChange }: TripMapSectionProps) {
  const theme = useTheme();
  const focusPointId = points[selectedPointIndex]?.id ?? null;

  const hasNext = selectedPointIndex < points.length - 1;
  const hasPrev = selectedPointIndex > 0;

  const handleMarkerSelect = useCallback(
    (pointId: number) => {
      const index = points.findIndex((point) => point.id === pointId);
      if (index >= 0) {
        onPointChange(index);
      }
    },
    [points, onPointChange],
  );

  return (
    <Box
      sx={{
        boxSizing: 'content-box',
        height: 'fit-content',
        width: '100%',
        maxWidth: 600,
        border: CARD_BORDER,
        boxShadow: CARD_SHADOW,
        [mediaDown(BREAKPOINTS.smallPhone)]: {
          display: 'flex',
          flexDirection: 'column',
          width: '94vw',
        },
      }}
    >
      {points.length > 1 ? (
        <MobileStepper
          variant="progress"
          steps={points.length}
          position="static"
          activeStep={selectedPointIndex}
          sx={{ maxWidth: 600, flexGrow: 1, maxHeight: '25px' }}
          nextButton={
            <Button
              size="small"
              onClick={() => onPointChange(selectedPointIndex + 1)}
              disabled={!hasNext}
            >
              Next
              {theme.direction === 'rtl' ? <ChevronLeftIcon fontSize="inherit" /> : <ChevronRightIcon fontSize="inherit" />}
            </Button>
          }
          backButton={
            <Button
              size="small"
              onClick={() => onPointChange(selectedPointIndex - 1)}
              disabled={!hasPrev}
            >
              {theme.direction === 'rtl' ? <ChevronRightIcon fontSize="inherit" /> : <ChevronLeftIcon fontSize="inherit" />}
              Back
            </Button>
          }
        />
      ) : null}
      <TripMap
        points={points}
        focusPointId={focusPointId}
        onMarkerSelect={handleMarkerSelect}
      />
    </Box>
  );
}
