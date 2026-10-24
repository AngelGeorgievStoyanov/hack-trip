import { apiClient } from '../client';
import { CONFIG } from '../../constants/api';
import type { PublicServiceConfigDto, SelectConfigDto, SocialConfigResponse } from '../../types';

export const configApi = {
  getSelects: async (): Promise<SelectConfigDto[]> => {
    const { data } = await apiClient.get<SelectConfigDto[]>(`${CONFIG}/selects`);
    return data;
  },

  getServices: async (): Promise<PublicServiceConfigDto[]> => {
    const { data } = await apiClient.get<PublicServiceConfigDto[]>(`${CONFIG}/services`);
    return data;
  },

  getSocial: async (): Promise<SocialConfigResponse> => {
    const { data } = await apiClient.get<SocialConfigResponse>(`${CONFIG}/social`);
    return data;
  },
};
