import { apiClient } from '../client';
import { COMMENTS, IMAGES, POINTS, TRIPS, TRIP_GROUPS } from '../../constants/api';
import type { CommentDto, CommentListResponse } from '../../types';
import { commentBodySchema, commentPageQuerySchema } from '../../validations';

export interface CommentCreateInput {
  comment: string;
}

export interface CommentListQuery {
  page?: number;
  limit?: number;
}

export type CommentTarget =
  | { type: 'tripGroup'; tripGroupId: number }
  | { type: 'day'; tripGroupId: number; tripId: number }
  | { type: 'point'; pointId: number }
  | { type: 'image'; imageId: number };

function commentBasePath(target: CommentTarget): string {
  switch (target.type) {
    case 'tripGroup':
      return `${TRIP_GROUPS}/${target.tripGroupId}/comments`;
    case 'day':
      return `${TRIPS}/${target.tripGroupId}/days/${target.tripId}/comments`;
    case 'point':
      return `${POINTS}/${target.pointId}/comments`;
    case 'image':
      return `${IMAGES}/${target.imageId}/comments`;
  }
}

export const commentApi = {
  list: async (target: CommentTarget, query: CommentListQuery = {}): Promise<CommentListResponse> => {
    const params = commentPageQuerySchema.parse(query);
    const { data } = await apiClient.get<CommentListResponse>(commentBasePath(target), { params });
    return data;
  },

  create: async (target: CommentTarget, input: CommentCreateInput): Promise<CommentDto> => {
    const body = commentBodySchema.parse(input);
    const { data } = await apiClient.post<CommentDto>(commentBasePath(target), body);
    return data;
  },

  update: async (commentId: number, input: CommentCreateInput): Promise<CommentDto> => {
    const body = commentBodySchema.parse(input);
    const { data } = await apiClient.put<CommentDto>(`${COMMENTS}/${commentId}`, body);
    return data;
  },

  delete: async (commentId: number): Promise<void> => {
    await apiClient.delete(`${COMMENTS}/${commentId}`);
  },
};
