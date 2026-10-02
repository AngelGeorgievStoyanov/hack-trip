import { z } from 'zod';
import { optionalText, patchNumber, patchText, positiveId, requiredNumber, trimmedString } from '../shared';

/**
 * Point request schemas (API_CONTRACT.md §18.4). All `.strict()`.
 */

export const pointCreateSchema = z
  .object({
    dayId: positiveId,
    title: trimmedString({ min: 1, max: 100 }),
    description: optionalText({ max: 1050 }),
    latitude: requiredNumber({ min: -90, max: 90 }),
    longitude: requiredNumber({ min: -180, max: 180 }),
  })
  .strict();

export const pointUpdateSchema = z
  .object({
    title: trimmedString({ min: 1, max: 100 }).optional(),
    description: patchText({ max: 1050 }),
    latitude: patchNumber({ min: -90, max: 90 }),
    longitude: patchNumber({ min: -180, max: 180 }),
  })
  .strict()
  .refine(
    (data) =>
      data.title !== undefined ||
      data.description !== undefined ||
      data.latitude !== undefined ||
      data.longitude !== undefined,
    'At least one field is required',
  );
