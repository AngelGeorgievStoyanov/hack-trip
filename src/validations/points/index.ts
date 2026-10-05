import { z } from 'zod';
import {
  LATITUDE_MAX,
  LATITUDE_MIN,
  LONGITUDE_MAX,
  LONGITUDE_MIN,
  POINT_DESCRIPTION_MAX_LENGTH,
  POINT_TITLE_MAX_LENGTH,
} from '@/constants/points';
import { optionalText, patchNumber, patchText, positiveId, requiredNumber, trimmedString } from '../shared';

export const pointCreateSchema = z
  .object({
    dayId: positiveId,
    title: trimmedString({
      min: 1,
      max: POINT_TITLE_MAX_LENGTH,
      minMessage: 'Title cannot be empty string.',
    }),
    description: optionalText(
      { max: POINT_DESCRIPTION_MAX_LENGTH },
      { max: `Description max length is ${POINT_DESCRIPTION_MAX_LENGTH} chars` },
    ),
    latitude: requiredNumber({ min: LATITUDE_MIN, max: LATITUDE_MAX }),
    longitude: requiredNumber({ min: LONGITUDE_MIN, max: LONGITUDE_MAX }),
  })
  .strict();

export const pointUpdateSchema = z
  .object({
    title: trimmedString({
      min: 1,
      max: POINT_TITLE_MAX_LENGTH,
      minMessage: 'Title cannot be empty string.',
    }).optional(),
    description: patchText(
      { max: POINT_DESCRIPTION_MAX_LENGTH },
      { max: `Description max length is ${POINT_DESCRIPTION_MAX_LENGTH} chars` },
    ),
    latitude: patchNumber({ min: LATITUDE_MIN, max: LATITUDE_MAX }),
    longitude: patchNumber({ min: LONGITUDE_MIN, max: LONGITUDE_MAX }),
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
