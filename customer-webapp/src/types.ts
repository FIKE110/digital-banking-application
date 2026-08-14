export interface ApiResponse<T> {
  success: string;
  message: string | null;
  data: T;
  metadata: Record<string, unknown> | null;
  requestId: string | null;
  timestamp: string;
}

export interface Paginated<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  hasNext: boolean;
  hasPrevious: boolean;
  empty: boolean;
}

export interface Token {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  token: Token;
}

export interface User {
  username: string;
  email: string;
  uid: string;
  roleNames: string[];
  permissions: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Account {
  id: string;
  accountNumber: string;
  accountName: string;
  accountType: string;
  balance: number;
  currency?: string;
  status: string;
}

export interface AccountDetail extends Account {
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface AccountBalance {
  accountId: string;
  accountNumber: string;
  balance: number;
  currency: string;
}

export interface DepositResponse {
  accountId: string;
  accountNumber: string;
  amount: number;
  description: string;
  balance: number;
  currency: string;
  reference: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  reference: string;
  accountNumber: string;
  counterpartyAccountNumber: string | null;
  amount: number;
  type: string;
  description: string | null;
  status: string;
  createdAt: string;
}

export interface Transfer {
  id: string;
  reference: string;
  sourceAccountNumber: string;
  destinationAccountNumber: string;
  amount: number;
  description: string | null;
  status: string;
  createdAt: string;
}

export interface Profile {
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
}

export interface AdminAccount extends Account {
  currency: string;
  userId: number;
  username?: string;
  email?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AccountTypeLimit {
  accountType: string;
  dailyTransferLimit: number;
  updatedAt: string;
}

export interface Beneficiary {
  id: string;
  alias: string;
  accountNumber: string;
  bankName?: string;
  description?: string;
  createdAt: string;
}

export interface BillPayment {
  id: string;
  reference: string;
  sourceAccountNumber: string;
  provider: string;
  customerReference: string;
  amount: number;
  description: string | null;
  status: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  type: 'SECURITY' | 'CREDIT' | 'DEBIT' | 'SYSTEM';
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}

export interface NotificationPreference {
  securityAlerts: boolean;
  transactionAlerts: boolean;
  promotionalUpdates: boolean;
}

export interface BillerCatalogItem {
  name: string;
  category: string;
}

export interface AdminDashboardStats {
  totalAccounts: number;
  activeAccounts: number;
  totalDeposits: number;
  totalTransfers: number;
  highRiskEvents: number;
  criticalEvents: number;
  last24hEvents: number;
}

export interface HighRiskEvent {
  id: string;
  eventType: string;
  action: string;
  actorId: string;
  actorType: string;
  actorName: string;
  targetType: string;
  targetId: string;
  targetName: string;
  riskLevel: string;
  reason: string;
  amount: string | null;
  occurredAt: string;
}

export interface AdminCustomer {
  id: number;
  username: string;
  email: string;
  uid: string;
  status: string;
  accountCount: number;
  createdAt: string;
}

export interface AdminCustomerDetail {
  customer: AdminCustomer;
  phoneNumber?: string;
  gender?: string;
  dateOfBirth?: string;
  kycStatus?: string;
  accounts: AdminAccount[];
  cardCount: number;
  beneficiaryCount: number;
}

export interface AdminKyc {
  id: number;
  userId: number;
  username: string;
  email: string;
  bvn: string;
  bvnStatus: string;
  nin: string;
  ninStatus: string;
  tier?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminCard {
  id: string;
  cardNumberLast4: string;
  cardType: string;
  expiryDate: string;
  status: string;
  dailyLimit: number;
  monthlyLimit: number;
  userId: number;
  username: string;
  accountNumber: string;
  createdAt: string;
}

export interface AdminBeneficiary {
  id: string;
  alias: string;
  accountNumber: string;
  bankName?: string;
  description?: string;
  userId: number;
  username: string;
  createdAt: string;
}

export interface AdminRole {
  id: number;
  roleName: string;
  description?: string;
  permissions: string[];
  createdAt: string;
}

export interface AdminPermission {
  id: number;
  permissionName: string;
  description?: string;
}

export interface AdminUser {
  id: number;
  username: string;
  email: string;
  status: string;
  roleNames: string[];
  permissions: string[];
  createdAt: string;
  lastLogoutDate?: string;
}

export interface AdminApproval {
  id: number;
  actionType: string;
  actionPayload: string;
  requestedBy: number;
  requestedByName: string;
  status: string;
  reviewedBy?: number;
  reviewedByName?: string;
  reviewNote?: string;
  reason?: string;
  riskLevel: string;
  correlationId: string;
  expiresAt: string;
  createdAt: string;
}
