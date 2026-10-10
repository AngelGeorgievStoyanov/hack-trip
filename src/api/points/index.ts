import { apiClient } from '../client';
import { DAYS, POINTS } from '../../constants/api';
import type { ImageDto, TripPoint } from '../../types';
import { pointCreateSchema, pointReorderSchema, pointUpdateSchema } from '../../validations';

export interface PointCreateInput {
  tripId: number;
  name: string;
  description?: string | null;
  lat: number;
  lng: number;
}

export interface PointUpdateInput {
  name?: string;
  description?: string | null;
  lat?: number | null;
  lng?: number | null;
}

export interface PointReorderInput {
  pointIds: number[];
}

export const pointApi = {
  createPoint: async (input: PointCreateInput): Promise<TripPoint[]> => {
    const body = pointCreateSchema.parse(input);
    const { data } = await apiClient.post<TripPoint[]>(POINTS, body);
    return data;
  },

  getPoint: async (pointId: number): Promise<TripPoint> => {
    const { data } = await apiClient.get<TripPoint>(`${POINTS}/${pointId}`);
    return data;
  },

  updatePoint: async (pointId: number, input: PointUpdateInput): Promise<TripPoint[]> => {
    const body = pointUpdateSchema.parse(input);
    const { data } = await apiClient.put<TripPoint[]>(`${POINTS}/${pointId}`, body);
    return data;
  },

  deletePoint: async (pointId: number): Promise<void> => {
    await apiClient.delete(`${POINTS}/${pointId}`);
  },

  uploadPointImage: async (pointId: number, file: File): Promise<ImageDto> => {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await apiClient.post<ImageDto>(`${POINTS}/${pointId}/images`, formData);
    return data;
  },

  deletePointImage: async (pointId: number, imageId: number): Promise<void> => {
    await apiClient.delete(`${POINTS}/${pointId}/images/${imageId}`);
  },

  reorderPoints: async (tripId: number, input: PointReorderInput): Promise<TripPoint[]> => {
    const body = pointReorderSchema.parse(input);
    const { data } = await apiClient.put<TripPoint[]>(`${DAYS}/${tripId}/points/reorder`, body);
    return data;
  },
};
