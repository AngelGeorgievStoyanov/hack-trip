'use client';

import { Box, Typography } from '@mui/material';
import { PointCard } from '@/components/points/PointCard';
import type { TripPoint } from '@/types';

interface PointListProps {
  points: TripPoint[];
  onEdit: (point: TripPoint) => void;
  onDelete: (point: TripPoint) => void;
  onMove: (point: TripPoint, direction: 'up' | 'down') => void;
  disabled?: boolean;
}

export function PointList({
  points,
  onEdit,
  onDelete,
  onMove,
  disabled = false,
}: PointListProps) {
  const sortedPoints = [...points].sort(
    (first, second) => Number(first.pointNumber) - Number(second.pointNumber),
  );

  if (sortedPoints.length === 0) {
    return <Typography variant="h5">ADD YOUR FIRST POINT</Typography>;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 0 }}>
      {sortedPoints.map((point) => (
        <PointCard
          key={point.id}
          point={point}
          length={sortedPoints.length}
          onEdit={onEdit}
          onDelete={onDelete}
          onMove={onMove}
          disabled={disabled}
        />
      ))}
    </Box>
  );
}
