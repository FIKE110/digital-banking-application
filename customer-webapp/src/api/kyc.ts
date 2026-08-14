import client from './client';
import type { ApiResponse } from '../types';

export interface KycStatus {
  id?: number;
  bvnVerificationStatus: string;
  ninVerificationStatus: string;
  tier: string;
  verified: boolean;
  bvn?: string;
  nin?: string;
}

export const getKycStatus = () =>
  client.get<ApiResponse<KycStatus>>('/kyc').then(r => r.data);

export const submitKyc = (data: { bvn: string; nin: string }) =>
  client.post<ApiResponse<KycStatus>>('/kyc', data).then(r => r.data);