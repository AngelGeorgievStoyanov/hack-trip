import { z } from 'zod';
import { positiveIdParam } from './shared';

export const commentIdParams = z.object({ commentId: positiveIdParam }).strict();
export const replyIdParams = z.object({ replyId: positiveIdParam }).strict();
export const adminReportIdParams = z.object({ reportId: positiveIdParam }).strict();
