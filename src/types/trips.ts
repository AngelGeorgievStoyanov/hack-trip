import type { TripDay } from './points';
import type { SocialState } from './social';

export interface AuthorDto {
  id: string;
  firstName: string;
  lastName: string;
}

export interface SelectKeyName {
  key: string;
  name: string;
}

export interface TripGroupSelect {
  id: number;
  key: string;
  name: string;
}

export interface TripListItem {
  id: number;
  title: string;
  description: string | null;
  group: SelectKeyName;
  transport: SelectKeyName;
  author: AuthorDto;
  coverImage: string | null;
  createdAt: string | null;
}

export interface TripListPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface TripListResponse {
  items: TripListItem[];
  pagination: TripListPagination;
}

export interface TripDetails {
  id: number;
  title: string;
  description: string | null;
  group: TripGroupSelect;
  transport: SelectKeyName;
  author: AuthorDto;
  coverImage: string | null;
  days: TripDay[];
  social: SocialState;
  createdAt: string | null;
  updatedAt: string | null;
}
