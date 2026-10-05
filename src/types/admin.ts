import type { AuthUserDto } from './auth';

export interface AdminPagination {
  page: number;
  pageSize: number;
  total?: number;
  totalPages?: number;
  hasNext?: boolean;
}

export interface AdminPage<T> {
  items: T[];
  pagination: AdminPagination;
}

export interface FailedLogDto {
  id: number;
  date: string | null;
  email: string;
  ip: string;
  userAgent: string;
  countryCode: string | null;
  countryName: string | null;
  city: string | null;
  postal: string | null;
  latitude: number | null;
  longitude: number | null;
  state: string | null;
}

export interface RouteNotFoundLogDto {
  id: number;
  date: string | null;
  reqUrl: null;
  reqMethod: string | null;
  reqHeaders: null;
  reqQuery: null;
  reqBody: null;
  reqParams: null;
  reqIp: string | null;
  reqUserId: string | null;
  reqUserEmail: string | null;
}

export interface DeleteCountResponse {
  deleted: number;
}

export interface ImageInventoryComparison {
  cloudOnly: string[];
  databaseOnly: string[];
  pagination: {
    page: number;
    pageSize: number;
    cloudHasNext: boolean;
    databaseHasNext: boolean;
    databaseTotal: number;
    databaseTotalPages: number;
  };
}

export type AdminUserDto = AuthUserDto;
