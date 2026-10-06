import { apiClient } from '../client';
import { IMAGES, ME, TRIPS } from '../../constants/api';
import type { TripSort } from '../../constants/trips';
import type {
  BackgroundImageResponse,
  ImageDto,
  TripDay,
  TripDetails,
  TripListItem,
  TripListResponse,
} from '../../types';
import {
  dayCreateSchema,
  dayReorderSchema,
  dayUpdateSchema,
  tripListQuerySchema,
  tripWriteSchema,
} from '../../validations';

export interface TripWriteInput {
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
  dayNumber?: number;
  title?: string | null;
  description?: string | null;
}

export interface DayUpdateInput {
  title?: string | null;
  description?: string | null;
}

export interface DayReorderInput {
  dayIds: number[];
}

export const tripApi = {
  listTrips: async (query: TripListQuery = {}): Promise<TripListResponse> => {
    const params = tripListQuerySchema.parse(query);
    const { data } = await apiClient.get<TripListResponse>(TRIPS, { params });
    return data;
  },

  getTopTrips: async (): Promise<TripListItem[]> => {
    const { data } = await apiClient.get<TripListItem[]>(`${TRIPS}/top`);
    return data;
  },

  getBackgroundImage: async (): Promise<BackgroundImageResponse> => {
    const { data } = await apiClient.get<BackgroundImageResponse>(`${TRIPS}/background`);
    return data;
  },

  listMyTrips: async (): Promise<TripListItem[]> => {
    const { data } = await apiClient.get<TripListItem[]>(`${ME}/trips`);
    return data;
  },

  listMyFavorites: async (): Promise<TripListItem[]> => {
    const { data } = await apiClient.get<TripListItem[]>(`${ME}/favorites`);
    return data;
  },

  getTrip: async (id: number): Promise<TripDetails> => {
    const { data } = await apiClient.get<TripDetails>(`${TRIPS}/${id}`);
    return data;
  },

  createTrip: async (input: TripWriteInput): Promise<TripDetails> => {
    const body = tripWriteSchema.parse(input);
    const { data } = await apiClient.post<TripDetails>(TRIPS, body);
    return data;
  },

  updateTrip: async (id: number, input: TripWriteInput): Promise<TripDetails> => {
    const body = tripWriteSchema.parse(input);
    const { data } = await apiClient.put<TripDetails>(`${TRIPS}/${id}`, body);
    return data;
  },

  deleteTrip: async (id: number): Promise<void> => {
    await apiClient.delete(`${TRIPS}/${id}`);
  },

  createDay: async (tripId: number, input: DayCreateInput): Promise<TripDay> => {
    const body = dayCreateSchema.parse(input);
    const { data } = await apiClient.post<TripDay>(`${TRIPS}/${tripId}/days`, body);
    return data;
  },

  reorderDays: async (tripId: number, input: DayReorderInput): Promise<TripDay[]> => {
    const body = dayReorderSchema.parse(input);
    const { data } = await apiClient.put<TripDay[]>(`${TRIPS}/${tripId}/days/reorder`, body);
    return data;
  },

  updateDay: async (tripId: number, dayId: number, input: DayUpdateInput): Promise<TripDay> => {
    const body = dayUpdateSchema.parse(input);
    const { data } = await apiClient.put<TripDay>(`${TRIPS}/${tripId}/days/${dayId}`, body);
    return data;
  },

  deleteDay: async (tripId: number, dayId: number): Promise<void> => {
    await apiClient.delete(`${TRIPS}/${tripId}/days/${dayId}`);
  },

  uploadDayImage: async (tripId: number, dayId: number, file: File): Promise<ImageDto> => {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await apiClient.post<ImageDto>(
      `${TRIPS}/${tripId}/days/${dayId}/images`,
      formData,
    );
    return data;
  },

  deleteImage: async (imageId: number): Promise<void> => {
    await apiClient.delete(`${IMAGES}/${imageId}`);
  },
};
