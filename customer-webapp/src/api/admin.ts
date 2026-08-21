import client from './client';
import type {
  AdminAccount,
  AdminBeneficiary,
  AdminCard,
  AdminCustomer,
  AdminCustomerDetail,
  AdminKyc,
  AdminPermission,
  AdminRole,
  AdminUser,
  ApiResponse,
  AccountTypeLimit,
  BillPayment,
  Paginated,
  Transaction,
} from '../types';

export const adminListAccounts = (params: { page?: number; size?: number; status?: string } = {}) =>
  client.get<ApiResponse<Paginated<AdminAccount>>>('/admin/accounts', { params }).then(r => r.data);

export const adminUpdateAccountStatus = (id: string, status: string) =>
  client.patch<ApiResponse<AdminAccount>>(`/admin/accounts/${id}/status`, { status }).then(r => r.data);

export const adminListLimits = (params: { page?: number; size?: number } = {}) =>
  client.get<ApiResponse<Paginated<AccountTypeLimit>>>('/admin/limits', { params }).then(r => r.data);

export const adminUpdateLimits = (accountType: string, data: { dailyTransferLimit: number }) =>
  client.put<ApiResponse<AccountTypeLimit>>(`/admin/limits/${accountType}`, data).then(r => r.data);

export const adminListTransactions = (params: Record<string, unknown> = {}) =>
  client.get<ApiResponse<Paginated<Transaction>>>('/admin/transactions', { params }).then(r => r.data);

export const adminReverseTransaction = (id: string, reason?: string) =>
  client.post<ApiResponse<Transaction>>(`/admin/transactions/${id}/reverse`, { reason }).then(r => r.data);

export const adminRefundTransaction = (id: string, reason?: string) =>
  client.post<ApiResponse<Transaction>>(`/admin/transactions/${id}/refund`, { reason }).then(r => r.data);

export const adminHoldTransaction = (id: string) =>
  client.post<ApiResponse<Transaction>>(`/admin/transactions/${id}/hold`).then(r => r.data);

export const adminReleaseTransaction = (id: string) =>
  client.post<ApiResponse<Transaction>>(`/admin/transactions/${id}/release`).then(r => r.data);

export const adminListCustomers = (params: { page?: number; size?: number; search?: string } = {}) =>
  client.get<ApiResponse<Paginated<AdminCustomer>>>('/admin/customers', { params }).then(r => r.data);

export const adminGetCustomer = (id: number) =>
  client.get<ApiResponse<AdminCustomerDetail>>(`/admin/customers/${id}`).then(r => r.data);

export const adminListKyc = (params: { page?: number; size?: number; status?: string } = {}) =>
  client.get<ApiResponse<Paginated<AdminKyc>>>('/admin/kyc', { params }).then(r => r.data);

export const adminApproveKyc = (id: number) =>
  client.post<ApiResponse<AdminKyc>>(`/admin/kyc/${id}/approve`).then(r => r.data);

export const adminRejectKyc = (id: number, reason?: string) =>
  client.post<ApiResponse<AdminKyc>>(`/admin/kyc/${id}/reject`, { reason }).then(r => r.data);

export const adminListCards = (params: { page?: number; size?: number; status?: string; cardType?: string; search?: string } = {}) =>
  client.get<ApiResponse<Paginated<AdminCard>>>('/admin/cards', { params }).then(r => r.data);

export const adminFreezeCard = (id: string) =>
  client.post<ApiResponse<AdminCard>>(`/admin/cards/${id}/freeze`).then(r => r.data);

export const adminUnfreezeCard = (id: string) =>
  client.post<ApiResponse<AdminCard>>(`/admin/cards/${id}/unfreeze`).then(r => r.data);

export const adminListBeneficiaries = (params: { page?: number; size?: number; search?: string } = {}) =>
  client.get<ApiResponse<Paginated<AdminBeneficiary>>>('/admin/beneficiaries', { params }).then(r => r.data);

export const adminDeleteBeneficiary = (id: string) =>
  client.delete<ApiResponse<string>>(`/admin/beneficiaries/${id}`).then(r => r.data);

export const adminListPayments = (params: { page?: number; size?: number; provider?: string; status?: string } = {}) =>
  client.get<ApiResponse<Paginated<BillPayment>>>('/admin/payments', { params }).then(r => r.data);

export const adminListRoles = (params: { page?: number; size?: number } = {}) =>
  client.get<ApiResponse<Paginated<AdminRole>>>('/admin/roles', { params }).then(r => r.data);

export const adminCreateRole = (data: { roleName: string; description?: string; permissions: string[] }) =>
  client.post<ApiResponse<AdminRole>>('/admin/roles', data).then(r => r.data);

export const adminUpdateRolePermissions = (id: number, permissions: string[]) =>
  client.put<ApiResponse<AdminRole>>(`/admin/roles/${id}/permissions`, { permissions }).then(r => r.data);

export const adminDeleteRole = (id: number) =>
  client.delete<ApiResponse<string>>(`/admin/roles/${id}`).then(r => r.data);

export const adminListPermissions = () =>
  client.get<ApiResponse<AdminPermission[]>>('/admin/roles/permissions/all').then(r => r.data);

export const adminListAdmins = (params: { page?: number; size?: number } = {}) =>
  client.get<ApiResponse<Paginated<AdminUser>>>('/admin/admins', { params }).then(r => r.data);

export const adminCreateAdmin = (data: { username: string; email: string; password: string; roles: string[] }) =>
  client.post<ApiResponse<AdminUser>>('/admin/admins', data).then(r => r.data);

export const adminSetAdminStatus = (id: number, enabled: boolean) =>
  client.patch<ApiResponse<AdminUser>>(`/admin/admins/${id}/status`, { enabled }).then(r => r.data);

export const adminAdjust = (type: 'credit' | 'debit' | 'balance', data: { accountNumber: string; amount: number; reason?: string; reference?: string }) =>
  client.post<ApiResponse<null>>(`/admin/adjustments/${type}`, data).then(r => r.data);