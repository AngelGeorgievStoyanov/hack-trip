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
import { idList, optionalInt, optionalText, patchText, requiredInt, requiredNumber, trimmedString } from '../shared';

export const tripWriteSchema = z
  .object({
    dayNumber: requiredInt({ min: 1, max: DAY_NUMBER_MAX }),
    title: trimmedString({
      min: 1,
      max: TRIP_TITLE_MAX_LENGTH,
      minMessage: 'Title cannot be empty.',
    }),
    description: optionalText(
      { max: TRIP_DESCRIPTION_MAX_LENGTH },
      { max: `Description max length is ${TRIP_DESCRIPTION_MAX_LENGTH} chars` },
    ),
    price: requiredNumber({ min: 0, max: 1000000 }),
    transport: trimmedString({ min: 1, max: TRIP_TRANSPORT_MAX_LENGTH }),
    countPeoples: requiredInt({ min: 1, max: 2147483647 }),
    typeOfPeople: trimmedString({ min: 1, max: TRIP_GROUP_MAX_LENGTH }),
    currency: trimmedString({ min: 1, max: 3 }),
    destination: z.preprocess(
      (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
      trimmedString({ min: 1, max: TRIP_TITLE_MAX_LENGTH }).optional(),
    ),
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
    dayNumber: requiredInt({ min: 1, max: DAY_NUMBER_MAX }),
    title: optionalText({ min: 1, max: DAY_TITLE_MAX_LENGTH }),
    description: optionalText(
      { max: TRIP_DESCRIPTION_MAX_LENGTH },
      { max: `Description max length is ${TRIP_DESCRIPTION_MAX_LENGTH} chars` },
    ),
  })
  .strict();

export const dayUpdateSchema = z
  .object({
    title: patchText({ min: 1, max: DAY_TITLE_MAX_LENGTH }),
    description: patchText(
      { max: TRIP_DESCRIPTION_MAX_LENGTH },
      { max: `Description max length is ${TRIP_DESCRIPTION_MAX_LENGTH} chars` },
    ),
  })
  .strict()
  .refine(
    (data) => data.title !== undefined || data.description !== undefined,
    'At least one field is required',
  );

export const dayReorderSchema = z
  .object({
    tripIds: idList({ min: 1, max: 500 }),
  })
  .strict();

export const pointReorderSchema = z
  .object({
    pointIds: idList({ min: 0, max: 500 }),
  })
  .strict();
