'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Box, Button, MobileStepper, useMediaQuery, useTheme } from '@mui/material';
import { GoogleMapView, type GoogleMapMarker } from '@/components/maps/GoogleMapView';
import { toMapPosition, type MapPosition } from '@/lib/maps';
import {
  MAP_DEFAULT_ZOOM,
  MAP_TRIP_HEIGHT,
  MAP_TRIP_OPTIONS,
  MAP_TRIP_WIDTH,
} from '@/constants/maps';
import { BREAKPOINTS, CARD_BORDER, CARD_SHADOW, maxWidthQuery, mediaDown } from '@/constants/ui';
import type { TripPoint } from '@/types';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

interface TripMapSectionProps {
  points: TripPoint[];
  /** Index of the currently selected point in `points` (0..n-1). */
  selectedPointIndex: number;
  onPointChange: (index: number) => void;
}

/**
 * Keeps the trip-specific stepper and selection behavior together while using the shared
 * GoogleMapView for all actual map rendering.
 */
export function TripMapSection({ points, selectedPointIndex, onPointChange }: TripMapSectionProps) {
  const theme = useTheme();
  const focusPointId = points[selectedPointIndex]?.id ?? null;
  const stepperRef = useRef<HTMLDivElement | null>(null);
  const previousPointIndex = useRef(selectedPointIndex);
  const isSmallScreen = useMediaQuery(maxWidthQuery(BREAKPOINTS.tripDetails));
  const [selectedMarker, setSelectedMarker] = useState<GoogleMapMarker | null>(null);

  const markers = useMemo<GoogleMapMarker[]>(
    () =>
      points.flatMap((point, index) => {
        const position = toMapPosition(point);
        return position
          ? [{ id: point.id, title: point.name, label: String(index + 1), position }]
          : [];
      }),
    [points],
  );
  const path = useMemo<MapPosition[]>(() => markers.map((marker) => marker.position), [markers]);

  const hasNext = selectedPointIndex < points.length - 1;
  const hasPrev = selectedPointIndex > 0;

  const handleMarkerSelect = useCallback(
    (marker: GoogleMapMarker | null) => {
      setSelectedMarker(marker);
      if (marker) {
        const index = points.findIndex((point) => point.id === Number(marker.id));
        if (index >= 0) onPointChange(index);
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
    if (previous === selectedPointIndex || !isSmallScreen) return;
    const stepper = stepperRef.current;
    if (!stepper) return;
    const dayNav = document.querySelector('[data-trip-days-nav="true"]');
    const stickyHeight = dayNav instanceof HTMLElement ? dayNav.getBoundingClientRect().height : 0;
    const expectedTop = Math.round(stickyHeight + 10);
    const actualTop = Math.round(stepper.getBoundingClientRect().top);
    if (Math.abs(actualTop - expectedTop) <= 2) return;
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
      {markers.length > 0 ? (
        <GoogleMapView
          markers={markers}
          path={path}
          height={MAP_TRIP_HEIGHT}
          maxWidth={MAP_TRIP_WIDTH}
          options={MAP_TRIP_OPTIONS as google.maps.MapOptions}
          fitBounds
          focusMarkerId={focusPointId}
          focusZoom={MAP_DEFAULT_ZOOM}
          selectedMarkerId={selectedMarker?.id ?? null}
          onMarkerSelect={handleMarkerSelect}
          renderInfoWindow={(marker) => <Link href={`/points/${marker.id}`}>{marker.title}</Link>}
        />
      ) : null}
    </Box>
  );
}
