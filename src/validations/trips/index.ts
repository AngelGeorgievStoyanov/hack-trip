import { z } from 'zod';
import {
  DAY_NUMBER_MAX,
  TRIP_DESCRIPTION_MAX_LENGTH,
  TRIP_GROUP_MAX_LENGTH,
  TRIP_SEARCH_MAX_LENGTH,
  TRIP_TITLE_MAX_LENGTH,
  TRIP_TRANSPORT_MAX_LENGTH,
} from '@/constants/trips';
import { PAGE_MAX, TRIP_LIMIT_MAX } from '@/constants/ui';
import {
  idList,
  optionalInt,
  optionalText,
  positiveId,
  requiredInt,
  requiredNumber,
  trimmedString,
} from '../shared';

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
    countPeoples: requiredInt({ min: 1, max: 1000 }),
    typeOfPeople: trimmedString({ min: 1, max: TRIP_GROUP_MAX_LENGTH }),
    currency: trimmedString({ min: 1, max: 3 }),
    destination: trimmedString({ min: 1, max: TRIP_TITLE_MAX_LENGTH }).optional(),
    lat: z.union([z.number().min(-90).max(90), z.null()]).optional(),
    lng: z.union([z.number().min(-180).max(180), z.null()]).optional(),
  })
  .strict();

/** Form adapter: an empty optional destination is omitted before the API request. */
export const tripWriteFormSchema = tripWriteSchema.extend({
  destination: z.preprocess(
    (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
    trimmedString({ min: 1, max: TRIP_TITLE_MAX_LENGTH }).optional(),
  ),
});

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

/** Full Edit Trip contract, aligned with the backend tripEditSchema. */
export const tripEditSchema = z
  .object({
    dayNumber: requiredInt({ min: 1, max: DAY_NUMBER_MAX }),
    title: trimmedString({
      min: 1,
      max: TRIP_TITLE_MAX_LENGTH,
      minMessage: 'Title cannot be empty.',
    }),
    description: z.preprocess(
      (value) => (typeof value === 'string' && value.trim() === '' ? null : value),
      z.union([trimmedString({ max: TRIP_DESCRIPTION_MAX_LENGTH }), z.null()]),
    ),
    price: requiredNumber({ min: 0, max: 1000000 }),
    transport: trimmedString({ min: 1, max: TRIP_TRANSPORT_MAX_LENGTH }),
    countPeoples: requiredInt({ min: 1, max: 1000 }),
    typeOfPeople: trimmedString({ min: 1, max: TRIP_GROUP_MAX_LENGTH }),
    currency: trimmedString({ min: 1, max: 3 }),
    destination: z.preprocess(
      (value) => (typeof value === 'string' && value.trim() === '' ? null : value),
      z.union([trimmedString({ min: 1, max: TRIP_TITLE_MAX_LENGTH }), z.null()]),
    ),
    lat: z.union([z.number().min(-90).max(90), z.null()]),
    lng: z.union([z.number().min(-180).max(180), z.null()]),
  })
  .strict();

export const dayReorderSchema = z
  .object({
    days: z
      .array(
        z
          .object({
            tripId: positiveId,
            dayNumber: requiredInt({ min: 1, max: DAY_NUMBER_MAX }),
          })
          .strict(),
      )
      .min(1)
      .max(500),
  })
  .strict()
  .superRefine(({ days }, ctx) => {
    const tripIds = new Set<number>();
    const dayNumbers = new Set<number>();

    days.forEach((day, index) => {
      if (tripIds.has(day.tripId)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['days', index, 'tripId'],
          message: 'Trip IDs must be unique.',
        });
      }
      if (dayNumbers.has(day.dayNumber)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['days', index, 'dayNumber'],
          message: 'Day numbers must be unique.',
        });
      }
      tripIds.add(day.tripId);
      dayNumbers.add(day.dayNumber);
    });
  });

export const pointReorderSchema = z
  .object({
    pointIds: idList({ min: 0, max: 500 }),
  })
  .strict();
