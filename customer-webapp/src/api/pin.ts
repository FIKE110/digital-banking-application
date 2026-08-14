import client from './client';
import type { ApiResponse } from '../types';

export const getPinStatus = () =>
  client.get<ApiResponse<{ pinSet: boolean; pinSetAt?: string }>>('/pin/status').then(r => r.data);

export const setPin = (pin: string, currentPin?: string) =>
  client.post<ApiResponse<null>>('/pin/set', { pin, currentPin }).then(r => r.data);

export const verifyPin = (pin: string) =>
  client.post<ApiResponse<null>>('/pin/verify', { pin }).then(r => r.data);

export const forgotPin = (email: string) =>
  client.post<ApiResponse<null>>('/pin/forgot', { email }).then(r => r.data);

export const resetPin = (email: string, otp: string, newPin: string) =>
  client.post<ApiResponse<null>>('/pin/reset', { email, otp, newPin }).then(r => r.data);