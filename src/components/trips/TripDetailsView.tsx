'use client';

import { useEffect, useState } from 'react';
import type { CommentTarget } from '@/api/comments';
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
import { TripGroupSocialActions } from '@/components/social/TripGroupSocialActions';
import {
  BREAKPOINTS,
  CARD_BORDER,
  CARD_SHADOW,
  COLORS,
  maxWidthQuery,
  mediaDown,
  pageBackgroundStyle,
} from '@/constants/ui';
import type { TripGroupResponse } from '@/types';

interface TripDetailsViewProps {
  trip: TripGroupResponse;
  initialDayNumber: number;
}

const SHELL_PADDING =
  typeof pageBackgroundStyle.padding === 'string' ? pageBackgroundStyle.padding : '30px';
const SHELL_BLEED = `-${SHELL_PADDING}`;

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
  const [tripCommentTarget, setTripCommentTarget] = useState<CommentTarget | null>(null);
  const [pointCommentTarget, setPointCommentTarget] = useState<CommentTarget | null>(null);
  const [tripGroupCommentsOpen, setTripGroupCommentsOpen] = useState(false);
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

  const dayTarget: CommentTarget = { type: 'day', tripGroupId: group.id, tripId: day.id };

  const isTargetOpen = (activeTarget: CommentTarget | null, target: CommentTarget): boolean => {
    if (!activeTarget) {
      return false;
    }
    if (activeTarget.type === 'day' && target.type === 'day') {
      return activeTarget.tripGroupId === target.tripGroupId && activeTarget.tripId === target.tripId;
    }
    if (activeTarget.type === 'point' && target.type === 'point') {
      return activeTarget.pointId === target.pointId;
    }
    if (activeTarget.type === 'image' && target.type === 'image') {
      return activeTarget.imageId === target.imageId;
    }
    return false;
  };

  const toggleTripComments = (target: CommentTarget): void => {
    setTripCommentTarget((previous) => (isTargetOpen(previous, target) ? null : target));
  };

  const togglePointComments = (target: CommentTarget): void => {
    setPointCommentTarget((previous) => (isTargetOpen(previous, target) ? null : target));
  };

  const commentCountForTarget = (target: CommentTarget): number => {
    switch (target.type) {
      case 'day':
        return day.social.comments.count;
      case 'point': {
        const point = day.points.find((current) => current.id === target.pointId);
        return point?.social.comments.count ?? 0;
      }
      case 'image': {
        const image = [
          ...day.images,
          ...day.points.flatMap((current) => current.images),
        ].find((current) => current.id === target.imageId);
        return image?.social.comments.count ?? 0;
      }
      default:
        return 0;
    }
  };

  function handleSelectDay(dayNumber: number): void {
    setActiveDayNumber(dayNumber);
    setSelectedPointIndex(0);
    setTripCommentTarget(null);
    setPointCommentTarget(null);
    setTripGroupCommentsOpen(false);
    window.history.replaceState(null, '', buildTripUrl(group.id, dayNumber));
  }

  return (
    <>
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 'appBar',
          width: `calc(100% + ${SHELL_PADDING} + ${SHELL_PADDING})`,
          marginLeft: SHELL_BLEED,
          marginRight: SHELL_BLEED,
          marginTop: SHELL_BLEED,
          pb: 1,
          backgroundColor: 'transparent',
        }}
      >
        <TripDaysNav
          tripGroupId={group.id}
          days={group.days.map((current) => current.dayNumber)}
          selectedDay={day.dayNumber}
          onSelect={handleSelectDay}
        />
        <Box
          sx={{
            display: 'inline-flex',
            maxWidth: 'calc(100% - 32px)',
            ml: { xs: 2, sm: 3 },
            mt: 1,
            px: 0.75,
            py: 0.5,
            border: CARD_BORDER,
            borderRadius: 2.5,
            backgroundColor: COLORS.cardBackground,
            boxShadow: CARD_SHADOW,
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
          }}
        >
          <TripGroupSocialActions
            tripGroupId={group.id}
            social={group.social}
            shareTitle={day.title ?? group.days[0]?.title ?? 'Trip'}
            shareText={day.description ?? undefined}
            shareImage={tripRepresentativeImage(group)}
            open={tripGroupCommentsOpen}
            onToggle={() => setTripGroupCommentsOpen((previous) => !previous)}
          />
        </Box>
      </Box>

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
          tripCommentTarget={tripCommentTarget}
          toggleTripComments={toggleTripComments}
        />

        {/* Remounted per day so the lightbox index resets with the day content below. */}
        <DayImagesGallery
          key={day.dayNumber}
          day={day}
          tripCommentTarget={tripCommentTarget}
          toggleTripComments={toggleTripComments}
          tripCoverImage={tripRepresentativeImage(group)}
        />
      </Box>

      {/* Trip comment section: day and its images share one stable display location. */}
      {tripCommentTarget ? (
        <Box sx={{ width: '100%' }}>
          <CommentsSection
            target={tripCommentTarget}
            initialCommentsCount={commentCountForTarget(tripCommentTarget)}
            defaultFormOpen={commentCountForTarget(tripCommentTarget) === 0}
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
            onPointChange={(index) => {
              setSelectedPointIndex(index);
              setPointCommentTarget(null);
            }}
          />

          {day.points.length > 0 ? (
            <PointsSection
              points={day.points}
              selectedPointIndex={selectedPointIndex}
              pointCommentTarget={pointCommentTarget}
              togglePointComments={togglePointComments}
            />
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
            <PointsSection
              points={day.points}
              selectedPointIndex={selectedPointIndex}
              pointCommentTarget={pointCommentTarget}
              togglePointComments={togglePointComments}
            />
          ) : null}
        </Box>
      )}

      {/* Point comment section: point and its images share one stable display location. */}
      {pointCommentTarget ? (
        <Box sx={{ width: '100%' }}>
          <CommentsSection
            target={pointCommentTarget}
            initialCommentsCount={commentCountForTarget(pointCommentTarget)}
            defaultFormOpen={commentCountForTarget(pointCommentTarget) === 0}
          />
        </Box>
      ) : null}


    </>
  );
}
