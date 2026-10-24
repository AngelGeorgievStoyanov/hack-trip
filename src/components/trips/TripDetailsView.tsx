'use client';

import { useEffect, useState } from 'react';
import { TripDaysNav } from '@/components/trips/TripDaysNav';
import { TripDetails } from '@/components/trips/TripDetails';
import { TripMapSection } from '@/components/trips/TripMapSection';
import { PointsSection } from '@/components/trips/PointsSection';
import { DayImagesGallery } from '@/components/trips/DayImagesGallery';
import { CommentsSection } from '@/components/comments/CommentsSection';
import { Box, useMediaQuery } from '@mui/material';
import { hasCoordinates } from '@/lib/maps';
import { buildTripUrl } from '@/lib/tripUrl';
import { tripRepresentativeImage } from '@/lib/images/representative';
import { useTripGroup } from '@/hooks/useTripGroup';
import { BREAKPOINTS, maxWidthQuery, mediaDown } from '@/constants/ui';
import type { TripGroupResponse } from '@/types';

interface TripDetailsViewProps {
  trip: TripGroupResponse;
  initialDayNumber: number;
}

/**
 * Trip Details view owns the active day in client state.
 * The group is fetched once (`GET /trips/:tripGroupId`); switching days swaps the
 * already-loaded day without a new API request, while `TripGroup.social` stays the
 * single source for Trip Like / Favorite / Report and comments stay day-level.
 */
export function TripDetailsView({ trip, initialDayNumber }: TripDetailsViewProps) {
  // The server render is anonymous, so the authenticated read is what restores the
  // viewer's own like / favorite / report state after a reload.
  const { data: tripGroup } = useTripGroup(trip);
  const [activeDayNumber, setActiveDayNumber] = useState(initialDayNumber);
  const [selectedPointIndex, setSelectedPointIndex] = useState(0);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const isMobile = useMediaQuery(maxWidthQuery(BREAKPOINTS.tripDetails));

  // The server resolves `?day=N` once per navigation; adopt it so the view opens
  // on the requested day without extra requests. Client day switches below own
  // `activeDayNumber`, so the global Trip Group social state is never remounted.
  useEffect(() => {
    setActiveDayNumber(initialDayNumber);
    setSelectedPointIndex(0);
  }, [initialDayNumber]);

  const group = tripGroup ?? trip;
  const day = group.days.find((current) => current.dayNumber === activeDayNumber) ?? group.days[0];
  const pointsHaveCoords = day.points.some(hasCoordinates);

  function handleSelectDay(dayNumber: number): void {
    setActiveDayNumber(dayNumber);
    setSelectedPointIndex(0);
    window.history.replaceState(null, '', buildTripUrl(group.id, dayNumber));
  }

  return (
    <>
      <TripDaysNav
        tripGroupId={group.id}
        days={group.days.map((current) => current.dayNumber)}
        selectedDay={day.dayNumber}
        onSelect={handleSelectDay}
      />

      {/* Legacy trip row: the info panel sits beside the day image gallery
          (space-around), stacked with the gallery above the panel below 900px,
          exactly like the master `TripDetails` container. */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: isMobile ? 'column-reverse' : 'row',
          gap: isMobile ? 0 : 3,
          width: '100%',
          maxWidth: 1200,
          justifyContent: 'space-around',
          alignItems: 'center',
          flexWrap: 'wrap',
          mb: 3,
        }}
      >
        {/* Trip Group social stays mounted here so Like/Favorite survive day switches. */}
        <TripDetails
          tripGroup={group}
          day={day}
          commentsOpen={commentsOpen}
          onToggleComments={() => setCommentsOpen((previous) => !previous)}
        />

        {/* Remounted per day so the lightbox index resets with the day content below. */}
        <DayImagesGallery
          key={day.dayNumber}
          day={day}
          tripCoverImage={tripRepresentativeImage(group)}
        />
      </Box>

      {/* The comment list is a sibling of the trip information card, never a child of it,
          so the card only owns the show/hide toggle. */}
      {commentsOpen ? (
        <Box sx={{ width: '100%' }}>
          <CommentsSection
            target={{ type: 'day', tripGroupId: group.id, tripId: day.id }}
            initialCommentsCount={day.social.comments.count}
          />
        </Box>
      ) : null}

      {pointsHaveCoords ? (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            width: '100%',
            maxWidth: 1200,
            padding: '50px 50px',
            boxSizing: 'border-box',
            gap: '24px',
            [mediaDown(BREAKPOINTS.tripDetails)]: {
              flexDirection: 'column',
              alignItems: 'center',
              padding: '0px',
              gap: 0,
            },
          }}
        >
          <TripMapSection
            key={`day-map-${day.id}`}
            points={day.points}
            selectedPointIndex={selectedPointIndex}
            onPointChange={setSelectedPointIndex}
          />

          {day.points.length > 0 ? (
            <PointsSection points={day.points} selectedPointIndex={selectedPointIndex} />
          ) : null}
        </Box>
      ) : (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            width: '100%',
            maxWidth: 1200,
            padding: '50px 50px',
            boxSizing: 'border-box',
            [mediaDown(BREAKPOINTS.tripDetails)]: {
              flexDirection: 'column',
              alignItems: 'center',
              padding: '0px',
            },
          }}
        >
          {day.points.length > 0 ? (
            <PointsSection points={day.points} selectedPointIndex={selectedPointIndex} />
          ) : null}
        </Box>
      )}


    </>
  );
}
