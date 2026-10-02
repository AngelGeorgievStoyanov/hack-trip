import { z } from 'zod';
import { idList, optionalInt, trimmedString } from '../shared';

/**
 * Admin request schemas (API_CONTRACT.md §18.6). All `.strict()`.
 */

export const adminUserUpdateSchema = z
  .object({
    firstName: trimmedString({ min: 1, max: 45 }).optional(),
    lastName: trimmedString({ min: 1, max: 45 }).optional(),
    role: z.enum(['user', 'admin', 'manager']).optional(),
    status: z.enum(['PENDING_VERIFICATION', 'ACTIVE', 'SUSPENDED', 'DEACTIVATED']).optional(),
  })
  .strict()
  .refine(
    (data) =>
      data.firstName !== undefined ||
      data.lastName !== undefined ||
      data.role !== undefined ||
      data.status !== undefined,
    'At least one field is required',
  );

export const failedLogDeleteSchema = z
  .object({
    ids: idList({ min: 1, max: 200 }),
  })
  .strict();

export const adminPaginationQuerySchema = z
  .object({
    page: optionalInt({ min: 1, max: 10000 }).transform((value) => value ?? 1),
    pageSize: optionalInt({ min: 1, max: 100 }).transform((value) => value ?? 50),
  })
  .strict();
