import { z } from 'zod';
import {
  optionalText,
  positiveId,
  positiveIdQuery,
  reportTargetTypeInput,
  targetTypeInput,
} from '../shared';

export const socialTargetBodySchema = z
  .object({
    targetType: targetTypeInput,
    targetId: positiveId,
  })
  .strict();

export const socialTargetQuerySchema = z
  .object({
    targetType: targetTypeInput,
    targetId: positiveIdQuery,
  })
  .strict();

const favoriteTripGroupSchema = z.object({ tripGroupId: positiveId }).strict();
const favoriteTargetSchema = z
  .object({ targetType: targetTypeInput, targetId: positiveId })
  .strict();
const favoriteTripGroupQuerySchema = z.object({ tripGroupId: positiveIdQuery }).strict();
const favoriteTargetQuerySchema = z
  .object({ targetType: targetTypeInput, targetId: positiveIdQuery })
  .strict();

export const favoriteBodySchema = z.union([favoriteTripGroupSchema, favoriteTargetSchema]);
export const favoriteQuerySchema = z.union([
  favoriteTripGroupQuerySchema,
  favoriteTargetQuerySchema,
]);

export const reportBodySchema = z
  .object({
    targetType: reportTargetTypeInput,
    targetId: positiveId,
    reason: optionalText({ max: 1000 }),
  })
  .strict();

export const reportTargetQuerySchema = z
  .object({ targetType: reportTargetTypeInput, targetId: positiveIdQuery })
  .strict();
