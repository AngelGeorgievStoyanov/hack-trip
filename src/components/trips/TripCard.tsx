'use client';

import { useRef, useState, type CSSProperties, type ChangeEvent } from 'react';
import Link from 'next/link';
import {
  Box,
  Button,
  Card,
  CardContent,
  MobileStepper,
  Pagination,
  PaginationItem,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import type { PaginationRenderItemParams } from '@mui/material/Pagination';
import { AppImage } from '@/components/images/AppImage';
import FavoriteIcon from '@mui/icons-material/Favorite';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import {
  BREAKPOINTS,
  COLORS,
  LIGHTBOX_SWIPE_THRESHOLD_PX,
  cardStyle,
  maxWidthQuery,
} from '@/constants/ui';
import { buildTripUrl } from '@/lib/tripUrl';
import type { TripGroupResponse } from '@/types';

interface TripCardProps {
  tripGroup: TripGroupResponse;
}

const IMAGE_STYLE: CSSProperties = {
  width: '300px',
  maxWidth: '100%',
  height: '200px',
  objectFit: 'cover',
};

const HEAD_BLOCK_SX = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'space-evenly',
} as const;

const CARD_CONTENT_SX = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  alignItems: 'center',
} as const;

const DESCRIPTION_SX = {
  display: '-webkit-box',
  WebkitBoxOrient: 'vertical',
  WebkitLineClamp: 2,
  overflow: 'hidden',
  textAlign: 'center',
} as const;

/**
 * Client Component: the legacy card kept the selected day and the gallery step in component
 * state. The group response already carries every day, so switching days or images never
 * issues a request (no N+1). One card serves the trips list, top trips, my trips and
 * favorites.
 */
