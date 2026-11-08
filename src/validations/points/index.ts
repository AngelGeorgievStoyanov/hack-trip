import { z } from 'zod';
import {
  LATITUDE_MAX,
  LATITUDE_MIN,
  LONGITUDE_MAX,
  LONGITUDE_MIN,
  POINT_DESCRIPTION_MAX_LENGTH,
  POINT_TITLE_MAX_LENGTH,
} from '@/constants/points';
import {
  optionalText,
  positiveId,
  requiredNumber,
  requiredNumberInput,
  trimmedString,
} from '../shared';

export const pointCreateSchema = z
  .object({
    tripId: positiveId,
    name: trimmedString({
      min: 1,
      max: POINT_TITLE_MAX_LENGTH,
      minMessage: 'Title cannot be empty string.',
    }),
    description: optionalText(
      { max: POINT_DESCRIPTION_MAX_LENGTH },
      { max: `Description max length is ${POINT_DESCRIPTION_MAX_LENGTH} chars` },
    ),
    lat: requiredNumber({ min: LATITUDE_MIN, max: LATITUDE_MAX }),
    lng: requiredNumber({ min: LONGITUDE_MIN, max: LONGITUDE_MAX }),
  })
  .strict();

export const pointUpdateSchema = z
  .object({
    name: trimmedString({
      min: 1,
      max: POINT_TITLE_MAX_LENGTH,
      minMessage: 'Title cannot be empty string.',
    }),
    description: z
      .union([trimmedString({ max: POINT_DESCRIPTION_MAX_LENGTH }), z.null()])
      .transform((value) => (value === '' ? null : value)),
    lat: requiredNumber({ min: LATITUDE_MIN, max: LATITUDE_MAX }),
    lng: requiredNumber({ min: LONGITUDE_MIN, max: LONGITUDE_MAX }),
  })
  .strict();

/** Form-only adapter: PointForm keeps latitude/longitude as text until submission. */
export const pointFormSchema = pointCreateSchema.omit({ tripId: true }).extend({
  lat: requiredNumberInput({ min: LATITUDE_MIN, max: LATITUDE_MAX }),
  lng: requiredNumberInput({ min: LONGITUDE_MIN, max: LONGITUDE_MAX }),
});
