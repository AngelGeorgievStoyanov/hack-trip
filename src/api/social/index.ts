import { apiClient } from '../client';
import { FAVORITES, LIKES, REPORTS } from '../../constants/api';
import type { ReportDto, ReportTargetTypeInput, SocialState, SocialTargetTypeInput } from '../../types';
import {
  favoriteBodySchema,
  favoriteQuerySchema,
  reportBodySchema,
  socialTargetBodySchema,
  socialTargetQuerySchema,
  reportTargetQuerySchema,
} from '../../validations';

export interface SocialTargetInput {
  targetType: SocialTargetTypeInput;
  targetId: number;
}

export type FavoriteInput =
  | { tripGroupId: number }
  | { targetType: SocialTargetTypeInput; targetId: number };

export interface ReportInput {
  targetType: ReportTargetTypeInput;
  targetId: number;
  reason?: string | null;
}

export const socialApi = {
  like: async (input: SocialTargetInput): Promise<SocialState> => {
    const body = socialTargetBodySchema.parse(input);
    const { data } = await apiClient.post<SocialState>(`${LIKES}/`, body);
    return data;
  },

  unlike: async (input: SocialTargetInput): Promise<void> => {
    const params = socialTargetQuerySchema.parse(input);
    await apiClient.delete(`${LIKES}/`, { params });
  },

  favorite: async (input: FavoriteInput): Promise<SocialState> => {
    const body = favoriteBodySchema.parse(input);
    const { data } = await apiClient.post<SocialState>(`${FAVORITES}/`, body);
    return data;
  },

  unfavorite: async (input: FavoriteInput): Promise<void> => {
    const params = favoriteQuerySchema.parse(input);
    await apiClient.delete(`${FAVORITES}/`, { params });
  },

  report: async (input: ReportInput): Promise<ReportDto> => {
    const body = reportBodySchema.parse(input);
    const { data } = await apiClient.post<ReportDto>(`${REPORTS}/`, body);
    return data;
  },

  /**
   * Withdraws the current user's own report. The backend only allows the report author
   * to remove it and only removes the report record, never the reported content.
   */
  unreport: async (input: Pick<ReportInput, 'targetType' | 'targetId'>): Promise<void> => {
    const params = reportTargetQuerySchema.parse(input);
    await apiClient.delete(REPORTS, { params });
  },
};
