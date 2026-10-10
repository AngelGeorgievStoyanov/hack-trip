import type { SocialTargetType } from './social';
import type { ResourcePermissions } from './points';

export interface CommentAuthor {
  name: string;
}

export interface CommentDto {
  id: number;
  author: CommentAuthor;
  comment: string;
  permissions: ResourcePermissions;
  social: { reportedByMe: boolean };
  createdAt: string | null;
  updatedAt: string | null;
}

export interface CommentListResponse {
  items: CommentDto[];
  page: number;
  limit: number;
  total: number;
}

export interface ReportDto {
  id: number;
  targetType: SocialTargetType;
  targetId: number;
  reason: string | null;
  createdAt: string | null;
}
