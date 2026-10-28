'use client';

import { PointSection } from '@/components/trips/PointSection';
import type { CommentTarget } from '@/api/comments';
import type { TripPoint } from '@/types';

interface PointsSectionProps {
  points: TripPoint[];
  selectedPointIndex: number;
  pointCommentTarget: CommentTarget | null;
  togglePointComments: (target: CommentTarget) => void;
}

export function PointsSection({ points, selectedPointIndex, pointCommentTarget, togglePointComments }: PointsSectionProps) {
  if (points.length === 0 || selectedPointIndex < 0) return null;
  const point = points[selectedPointIndex];
  if (!point) return null;

  return (
    <section id="point-section-add" aria-label="Selected trip point">
      <PointSection point={point} pointCommentTarget={pointCommentTarget} togglePointComments={togglePointComments} />
    </section>
  );
}
