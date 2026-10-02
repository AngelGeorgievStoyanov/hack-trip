import { z } from 'zod';
import { positiveIdParam, userIdParam } from './shared';

/**
 * Route-parameter schemas (API_CONTRACT.md §18.7). All `.strict()`.
 */

export const userIdParams = z.object({ userId: userIdParam }).strict();
export const tripIdParams = z.object({ id: positiveIdParam }).strict();
export const tripIdOnlyParams = z.object({ tripId: positiveIdParam }).strict();
export const tripDayParams = z
  .object({ tripId: positiveIdParam, dayId: positiveIdParam })
  .strict();
export const dayIdParams = z.object({ dayId: positiveIdParam }).strict();
export const pointIdParams = z.object({ pointId: positiveIdParam }).strict();
export const pointImageParams = z
  .object({ pointId: positiveIdParam, imageId: positiveIdParam })
  .strict();
export const imageIdParams = z.object({ imageId: positiveIdParam }).strict();
export const commentIdParams = z.object({ commentId: positiveIdParam }).strict();
export const tripGroupIdParams = z.object({ tripGroupId: positiveIdParam }).strict();
