import { z } from 'zod';
import { optionalInt, trimmedString } from '../shared';

/**
 * Comment request schemas (API_CONTRACT.md §18.5). All `.strict()`.
 */

export const commentBodySchema = z
  .object({
    text: trimmedString({ min: 1, max: 1000 }),
  })
  .strict();

export const commentPageQuerySchema = z
  .object({
    page: optionalInt({ min: 1, max: 10000 }),
    limit: optionalInt({ min: 1, max: 100 }),
  })
  .strict();
