import { apiClient } from '../client';
import { IMAGES, ME, TRIPS } from '../../constants/api';
import type { TripGroupResponse, TripDay } from '../../types';
import type { TripSort } from '../../constants/trips';
import type {
  BackgroundImageResponse,
  ImageDto,
} from '../../types';
import {
  dayCreateSchema,
  dayReorderSchema,
  dayUpdateSchema,
  tripListQuerySchema,
  tripWriteSchema,
} from '../../validations';

export interface TripWriteInput {
  dayNumber: number;
  title: string;
  description: string | null;
  group: string;
  transport: string;
}

export interface TripListQuery {
  page?: number;
  limit?: number;
  search?: string;
  group?: string;
  transport?: string;
  sort?: TripSort;
}

export interface DayCreateInput {
  dayNumber: number;
  title?: string | null;
  description?: string | null;
}

export interface DayUpdateInput {
  title?: string | null;
  description?: string | null;
}

export interface DayReorderInput {
  tripIds: number[];
}

export const tripApi = {
  listTrips: async (query: TripListQuery = {}): Promise<TripGroupResponse[]> => {
    const params = tripListQuerySchema.parse(query);
    const { data } = await apiClient.get<TripGroupResponse[]>(TRIPS, { params });
    return data;
  },

  getTopTrips: async (): Promise<TripGroupResponse[]> => {
    const { data } = await apiClient.get<TripGroupResponse[]>(`${TRIPS}/top`);
    return data;
  },

  getBackgroundImage: async (): Promise<BackgroundImageResponse> => {
    const { data } = await apiClient.get<BackgroundImageResponse>(`${TRIPS}/background`);
    return data;
  },

  listMyTrips: async (): Promise<TripGroupResponse[]> => {
    const { data } = await apiClient.get<TripGroupResponse[]>(`${ME}/trips`);
    return data;
  },

  listMyFavorites: async (): Promise<TripGroupResponse[]> => {
    const { data } = await apiClient.get<TripGroupResponse[]>(`${ME}/favorites`);
    return data;
  },

  getTrip: async (tripGroupId: number): Promise<TripGroupResponse> => {
    const { data } = await apiClient.get<TripGroupResponse>(`${TRIPS}/${tripGroupId}`);
    return data;
  },

  createTrip: async (input: TripWriteInput): Promise<TripGroupResponse> => {
    const body = tripWriteSchema.parse(input);
    const { data } = await apiClient.post<TripGroupResponse>(TRIPS, body);
    return data;
  },

  // `PUT /trips/:id` no longer exists in the API contract (§21): trip-level metadata
  // is day-scoped, so day edits go through `updateDay` (`PUT /trips/:tripGroupId/days/:dayId`).
  deleteTrip: async (tripGroupId: number): Promise<void> => {
    await apiClient.delete(`${TRIPS}/${tripGroupId}`);
  },

  createDay: async (tripGroupId: number, input: DayCreateInput): Promise<TripGroupResponse> => {
    const body = dayCreateSchema.parse(input);
    const { data } = await apiClient.post<TripGroupResponse>(`${TRIPS}/${tripGroupId}/days`, body);
    return data;
  },

  reorderDays: async (tripGroupId: number, input: DayReorderInput): Promise<TripDay[]> => {
    const body = dayReorderSchema.parse(input);
    const { data } = await apiClient.put<TripDay[]>(`${TRIPS}/${tripGroupId}/days/reorder`, body);
    return data;
  },

  updateDay: async (tripGroupId: number, dayId: number, input: DayUpdateInput): Promise<TripGroupResponse> => {
    const body = dayUpdateSchema.parse(input);
    const { data } = await apiClient.put<TripGroupResponse>(`${TRIPS}/${tripGroupId}/days/${dayId}`, body);
    return data;
  },

  deleteDay: async (tripGroupId: number, dayId: number): Promise<void> => {
    await apiClient.delete(`${TRIPS}/${tripGroupId}/days/${dayId}`);
  },

  uploadDayImage: async (tripGroupId: number, dayId: number, file: File): Promise<ImageDto> => {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await apiClient.post<ImageDto>(
      `${TRIPS}/${tripGroupId}/days/${dayId}/images`,
      formData,
    );
    return data;
  },

  deleteImage: async (imageId: number): Promise<void> => {
    await apiClient.delete(`${IMAGES}/${imageId}`);
  },
};
