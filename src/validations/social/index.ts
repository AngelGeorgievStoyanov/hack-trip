import { z } from 'zod';
import { optionalText, positiveId, reportTargetTypeInput, targetTypeInput } from '../shared';

export const socialTargetBodySchema = z
  .object({
    targetType: targetTypeInput,
    targetId: positiveId,
  })
  .strict();

export const socialTargetQuerySchema = z
  .object({
    targetType: targetTypeInput,
    targetId: positiveId,
  })
  .strict();

const favoriteTripGroupSchema = z.object({ tripGroupId: positiveId }).strict();
const favoriteTargetSchema = z.object({ targetType: targetTypeInput, targetId: positiveId }).strict();

export const favoriteBodySchema = z.union([favoriteTripGroupSchema, favoriteTargetSchema]);
export const favoriteQuerySchema = z.union([favoriteTripGroupSchema, favoriteTargetSchema]);

export const reportBodySchema = z
  .object({
    targetType: reportTargetTypeInput,
    targetId: positiveId,
    reason: optionalText({ max: 1000 }),
  })
  .strict();

export const reportTargetQuerySchema = z
  .object({ targetType: reportTargetTypeInput, targetId: positiveId })
  .strict();
