import { apiClient } from '../../clients/axios';
import { CONFIG } from '../../constants/api';
import type { PublicServiceConfigDto, SelectConfigDto } from '../../types';

export const configApi = {
  getSelects: async (): Promise<SelectConfigDto[]> => {
    const { data } = await apiClient.get<SelectConfigDto[]>(`${CONFIG}/selects`);
    return data;
  },

  getServices: async (): Promise<PublicServiceConfigDto[]> => {
    const { data } = await apiClient.get<PublicServiceConfigDto[]>(`${CONFIG}/services`);
    return data;
  },
};
