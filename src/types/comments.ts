import type { SocialTargetType } from './social';

/**
 * Comment and report response DTOs.
 */

export interface CommentAuthor {
  id: string;
  name: string;
}

export interface CommentDto {
  id: number;
  author: CommentAuthor;
  text: string;
  editCount: number;
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
