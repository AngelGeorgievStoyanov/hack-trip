import type { SocialTargetType } from './social';

interface AdminPagination {
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
  reqUrl: string | null;
  reqMethod: string | null;
  reqHeaders: string | null;
  reqQuery: string | null;
  reqBody: string | null;
  reqParams: string | null;
  reqIp: string | null;
  reqUserId: string | null;
  reqUserEmail: string | null;
}

export interface DeleteCountResponse {
  deleted: number;
}

export interface AdminReportDto {
  id: number;
  targetType: SocialTargetType;
  targetId: number;
  reason: string | null;
  createdAt: string | null;
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


export interface MissingThumbnailImageDto {
  id: number;
  url: string;
  thumbnailUrl: string;
}

export interface MissingThumbnailPageDto {
  items: MissingThumbnailImageDto[];
  pagination: {
    page: number;
    pageSize: number;
    hasNext: boolean;
  };
}

export interface GenerateThumbnailsResponse {
  results: Array<{
    imageId: number;
    status: 'generated' | 'already_exists' | 'original_missing' | 'not_found' | 'failed';
  }>;
  summary: {
    generated: number;
    alreadyExists: number;
    originalMissing: number;
    notFound: number;
    failed: number;
  };
}
