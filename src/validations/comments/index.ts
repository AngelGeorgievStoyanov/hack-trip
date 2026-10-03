import { z } from 'zod';
import { COMMENT_LIMIT_MAX, PAGE_MAX } from '@/constants/ui';
import { optionalInt, trimmedString } from '../shared';

export const commentBodySchema = z
  .object({
    text: trimmedString({ min: 1, max: 1000 }),
  })
  .strict();

export const commentPageQuerySchema = z
  .object({
    page: optionalInt({ min: 1, max: PAGE_MAX }),
    limit: optionalInt({ min: 1, max: COMMENT_LIMIT_MAX }),
  })
  .strict();
