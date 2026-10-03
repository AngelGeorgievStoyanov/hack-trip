import { z } from 'zod';
import {
  DAY_NUMBER_MAX,
  DAY_TITLE_MAX_LENGTH,
  TRIP_DESCRIPTION_MAX_LENGTH,
  TRIP_GROUP_MAX_LENGTH,
  TRIP_SEARCH_MAX_LENGTH,
  TRIP_TITLE_MAX_LENGTH,
  TRIP_TRANSPORT_MAX_LENGTH,
} from '@/constants/trips';
import { PAGE_MAX, TRIP_LIMIT_MAX } from '@/constants/ui';
import { idList, optionalInt, optionalText, patchText, trimmedString } from '../shared';

export const tripWriteSchema = z
  .object({
    title: trimmedString({ min: 1, max: TRIP_TITLE_MAX_LENGTH }),
    description: optionalText({ max: TRIP_DESCRIPTION_MAX_LENGTH }),
    group: trimmedString({ min: 1, max: TRIP_GROUP_MAX_LENGTH }),
    transport: trimmedString({ min: 1, max: TRIP_TRANSPORT_MAX_LENGTH }),
  })
  .strict();

export const tripListQuerySchema = z
  .object({
    page: optionalInt({ min: 1, max: PAGE_MAX }),
    limit: optionalInt({ min: 1, max: TRIP_LIMIT_MAX }),
    search: trimmedString({ min: 1, max: TRIP_SEARCH_MAX_LENGTH }).optional(),
    group: trimmedString({ min: 1, max: TRIP_GROUP_MAX_LENGTH }).optional(),
    transport: trimmedString({ min: 1, max: TRIP_TRANSPORT_MAX_LENGTH }).optional(),
    sort: z.enum(['newest', 'oldest']).optional(),
  })
  .strict();

export const dayCreateSchema = z
  .object({
    dayNumber: optionalInt({ min: 1, max: DAY_NUMBER_MAX }),
    title: optionalText({ min: 1, max: DAY_TITLE_MAX_LENGTH }),
    description: optionalText({ max: TRIP_DESCRIPTION_MAX_LENGTH }),
  })
  .strict();

export const dayUpdateSchema = z
  .object({
    title: patchText({ min: 1, max: DAY_TITLE_MAX_LENGTH }),
    description: patchText({ max: TRIP_DESCRIPTION_MAX_LENGTH }),
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
