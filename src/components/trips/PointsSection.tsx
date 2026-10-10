'use client';

import { PointSection } from '@/components/trips/PointSection';
import type { TripPoint } from '@/types';

interface PointsSectionProps {
  points: TripPoint[];
  selectedPointIndex: number;
  onPointChange: (index: number) => void;
}

export function PointsSection({ points, selectedPointIndex, onPointChange }: PointsSectionProps) {
  if (points.length === 0) {
    return null;
  }

  return (
    <PointSection
      points={points}
      selectedPointIndex={selectedPointIndex}
      onPointChange={onPointChange}
    />
  );
}