export function TripCard({ tripGroup }: TripCardProps) {
  const days = tripGroup.days;
  const [dayNumber, setDayNumber] = useState(days[0]?.dayNumber ?? 1);
  const [activeStep, setActiveStep] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const isMobile = useMediaQuery(maxWidthQuery(BREAKPOINTS.tripCard));
  const theme = useTheme();

  // `tripGroup.days` already carries every day, so resolving the selected day is pure
  // local state: switching days or images never issues an API request (no N+1).
  const selectedDay = days.find((day) => day.dayNumber === dayNumber);
  // Position of the selected day in the positional MUI pagination (0 when missing).
  const selectedPage = days.findIndex((day) => day.dayNumber === dayNumber) + 1;
  const images = selectedDay?.images ?? [];
  const maxSteps = images.length;

  // Likes belong to the whole trip group, so they must not change when the day changes.
  const groupLikes = tripGroup.social.likes;

  // The DETAILS link keeps the day the visitor is looking at. `:id` is always the
  // tripGroupId; the day travels as `?day=N` and missing numbers (e.g. Day 1, Day 3,
  // Day 5) are preserved because we use the real dayNumber.
  const detailsHref = selectedDay
    ? buildTripUrl(tripGroup.id, selectedDay.dayNumber)
    : buildTripUrl(tripGroup.id);

  // The day-level title/description win; the trip group has no separate title/description.
  const title = selectedDay?.title ?? 'Trip';
  const description = selectedDay?.description ?? null;

  function handleDayChange(_event: ChangeEvent<unknown>, value: number): void {
    // `value` is the visible page position (1..days.length); store the real `dayNumber`
    // so gaps (Day 1, Day 3, Day 5) keep working. The legacy card reset the image step
    // whenever the day changed.
    setDayNumber(days[value - 1]?.dayNumber ?? value);
    setActiveStep(0);
  }

  function handleNext(): void {
    setActiveStep((step) => Math.min(step + 1, maxSteps - 1));
  }

  function handleBack(): void {
    setActiveStep((step) => Math.max(step - 1, 0));
  }

  function handleTouchEnd(): void {
    const start = touchStartX.current;
    const end = touchEndX.current;
    touchStartX.current = null;
    touchEndX.current = null;
    if (start === null || end === null) {
      return;
    }
    const distance = start - end;
    if (distance > LIGHTBOX_SWIPE_THRESHOLD_PX) {
      handleNext();
    } else if (distance < -LIGHTBOX_SWIPE_THRESHOLD_PX) {
      handleBack();
    }
  }

  const noImagesMessage = 'No images for this trip group. Please check back later.';

  // MUI pages are positional (1..days.length); the label renders the real `dayNumber`
  // so groups with gaps (Day 1, Day 3, Day 5) stay selectable.
  function renderPaginationItem(item: PaginationRenderItemParams) {
    return item.type === 'page' ? (
      <PaginationItem {...item} page={days[(item.page ?? 1) - 1]?.dayNumber ?? item.page} />
    ) : (
      <PaginationItem {...item} />
    );
  }

  // Legacy behavior for a requested day that does not exist: the card body is replaced by
  // "No trip on N day". The day is never fetched from the API.
  if (!selectedDay) {
    return (
      <Card sx={[cardStyle, { height: isMobile ? 'fit-content' : 'auto', maxHeight: '500px' }]}>
        <Box sx={[HEAD_BLOCK_SX, { height: isMobile ? 'auto' : '-webkit-fill-available' }]}>
          <Typography gutterBottom variant="h5" sx={{ padding: '0px 15px' }}>
            No trip on {dayNumber} day
          </Typography>
        </Box>
        <CardContent sx={CARD_CONTENT_SX}>
          {days.length > 1 ? (
            <Pagination
              count={days.length}
              variant="outlined"
              shape="rounded"
              // A missing day has no position; clamp into the valid page range.
              page={Math.max(selectedPage, 1)}
              onChange={handleDayChange}
              renderItem={renderPaginationItem}
              sx={{ marginTop: 2 }}
            />
          ) : null}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={[cardStyle, { height: isMobile ? 'fit-content' : 'auto' }]}>
      <Box sx={[HEAD_BLOCK_SX, { height: isMobile ? 'auto' : '-webkit-fill-available' }]}>
        <Typography gutterBottom variant="h5" sx={{ padding: '0px 15px' }}>
          Title: {title}
        </Typography>

        {description ? (
          <Typography variant="body2" sx={[DESCRIPTION_SX, { padding: '0px 15px' }]}>
            Description:  {description}
          </Typography>
        ) : null}
      </Box>

      {images.length > 0 ? (
        <>
          <Box
            sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}
            onTouchStart={(event) => {
              touchEndX.current = null;
              touchStartX.current = event.touches[0].clientX;
            }}
            onTouchMove={(event) => {
              touchEndX.current = event.touches[0].clientX;
            }}
            onTouchEnd={handleTouchEnd}
          >
            <AppImage
              image={images[activeStep]}
              useThumbnail
              alt={title}
              width={300}
              height={200}
              style={IMAGE_STYLE}
            />
          </Box>

          <MobileStepper
            variant="dots"
            steps={maxSteps}
            position="static"
            activeStep={activeStep}
            sx={{ width: '-webkit-fill-available', flexGrow: 1, maxHeight: '20px' }}
            nextButton={
              <Button size="small" onClick={handleNext} disabled={activeStep === maxSteps - 1}>
                Next
                {theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
              </Button>
            }
            backButton={
              <Button size="small" onClick={handleBack} disabled={activeStep === 0}>
                {theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
                Back
              </Button>
            }
          />
        </>
      ) : (
        noImagesMessage
      )}

      <CardContent sx={CARD_CONTENT_SX}>
        {groupLikes === 0 ? (
          <Typography
            sx={{ margin: '10px', display: 'flex', alignItems: 'center' }}
            gutterBottom
            variant="h6"
            component="div"
          >
            LIKES:
            <Box component="span" sx={{ color: COLORS.brand, display: 'inline-flex' }}>
              <FavoriteIcon fontSize="inherit" />
            </Box>
          </Typography>
        ) : (
          <Typography sx={{ margin: '10px' }} gutterBottom variant="h6" component="div">
            LIKES: {groupLikes}
          </Typography>
        )}

        <Button
          component={Link}
          href={detailsHref}
          variant="contained"
          sx={{ ':hover': { background: '#4daf30' }, padding: '10px 50px' }}
        >
          DETAILS
        </Button>

        {days.length > 1 ? (
          <Pagination
            count={days.length}
            variant="outlined"
            shape="rounded"
            page={selectedPage}
            onChange={handleDayChange}
            renderItem={renderPaginationItem}
            sx={{ marginTop: 2 }}
          />
        ) : null}
      </CardContent>
    </Card>
  );
}
