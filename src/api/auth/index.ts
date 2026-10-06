import { apiClient } from '../client';
import { AUTH } from '../../constants/api';
import type {
  AuthSessionDto,
  AuthSessionProbeDto,
  AuthUserResponse,
  ImageDto,
  MessageResponse,
} from '../../types';
import {
  changePasswordSchema,
  confirmPasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resendVerificationSchema,
  resetPasswordSchema,
  updateProfileSchema,
  verifyEmailSchema,
} from '../../validations';

export interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface VerifyEmailInput {
  token: string;
}

export interface ResendVerificationInput {
  email: string;
}

export interface UpdateProfileInput {
  firstName: string;
  lastName: string;
}

export interface ConfirmPasswordInput {
  password: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export interface ForgotPasswordInput {
  email: string;
}

export interface ResetPasswordInput {
  token: string;
  password: string;
}

export const authApi = {
  register: async (input: RegisterInput): Promise<MessageResponse> => {
    const body = registerSchema.parse(input);
    const { data } = await apiClient.post<MessageResponse>(`${AUTH}/register`, body, {
      skipAuthHeader: true,
    });
    return data;
  },

  login: async (input: LoginInput): Promise<AuthSessionDto> => {
    const body = loginSchema.parse(input);
    const { data } = await apiClient.post<AuthSessionDto>(`${AUTH}/login`, body, {
      skipAuthHeader: true,
    });
    return data;
  },

  verifyEmail: async (input: VerifyEmailInput): Promise<AuthUserResponse> => {
    const body = verifyEmailSchema.parse(input);
    const { data } = await apiClient.post<AuthUserResponse>(`${AUTH}/verify-email`, body, {
      skipAuthHeader: true,
    });
    return data;
  },

  resendVerification: async (input: ResendVerificationInput): Promise<MessageResponse> => {
    const body = resendVerificationSchema.parse(input);
    const { data } = await apiClient.post<MessageResponse>(
      `${AUTH}/resend-verification`,
      body,
      { skipAuthHeader: true },
    );
    return data;
  },

  logout: async (): Promise<MessageResponse> => {
    const { data } = await apiClient.post<MessageResponse>(`${AUTH}/logout`, undefined, {
      skipAuthHeader: true,
    });
    return data;
  },

  me: async (): Promise<AuthUserResponse> => {
    const { data } = await apiClient.get<AuthUserResponse>(`${AUTH}/me`);
    return data;
  },

  sessionProbe: async (): Promise<AuthSessionProbeDto> => {
    const { data } = await apiClient.get<AuthSessionProbeDto>(`${AUTH}/session`);
    return { hasSession: data.hasSession === true };
  },

  updateProfile: async (input: UpdateProfileInput): Promise<AuthUserResponse> => {
    const body = updateProfileSchema.parse(input);
    const { data } = await apiClient.put<AuthUserResponse>(`${AUTH}/me`, body);
    return data;
  },

  confirmPassword: async (input: ConfirmPasswordInput): Promise<{ valid: boolean }> => {
    const body = confirmPasswordSchema.parse(input);
    const { data } = await apiClient.post<{ valid: boolean }>(`${AUTH}/confirm-password`, body);
    return data;
  },

  changePassword: async (input: ChangePasswordInput): Promise<void> => {
    const body = changePasswordSchema.parse(input);
    await apiClient.put(`${AUTH}/me/password`, body);
  },

  getProfileImage: async (): Promise<ImageDto | null> => {
    const { data } = await apiClient.get<ImageDto | null>(`${AUTH}/me/image`);
    return data;
  },

  uploadProfileImage: async (file: File): Promise<ImageDto> => {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await apiClient.post<ImageDto>(`${AUTH}/me/image`, formData);
    return data;
  },

  deleteProfileImage: async (): Promise<void> => {
    await apiClient.delete(`${AUTH}/me/image`);
  },

  forgotPassword: async (input: ForgotPasswordInput): Promise<MessageResponse> => {
    const body = forgotPasswordSchema.parse(input);
    const { data } = await apiClient.post<MessageResponse>(`${AUTH}/forgot-password`, body, {
      skipAuthHeader: true,
    });
    return data;
  },

  resetPassword: async (input: ResetPasswordInput): Promise<MessageResponse> => {
    const body = resetPasswordSchema.parse(input);
    const { data } = await apiClient.post<MessageResponse>(`${AUTH}/reset-password`, body, {
      skipAuthHeader: true,
    });
    return data;
  },
};
