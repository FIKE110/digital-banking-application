import client from './client';
import type { ApiResponse, BillPayment, BillerCatalogItem } from '../types';

export const payBill = (data: {
  sourceAccountNumber: string;
  provider: string;
  customerReference: string;
  amount: number;
  description?: string;
}) => client.post<ApiResponse<BillPayment>>('/bills/pay', data).then(r => r.data);

export const getBillPayments = () =>
  client.get<ApiResponse<BillPayment[]>>('/bills/payments').then(r => r.data);

export const getBillerCatalog = () =>
  client.get<ApiResponse<BillerCatalogItem[]>>('/bills/catalog').then(r => r.data);
