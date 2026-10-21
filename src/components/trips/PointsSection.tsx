'use client';

import { PointSection } from '@/components/trips/PointSection';
import type { TripPoint } from '@/types';

interface PointsSectionProps {
  points: TripPoint[];
  selectedPointIndex: number;
}

export function PointsSection({ points, selectedPointIndex }: PointsSectionProps) {
  if (points.length === 0) {
    return null;
  }

  // Legacy rendered exactly one point card at a time — the point selected via the
  // stepper or a map marker — inside `#point-section-add` next to the map.
  const safeIndex = Math.min(Math.max(selectedPointIndex, 0), points.length - 1);
  const point = points[safeIndex];

  if (!point) {
    return null;
  }

  return (
    <section id="point-section-add" aria-label="Selected trip point">
      <PointSection point={point} />
    </section>
  );
}