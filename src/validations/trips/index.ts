import { z } from 'zod';
import { idList, optionalInt, optionalText, patchText, trimmedString } from '../shared';

/**
 * Trip request schemas (API_CONTRACT.md §18.3). All `.strict()`.
 */

export const tripWriteSchema = z
  .object({
    title: trimmedString({ min: 1, max: 60 }),
    description: optionalText({ max: 2000 }),
    group: trimmedString({ min: 1, max: 45 }),
    transport: trimmedString({ min: 1, max: 45 }),
  })
  .strict();

export const tripListQuerySchema = z
  .object({
    page: optionalInt({ min: 1, max: 10000 }),
    limit: optionalInt({ min: 1, max: 100 }),
    search: trimmedString({ min: 1, max: 200 }).optional(),
    group: trimmedString({ min: 1, max: 45 }).optional(),
    transport: trimmedString({ min: 1, max: 45 }).optional(),
    sort: z.enum(['newest', 'oldest']).optional(),
  })
  .strict();

export const dayCreateSchema = z
  .object({
    dayNumber: optionalInt({ min: 1, max: 500 }),
    title: optionalText({ min: 1, max: 60 }),
    description: optionalText({ max: 2000 }),
  })
  .strict();

export const dayUpdateSchema = z
  .object({
    title: patchText({ min: 1, max: 60 }),
    description: patchText({ max: 2000 }),
  })
  .strict()
  .refine(
    (data) => data.title !== undefined || data.description !== undefined,
    'At least one field is required',
  );

export const dayReorderSchema = z
  .object({
    dayIds: idList({ min: 1, max: 500 }),
  })
  .strict();

export const pointReorderSchema = z
  .object({
    pointIds: idList({ min: 0, max: 500 }),
  })
  .strict();
