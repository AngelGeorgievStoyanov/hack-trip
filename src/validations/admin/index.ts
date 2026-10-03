import { z } from 'zod';
import {
  ADMIN_PAGE_DEFAULT,
  ADMIN_PAGE_SIZE_DEFAULT,
  ADMIN_PAGE_SIZE_MAX,
  PAGE_MAX,
} from '@/constants/ui';
import { idList, optionalInt, trimmedString } from '../shared';

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
    page: optionalInt({ min: 1, max: PAGE_MAX }).transform((value) => value ?? ADMIN_PAGE_DEFAULT),
    pageSize: optionalInt({ min: 1, max: ADMIN_PAGE_SIZE_MAX }).transform(
      (value) => value ?? ADMIN_PAGE_SIZE_DEFAULT,
    ),
  })
  .strict();
