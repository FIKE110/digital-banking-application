import client from './client';
import type { ApiResponse } from '../types';

export const KYC_STATES = {
  NOT_STARTED: 'NOT_STARTED',
  IN_PROGRESS: 'IN_PROGRESS',
  SUBMITTED: 'SUBMITTED',
  UNDER_REVIEW: 'UNDER_REVIEW',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
} as const;

export interface KycStatus {
  id?: number;
  status?: string;
  bvnVerificationStatus: string;
  ninVerificationStatus: string;
  tier: string;
  verified: boolean;
  bvn?: string;
  nin?: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  gender?: string;
  phoneNumber?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  rejectionReason?: string;
  submittedAt?: string;
  approvedAt?: string;
}

export interface KycSubmitPayload {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  phoneNumber: string;
  address: string;
  city: string;
  state: string;
  country: string;
  bvn: string;
  nin: string;
}

export const getKycStatus = () =>
  client.get<ApiResponse<KycStatus>>('/kyc').then(r => r.data);

export const submitKyc = (data: KycSubmitPayload) =>
  client.post<ApiResponse<KycStatus>>('/kyc', data).then(r => r.data);