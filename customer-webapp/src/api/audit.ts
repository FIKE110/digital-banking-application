import client from './client';
import type { ApiResponse, Paginated } from '../types';

export interface AuditEvent {
  id: string;
  eventType: string;
  action: string;
  actorId: string;
  actorType: string;
  actorName: string;
  actorEmail: string;
  targetType: string;
  targetId: string;
  targetName: string;
  ipAddress: string;
  userAgent: string;
  deviceId: string;
  serviceName: string;
  requestId: string;
  correlationId: string;
  status: string;
  riskLevel: string;
  reason: string;
  before: string | null;
  after: string | null;
  metadata: string | null;
  amount: string | null;
  currency: string | null;
  occurredAt: string;
  createdAt: string;
}

export interface AuditStats {
  totalEvents: number;
  criticalEvents: number;
  highEvents: number;
  last24h: number;
}

export const auditList = (params?: {
  eventType?: string;
  actorId?: string;
  targetType?: string;
  targetId?: string;
  correlationId?: string;
  status?: string;
  riskLevel?: string;
  actorType?: string;
  page?: number;
  size?: number;
}) =>
  client.get<ApiResponse<Paginated<AuditEvent>>>('/audit-events', { params }).then(r => r.data);

export const auditGetById = (id: string) =>
  client.get<ApiResponse<AuditEvent>>(`/audit-events/${id}`).then(r => r.data);

export const auditGetStats = (params?: {
  actorId?: string;
  riskLevel?: string;
}) =>
  client.get<ApiResponse<AuditStats>>('/audit-events/stats', { params }).then(r => r.data);

export const auditGetHighRisk = (params?: {
  page?: number;
  size?: number;
}) =>
  client.get<ApiResponse<Paginated<AuditEvent>>>('/audit-events/high-risk', { params }).then(r => r.data);
