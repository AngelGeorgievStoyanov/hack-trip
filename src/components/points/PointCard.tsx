'use client';

import { Box, Button, Card, IconButton, Typography } from '@mui/material';
import { BUTTON_STYLES, CARD_BORDER, CARD_SHADOW, COLORS, UI_SHAPE } from '@/constants/ui';
import { GoogleMapView } from '@/components/maps/GoogleMapView';
import { ArrowCircleDownIcon, ArrowCircleUpIcon } from '@/constants/icons';
import type { TripPoint } from '@/types';

interface PointCardProps {
  point: TripPoint;
  length: number;
  onEdit: (point: TripPoint) => void;
  onDelete: (point: TripPoint) => void;
  onMove: (point: TripPoint, direction: 'up' | 'down') => void;
  disabled?: boolean;
}

export function PointCard({
  point,
  length,
  onEdit,
  onDelete,
  onMove,
  disabled = false,
}: PointCardProps) {
  const hasCoordinates = point.lat !== null && point.lng !== null;
  const position = hasCoordinates ? { lat: point.lat as number, lng: point.lng as number } : null;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <IconButton
        aria-label={`Move point ${point.pointNumber} up`}
        onClick={() => onMove(point, 'up')}
        disabled={disabled || !point.permissions.canEdit || point.pointNumber <= 1}
        sx={{ visibility: point.pointNumber > 1 ? 'visible' : 'hidden', p: 0.25 }}
      >
        <ArrowCircleUpIcon />
      </IconButton>

      <Card
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: 'min(300px, calc(100vw - 32px))',
          minWidth: { xs: 0, sm: 290 },
          maxWidth: 300,
          my: '10px',
          p: '15px 0',
          backgroundColor: COLORS.formPanelBackground,
          boxShadow: CARD_SHADOW,
          border: CARD_BORDER,
          borderRadius: UI_SHAPE.squareRadius,
        }}
      >
        <Typography gutterBottom component="h6" sx={{ px: '10px' }}>
          Point N {point.pointNumber}
        </Typography>
        <Typography gutterBottom component="h1" sx={{ px: '10px', overflowWrap: 'anywhere' }}>
          NAME: {point.name}
        </Typography>
        <Typography gutterBottom component="p" sx={{ px: '10px', overflowWrap: 'anywhere' }}>
          DESCRIPTION : {point.description ?? ''}
        </Typography>

        {position ? (
          <GoogleMapView
            center={position}
            zoom={14}
            height={150}
            markers={[
              {
                id: point.id,
                position,
                title: `Point №${point.pointNumber}`,
                label: String(point.pointNumber),
              },
            ]}
          />
        ) : (
          <Typography gutterBottom component="p">
            NO MAP MARKER ADDED
          </Typography>
        )}

        <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Button
            variant="contained"
            onClick={() => onEdit(point)}
            disabled={disabled || !point.permissions.canEdit}
            sx={{ ...BUTTON_STYLES.containedHover, m: '5px' }}
          >
            EDIT POINT
          </Button>
          <Button
            variant="contained"
            onClick={() => onDelete(point)}
            disabled={disabled || !point.permissions.canDelete}
            sx={{ ...BUTTON_STYLES.dangerHover, m: '5px' }}
          >
            DELETE POINT
          </Button>
        </Box>
      </Card>

      <IconButton
        aria-label={`Move point ${point.pointNumber} down`}
        onClick={() => onMove(point, 'down')}
        disabled={disabled || !point.permissions.canEdit || point.pointNumber >= length}
        sx={{ visibility: point.pointNumber < length ? 'visible' : 'hidden', p: 0.25 }}
      >
        <ArrowCircleDownIcon />
      </IconButton>
    </Box>
  );
}
