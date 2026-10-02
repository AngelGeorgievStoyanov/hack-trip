import { z } from 'zod';
import { optionalText, positiveId, targetTypeInput } from '../shared';

/**
 * Social request schemas (API_CONTRACT.md §18.5). All `.strict()`.
 */

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

export const favoriteBodySchema = z
  .object({
    tripGroupId: positiveId,
  })
  .strict();

export const favoriteQuerySchema = z
  .object({
    tripGroupId: positiveId,
  })
  .strict();

export const reportBodySchema = z
  .object({
    targetType: targetTypeInput,
    targetId: positiveId,
    reason: optionalText({ max: 1000 }),
  })
  .strict();
