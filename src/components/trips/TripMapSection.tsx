'use client';

import { useCallback, useEffect, useRef } from 'react';
import { Box, Button, MobileStepper, useMediaQuery, useTheme } from '@mui/material';
import { TripMap } from '@/components/maps/TripMap';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { BREAKPOINTS, CARD_BORDER, CARD_SHADOW, maxWidthQuery, mediaDown } from '@/constants/ui';
import type { TripPoint } from '@/types';

interface TripMapSectionProps {
  points: TripPoint[];
  /** Index of the currently selected point in `points` (0..n-1). */
  selectedPointIndex: number;
  onPointChange: (index: number) => void;
}

/**
 * Client Component: the legacy map was paired with a point stepper that stepped through the
 * day's points. On small screens the stepper is scrolled just below the sticky day nav
 * (or the top of the page when there is no day nav), matching the legacy `mobileStepperRef`
 * scroll. `PointSection` never scrolls itself.
 */
export function TripMapSection({ points, selectedPointIndex, onPointChange }: TripMapSectionProps) {
  const theme = useTheme();
  const focusPointId = points[selectedPointIndex]?.id ?? null;
  const stepperRef = useRef<HTMLDivElement | null>(null);
  const previousPointIndex = useRef(selectedPointIndex);
  const isSmallScreen = useMediaQuery(maxWidthQuery(BREAKPOINTS.tripDetails));

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

  // Legacy positioned the stepper just below the sticky nav on small screens when the
  // selected point changed. Scroll only when the stepper is actually out of place, so
  // repeated Next/Back at the right position does not move the page.
  useEffect(() => {
    const previous = previousPointIndex.current;
    previousPointIndex.current = selectedPointIndex;
    if (previous === selectedPointIndex) {
      return;
    }
    if (!isSmallScreen) {
      return;
    }
    const stepper = stepperRef.current;
    if (!stepper) {
      return;
    }
    const dayNav = document.querySelector('[data-trip-days-nav="true"]');
    const stickyHeight = dayNav instanceof HTMLElement ? dayNav.getBoundingClientRect().height : 0;
    const expectedTop = Math.round(stickyHeight + 10);
    const actualTop = Math.round(stepper.getBoundingClientRect().top);
    if (Math.abs(actualTop - expectedTop) <= 2) {
      return;
    }
    const targetY = window.scrollY + actualTop - stickyHeight - 10;
    window.scrollTo({ top: Math.max(targetY, 0), behavior: 'smooth' });
  }, [isSmallScreen, selectedPointIndex]);

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
          ref={stepperRef}
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
