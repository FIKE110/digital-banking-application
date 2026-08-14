import client from './client';
import type { ApiResponse, Transfer } from '../types';

export const initiateTransfer = (data: {
  sourceAccountNumber: string;
  destinationAccountNumber: string;
  amount: number;
  description?: string;
  pin?: string;
  idempotencyKey?: string;
}) => client.post<ApiResponse<Transfer>>('/transfers', data).then(r => r.data);

export const resolveAccount = (accountNumber: string) =>
  client.get<ApiResponse<{ accountNumber: string; accountName: string; currency: string; status: string; transferable: boolean }>>(
    '/transfers/resolve',
    { params: { accountNumber } },
  ).then(r => r.data);

export const getTransfers = () =>
  client.get<ApiResponse<Transfer[]>>('/transfers').then(r => r.data);

export const reverseTransfer = (id: string) =>
  client.post<ApiResponse<Transfer>>(`/transfers/${id}/reverse`).then(r => r.data);
