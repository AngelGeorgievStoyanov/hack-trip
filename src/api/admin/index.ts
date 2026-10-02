import { apiClient } from '../client';
import { ADMIN } from '../../constants/api';
import type { Role, UserStatus } from '../../types';
import type {
  AdminPage,
  AuthUserDto,
  DeleteCountResponse,
  FailedLogDto,
  ImageInventoryComparison,
  RouteNotFoundLogDto,
} from '../../types';
import {
  adminPaginationQuerySchema,
  adminUserUpdateSchema,
  failedLogDeleteSchema,
} from '../../validations';

export interface AdminListQuery {
  page?: number;
  pageSize?: number;
}

export interface AdminUserUpdateInput {
  firstName?: string;
  lastName?: string;
  role?: Role;
  status?: UserStatus;
}

export interface FailedLogDeleteInput {
  ids: number[];
}

export const adminApi = {
  listUsers: async (query: AdminListQuery = {}): Promise<AdminPage<AuthUserDto>> => {
    const params = adminPaginationQuerySchema.parse(query);
    const { data } = await apiClient.get<AdminPage<AuthUserDto>>(`${ADMIN}/users`, { params });
    return data;
  },

  updateUser: async (userId: string, input: AdminUserUpdateInput): Promise<AuthUserDto> => {
    const body = adminUserUpdateSchema.parse(input);
    const { data } = await apiClient.put<AuthUserDto>(`${ADMIN}/users/${userId}`, body);
    return data;
  },

  deleteUser: async (userId: string): Promise<void> => {
    await apiClient.delete(`${ADMIN}/users/${userId}`);
  },

  listFailedLogs: async (query: AdminListQuery = {}): Promise<AdminPage<FailedLogDto>> => {
    const params = adminPaginationQuerySchema.parse(query);
    const { data } = await apiClient.get<AdminPage<FailedLogDto>>(
      `${ADMIN}/failed-login-logs`,
      { params },
    );
    return data;
  },

  deleteFailedLogs: async (input: FailedLogDeleteInput): Promise<DeleteCountResponse> => {
    const body = failedLogDeleteSchema.parse(input);
    const { data } = await apiClient.delete<DeleteCountResponse>(`${ADMIN}/failed-login-logs`, {
      data: body,
    });
    return data;
  },

  listRouteNotFoundLogs: async (
    query: AdminListQuery = {},
  ): Promise<AdminPage<RouteNotFoundLogDto>> => {
    const params = adminPaginationQuerySchema.parse(query);
    const { data } = await apiClient.get<AdminPage<RouteNotFoundLogDto>>(
      `${ADMIN}/route-not-found-logs`,
      { params },
    );
    return data;
  },

  listCloudImages: async (query: AdminListQuery = {}): Promise<AdminPage<string>> => {
    const params = adminPaginationQuerySchema.parse(query);
    const { data } = await apiClient.get<AdminPage<string>>(`${ADMIN}/images/cloud`, { params });
    return data;
  },

  listDatabaseImages: async (query: AdminListQuery = {}): Promise<AdminPage<string>> => {
    const params = adminPaginationQuerySchema.parse(query);
    const { data } = await apiClient.get<AdminPage<string>>(`${ADMIN}/images/database`, {
      params,
    });
    return data;
  },

  listOrphanImages: async (query: AdminListQuery = {}): Promise<ImageInventoryComparison> => {
    const params = adminPaginationQuerySchema.parse(query);
    const { data } = await apiClient.get<ImageInventoryComparison>(`${ADMIN}/images/orphans`, {
      params,
    });
    return data;
  },
};
