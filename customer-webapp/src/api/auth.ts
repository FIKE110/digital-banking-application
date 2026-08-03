import client from './client';
import type { ApiResponse, LoginResponse, User } from '../types';

export const login = (username: string, password: string) =>
  client.post<ApiResponse<LoginResponse>>('/auth/login', { username, password }).then(r => r.data);

export const register = (username: string, email: string, password: string) =>
  client.post<ApiResponse<unknown>>('/auth/register', { username, email, password }).then(r => r.data);

export const logout = (token: string) =>
  client.post<ApiResponse<unknown>>('/auth/logout', null, { params: { token } }).then(r => r.data);

export const getMe = (token: string) =>
  client.get<ApiResponse<User>>('/auth/me', { params: { token } }).then(r => r.data);

export const forgotPassword = (email: string) =>
  client.post<ApiResponse<unknown>>('/auth/forgot-password', { email }).then(r => r.data);

export const resetPassword = (email: string, otp: string, newPassword: string) =>
  client.post<ApiResponse<unknown>>('/auth/reset-password', { email, otp, newPassword }).then(r => r.data);
