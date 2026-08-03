import client from './client';
import type { ApiResponse, Profile } from '../types';

export type ProfileData = {
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
};

export const getProfile = () =>
  client.get<ApiResponse<Profile>>('/profile').then(r => r.data);

export const updateProfile = (data: { firstName?: string; lastName?: string; phoneNumber?: string }) =>
  client.put<ApiResponse<Profile>>('/profile', data).then(r => r.data);

export const changePassword = (currentPassword: string, newPassword: string) =>
  client.put<ApiResponse<unknown>>('/profile/password', { currentPassword, newPassword }).then(r => r.data);

export const changeEmail = (newEmail: string, currentPassword: string) =>
  client.put<ApiResponse<unknown>>('/profile/email', { newEmail, currentPassword }).then(r => r.data);
