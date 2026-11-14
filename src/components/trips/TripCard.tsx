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
import { AppImage } from '@/components/images';
import { SocialObjectPlaceholder } from '@/components/placeholders';
import FavoriteIcon from '@mui/icons-material/Favorite';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import {
  BREAKPOINTS,
  BUTTON_STYLES,
  LIGHTBOX_SWIPE_THRESHOLD_PX,
  cardStyle,
  maxWidthQuery,
} from '@/constants/ui';
import { buildTripUrl } from '@/lib/tripUrl';
import type { TripGroupResponse } from '@/types';

interface TripCardProps {
  tripGroup: TripGroupResponse;
  prioritizeImage?: boolean;
}

const IMAGE_STYLE: CSSProperties = {
  display: 'block',
  width: '100%',
  height: '200px',
  objectFit: 'cover',
};

const CARD_HEIGHT = '540px';

const HEAD_BLOCK_SX = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  height: '105px',
  minHeight: '105px',
  boxSizing: 'border-box',
  overflow: 'hidden',
} as const;

const IMAGE_FRAME_SX = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: '100%',
  height: '200px',
  minHeight: '200px',
  overflow: 'hidden',
  bgcolor: 'action.hover',
} as const;

const SOCIAL_COUNTS_SX = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  justifyContent: 'center',
  gap: 0.5,
  width: '100%',
  height: '58px',
  minHeight: '58px',
  px: 2,
  boxSizing: 'border-box',
} as const;

const STEPPER_SPACE_SX = {
  height: '20px',
  minHeight: '20px',
  width: '100%',
} as const;

const CARD_CONTENT_SX = {
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: 0,
  py: 1,
  '&:last-child': { pb: 1 },
} as const;

const DESCRIPTION_SX = {
  display: '-webkit-box',
  WebkitBoxOrient: 'vertical',
  WebkitLineClamp: 2,
  overflow: 'hidden',
  textAlign: 'center',
} as const;

/**
 * One shared card serves the home, trips, my trips and favorites lists.
 * The group response already carries every day, so changing days/images stays local
 * and does not issue additional API requests.
 */
export function TripCard({ tripGroup, prioritizeImage = false }: TripCardProps) {
  const days = tripGroup.days;
  const [dayNumber, setDayNumber] = useState(days[0]?.dayNumber ?? 1);
  const [activeStep, setActiveStep] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const isMobile = useMediaQuery(maxWidthQuery(BREAKPOINTS.tripCard));
  const theme = useTheme();

  const selectedDay = days.find((day) => day.dayNumber === dayNumber);
  const selectedPage = days.findIndex((day) => day.dayNumber === dayNumber) + 1;
  const images = selectedDay?.images ?? [];
  const maxSteps = images.length;

  // Group likes stay unchanged when the selected day changes.
  const groupLikes = tripGroup.social.likes;
  const dayLikes = selectedDay?.social.likes ?? 0;

  const detailsHref = selectedDay
    ? buildTripUrl(tripGroup.id, selectedDay.dayNumber)
    : buildTripUrl(tripGroup.id);

  const title = selectedDay?.title ?? 'Trip';
  const description = selectedDay?.description ?? null;

  function handleDayChange(_event: ChangeEvent<unknown>, value: number): void {
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

  function renderPaginationItem(item: PaginationRenderItemParams) {
    return item.type === 'page' ? (
      <PaginationItem {...item} page={days[(item.page ?? 1) - 1]?.dayNumber ?? item.page} />
    ) : (
      <PaginationItem {...item} />
    );
  }

  // Keep the legacy empty-day state for pagination gaps.
  if (!selectedDay) {
    return (
      <Card sx={[cardStyle, { height: isMobile ? 'fit-content' : 'auto', maxHeight: '500px' }]}>
        <Box sx={{ ...HEAD_BLOCK_SX, height: isMobile ? 'auto' : '-webkit-fill-available' }}>
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
    <Card
      sx={[
        cardStyle,
        {
          width: '352px',
          maxWidth: 'calc(100vw - 40px)',
          height: CARD_HEIGHT,
          minHeight: CARD_HEIGHT,
          maxHeight: CARD_HEIGHT,
          boxSizing: 'border-box',
          overflow: 'hidden',
        },
      ]}
    >
      <Box sx={HEAD_BLOCK_SX}>
        <Typography gutterBottom variant="h5" sx={{ padding: '0px 15px', textAlign: 'center' }}>
          Title: {title}
        </Typography>
        {description ? (
          <Typography variant="body2" sx={[DESCRIPTION_SX, { padding: '0px 15px' }]}>
            Description: {description}
          </Typography>
        ) : null}
      </Box>

      <Box
        sx={IMAGE_FRAME_SX}
        onTouchStart={(event) => {
          touchEndX.current = null;
          touchStartX.current = event.touches[0].clientX;
        }}
        onTouchMove={(event) => {
          touchEndX.current = event.touches[0].clientX;
        }}
        onTouchEnd={handleTouchEnd}
      >
        {images.length > 0 ? (
          <AppImage
            image={images[activeStep]}
            useThumbnail
            loading={prioritizeImage ? 'eager' : undefined}
            fetchPriority={prioritizeImage ? 'high' : undefined}
            alt={title}
            width={300}
            height={200}
            style={IMAGE_STYLE}
          />
        ) : (
          <SocialObjectPlaceholder key={dayNumber} />
        )}
      </Box>

      {images.length > 0 ? (
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
            </Button>
          }
        />
      ) : (
        <Box sx={STEPPER_SPACE_SX} />
      )}

      <Box aria-label="Trip and day likes" sx={SOCIAL_COUNTS_SX}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography component="span" variant="body2">
            Trip:
          </Typography>
          <FavoriteIcon fontSize="small" color="error" />
          {groupLikes > 0 ? (
            <Typography component="span" variant="body2">
              {groupLikes}
            </Typography>
          ) : null}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography component="span" variant="body2">
            Day:
          </Typography>
          <FavoriteIcon fontSize="small" color="error" />
          {dayLikes > 0 ? (
            <Typography component="span" variant="body2">
              {dayLikes}
            </Typography>
          ) : null}
        </Box>
      </Box>

      <CardContent sx={CARD_CONTENT_SX}>
        <Button
          component={Link}
          href={detailsHref}
          variant="contained"
          sx={{ ...BUTTON_STYLES.containedHover, padding: '10px 50px' }}
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
