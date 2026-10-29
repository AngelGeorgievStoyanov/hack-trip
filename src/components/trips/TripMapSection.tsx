'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Box, Button, MobileStepper, useMediaQuery, useTheme } from '@mui/material';
import { GoogleMapView, type GoogleMapMarker } from '@/components/maps/GoogleMapView';
import { toMapPosition, type MapPosition } from '@/lib/maps';
import { MAP_DEFAULT_CENTER, MAP_DEFAULT_ZOOM, MAP_TRIP_HEIGHT, MAP_TRIP_OPTIONS, MAP_TRIP_WIDTH } from '@/constants/maps';
import { BREAKPOINTS, CARD_BORDER, CARD_SHADOW, maxWidthQuery, mediaDown } from '@/constants/ui';
import type { TripPoint } from '@/types';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';

interface TripMapSectionProps {
  points: TripPoint[];
  /** Fallback coordinates for the selected trip day when no points have coordinates. */
  dayPosition: MapPosition | null;
  /** -1 means all-points overview; otherwise this is the index in the original points array. */
  selectedPointIndex: number;
  onPointChange: (index: number) => void;
}

export function TripMapSection({ points, dayPosition, selectedPointIndex, onPointChange }: TripMapSectionProps) {
  const theme = useTheme();
  const selectedPoint = selectedPointIndex >= 0 ? points[selectedPointIndex] : undefined;
  const focusPointId = selectedPoint && toMapPosition(selectedPoint) ? selectedPoint.id : null;
  const stepperRef = useRef<HTMLDivElement | null>(null);
  const previousPointIndex = useRef(selectedPointIndex);
  const isSmallScreen = useMediaQuery(maxWidthQuery(BREAKPOINTS.tripDetails));
  const [selectedMarker, setSelectedMarker] = useState<GoogleMapMarker | null>(null);

  const markers = useMemo<GoogleMapMarker[]>(
    () => points.flatMap((point, index) => {
      const position = toMapPosition(point);
      return position ? [{ id: point.id, title: point.name, label: String(index + 1), position }] : [];
    }),
    [points],
  );
  const path = useMemo<MapPosition[]>(() => markers.map((marker) => marker.position), [markers]);
  const navigablePointIndexes = useMemo(
    () => points.flatMap((point, index) => (toMapPosition(point) ? [index] : [])),
    [points],
  );
  const currentNavigableIndex = navigablePointIndexes.indexOf(selectedPointIndex);
  const isOverview = currentNavigableIndex < 0;
  const showingPointMarkers = markers.length > 0;
  const mapMarkers = showingPointMarkers
    ? markers
    : dayPosition
      ? [{ id: 'day-location', title: 'Trip day', position: dayPosition }]
      : [];
  const hasNext = isOverview
    ? navigablePointIndexes.length > 0
    : currentNavigableIndex < navigablePointIndexes.length - 1;
  const hasPrev = !isOverview;

  useEffect(() => {
    if (isOverview) setSelectedMarker(null);
  }, [isOverview]);

  const handleMarkerSelect = useCallback((marker: GoogleMapMarker | null) => {
    setSelectedMarker(marker);
    if (marker) {
      const index = points.findIndex((point) => point.id === Number(marker.id));
      if (index >= 0) onPointChange(index);
    }
  }, [points, onPointChange]);

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
    <Box sx={{
      boxSizing: 'content-box',
      height: 'fit-content',
      width: '100%',
      maxWidth: 600,
      border: CARD_BORDER,
      boxShadow: CARD_SHADOW,
      [mediaDown(BREAKPOINTS.smallPhone)]: { display: 'flex', flexDirection: 'column', width: '94vw' },
    }}>
      {showingPointMarkers ? (
        <MobileStepper
          ref={stepperRef}
          variant="progress"
          steps={navigablePointIndexes.length}
          position="static"
          activeStep={isOverview ? 0 : currentNavigableIndex + 1}
          sx={{ maxWidth: 600, flexGrow: 1, maxHeight: '25px' }}
          nextButton={
            <Button
              size="small"
              onClick={() => onPointChange(navigablePointIndexes[isOverview ? 0 : currentNavigableIndex + 1])}
              disabled={!hasNext}
            >
              Next
              {theme.direction === 'rtl' ? <KeyboardArrowLeftIcon fontSize="inherit" /> : <KeyboardArrowRightIcon fontSize="inherit" />}
            </Button>
          }
          backButton={
            <Button
              size="small"
              onClick={() => onPointChange(currentNavigableIndex <= 0 ? -1 : navigablePointIndexes[currentNavigableIndex - 1])}
              disabled={!hasPrev}
            >
              {theme.direction === 'rtl' ? <KeyboardArrowRightIcon fontSize="inherit" /> : <KeyboardArrowLeftIcon fontSize="inherit" />}
              Back
            </Button>
          }
        />
      ) : null}
      <GoogleMapView
        markers={mapMarkers}
        path={showingPointMarkers ? path : []}
        center={showingPointMarkers ? MAP_DEFAULT_CENTER : dayPosition ?? MAP_DEFAULT_CENTER}
        height={MAP_TRIP_HEIGHT}
        maxWidth={MAP_TRIP_WIDTH}
        options={MAP_TRIP_OPTIONS as google.maps.MapOptions}
        // Fit the full route only in overview mode. Fallback day/Sofia maps have no route.
        fitBounds={showingPointMarkers && isOverview}
        fitBoundsTrigger={isOverview ? 'overview' : selectedPointIndex}
        focusMarkerId={showingPointMarkers ? focusPointId : null}
        focusZoom={MAP_DEFAULT_ZOOM}
        selectedMarkerId={showingPointMarkers ? selectedMarker?.id ?? null : null}
        onMarkerSelect={showingPointMarkers ? handleMarkerSelect : undefined}
        renderInfoWindow={showingPointMarkers ? (marker) => <Link href={`/points/${marker.id}`}>{marker.title}</Link> : undefined}
      />
    </Box>
  );
}
