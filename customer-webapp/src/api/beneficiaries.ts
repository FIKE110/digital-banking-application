import client from './client';
import type { ApiResponse, Beneficiary } from '../types';

export const getBeneficiaries = () =>
  client.get<ApiResponse<Beneficiary[]>>('/beneficiaries').then(r => r.data);

export const createBeneficiary = (data: {
  alias: string;
  accountNumber: string;
  bankName?: string;
  description?: string;
}) => client.post<ApiResponse<Beneficiary>>('/beneficiaries', data).then(r => r.data);

export const deleteBeneficiary = (id: string) =>
  client.delete<ApiResponse<unknown>>(`/beneficiaries/${id}`).then(r => r.data);
