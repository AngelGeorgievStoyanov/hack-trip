import { apiClient } from '../client';
import { FAVORITES, LIKES, REPORTS } from '../../constants/api';
import type { ReportDto, SocialState, SocialTargetTypeInput } from '../../types';
import {
  favoriteBodySchema,
  favoriteQuerySchema,
  reportBodySchema,
  socialTargetBodySchema,
  socialTargetQuerySchema,
} from '../../validations';

export interface SocialTargetInput {
  targetType: SocialTargetTypeInput;
  targetId: number;
}

export interface FavoriteInput {
  tripGroupId: number;
}

export interface ReportInput {
  targetType: SocialTargetTypeInput;
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
};
