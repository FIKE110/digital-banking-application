import client from './client';
import type { Account, AccountBalance, AccountDetail, ApiResponse, DepositResponse } from '../types';

export const createAccount = (data: {
  accountName: string;
  accountType: string;
  currency: string;
  openingBalance: number;
  status: string;
}) => client.post<ApiResponse<AccountDetail>>('/accounts', data).then(r => r.data);

export const getAccounts = () =>
  client.get<ApiResponse<Account[]>>('/accounts').then(r => r.data);

export const getAccount = (id: string) =>
  client.get<ApiResponse<AccountDetail>>(`/accounts/${id}`).then(r => r.data);

export const getBalance = (id: string) =>
  client.get<ApiResponse<AccountBalance>>(`/accounts/${id}/balance`).then(r => r.data);

export const deposit = (id: string, amount: number, description?: string) =>
  client.post<ApiResponse<DepositResponse>>(`/accounts/${id}/deposit`, { amount, description }).then(r => r.data);
