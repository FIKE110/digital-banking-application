import client from './client';
import type { ApiResponse, Paginated, Transaction } from '../types';

export interface TransactionFilter {
  page?: number;
  size?: number;
  type?: string;
  accountNumber?: string;
  from?: string;
  to?: string;
  q?: string;
}

export const getTransactions = (params: TransactionFilter = {}) =>
  client.get<ApiResponse<Paginated<Transaction>>>('/ledger/transactions', { params }).then(r => r.data);

export const getAccountEntries = (accountNumber: string) =>
  client.get<ApiResponse<Transaction[]>>(`/ledger/accounts/${accountNumber}/entries`).then(r => r.data);
