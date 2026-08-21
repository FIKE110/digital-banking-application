import { useCallback, useEffect, useState } from 'react';
import { auditGetStats, auditGetHighRisk, type AuditEvent, type AuditStats } from '../api/audit';
import { adminListAccounts, adminListLimits } from '../api/admin';
import { formatMoney, formatDate } from '../utils/format';
import { PageHeader } from '../ui/Card';
import Icon from '../ui/Icon';
import { SkeletonRows } from '../ui/Skeleton';
import { ErrorState } from '../ui/States';
import { useNavigate } from 'react-router-dom';
import type { AdminAccount, AccountTypeLimit } from '../types';

function RiskBadge({ level }: { level: string }) {
  const colors: Record<string, string> = {
    LOW: '#00c853',
    MEDIUM: '#ff9800',
    HIGH: '#ff5722',
    CRITICAL: '#ff1744',
  };
  const bg: Record<string, string> = {
    LOW: '#e6f9ef',
    MEDIUM: '#fff3e0',
    HIGH: '#fbe9e7',
    CRITICAL: '#ffebee',
  };
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '2px 8px',
        borderRadius: 4,
        fontSize: 11,
        fontWeight: 700,
        color: colors[level] || '#6b6b6b',
        background: bg[level] || '#f5f5f5',
      }}
    >
      {level === 'CRITICAL' && <Icon name="alert" size={10} />}
      {level}
    </span>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<AuditStats | null>(null);
  const [highRiskEvents, setHighRiskEvents] = useState<AuditEvent[]>([]);
  const [accounts, setAccounts] = useState<AdminAccount[]>([]);
  const [limits, setLimits] = useState<AccountTypeLimit[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, highRiskRes, accountsRes, limitsRes] = await Promise.all([
        auditGetStats(),
        auditGetHighRisk({ page: 0, size: 10 }),
        adminListAccounts(),
        adminListLimits(),
      ]);

      setStats(statsRes.data as AuditStats);
      setHighRiskEvents((highRiskRes.data as unknown as { content?: AuditEvent[] })?.content ?? []);
      setAccounts(((accountsRes.data as unknown as { content?: AdminAccount[] })?.content) ?? []);
      setLimits(((limitsRes.data as unknown as { content?: AccountTypeLimit[] })?.content) ?? []);
    } catch (err: any) {
      setLoadError(err.response?.data?.message || 'Failed to load admin dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return <SkeletonRows rows={7} />;
  if (loadError) return <ErrorState title="Couldn't load dashboard" body={loadError} onRetry={fetchData} />;

  const activeAccounts = accounts.filter(a => a.status === 'ACTIVE').length;
  const totalDeposits = accounts.reduce((s, a) => s + Number(a.balance ?? 0), 0);

  return (
    <div className="stack" style={{ gap: 24 }}>
      <PageHeader
        title="Dashboard"
        subtitle="System overview and admin activity"
        actions={
          <span className="badge badge--warning">
            <Icon name="shield" size={11} /> Administrator
          </span>
        }
      />

      {/* Stats Grid */}
      <div className="grid-4" style={{ gap: 16 }}>
        <div className="surface stat-card">
          <div className="stat-card__icon"><Icon name="bank" size={18} /></div>
          <div>
            <div className="stat-card__label">Total Accounts</div>
            <div className="stat-card__value">{accounts.length}</div>
          </div>
        </div>
        <div className="surface stat-card">
          <div className="stat-card__icon stat-card__icon--success"><Icon name="checkCircle" size={18} /></div>
          <div>
            <div className="stat-card__label">Active</div>
            <div className="stat-card__value">{activeAccounts}</div>
          </div>
        </div>
        <div className="surface stat-card">
          <div className="stat-card__icon stat-card__icon--info"><Icon name="wallet" size={18} /></div>
          <div>
            <div className="stat-card__label">Total Deposits</div>
            <div className="stat-card__value">{formatMoney(totalDeposits, 'NGN')}</div>
          </div>
        </div>
        <div className="surface stat-card">
          <div className="stat-card__icon stat-card__icon--warning"><Icon name="shield" size={18} /></div>
          <div>
            <div className="stat-card__label">Audit Events (24h)</div>
            <div className="stat-card__value">{stats?.last24h ?? 0}</div>
          </div>
        </div>
      </div>

      {/* Risk Stats */}
      <div className="grid-3" style={{ gap: 16 }}>
        <div className="surface stat-card">
          <div className="stat-card__icon" style={{ color: '#ff1744' }}><Icon name="alert" size={18} /></div>
          <div>
            <div className="stat-card__label">Critical Events</div>
            <div className="stat-card__value" style={{ color: '#ff1744' }}>{stats?.criticalEvents ?? 0}</div>
          </div>
        </div>
        <div className="surface stat-card">
          <div className="stat-card__icon" style={{ color: '#ff5722' }}><Icon name="alert" size={18} /></div>
          <div>
            <div className="stat-card__label">High Risk Events</div>
            <div className="stat-card__value" style={{ color: '#ff5722' }}>{stats?.highEvents ?? 0}</div>
          </div>
        </div>
        <div className="surface stat-card">
          <div className="stat-card__icon"><Icon name="search" size={18} /></div>
          <div>
            <div className="stat-card__label">Total Events</div>
            <div className="stat-card__value">{stats?.totalEvents ?? 0}</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="surface" style={{ padding: 20 }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6b6b6b' }}>
          Quick Actions
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
          <button
            className="btn btn--primary"
            onClick={() => navigate('/admin/accounts')}
            style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}
          >
            <Icon name="bank" size={14} /> Manage Accounts
          </button>
          <button
            className="btn btn--primary"
            onClick={() => navigate('/admin/audit')}
            style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}
          >
            <Icon name="search" size={14} /> Audit Trail
          </button>
          <button
            className="btn btn--primary"
            onClick={() => navigate('/admin/limits')}
            style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}
          >
            <Icon name="wallet" size={14} /> Transaction Limits
          </button>
        </div>
      </div>

      {/* High Risk Activity */}
      <div className="surface" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-hairline, #e6e6e6)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6b6b6b' }}>
            High Risk Activity
          </h3>
          <button
            className="btn btn--ghost"
            onClick={() => navigate('/admin/audit')}
            style={{ fontSize: 12 }}
          >
            View All <Icon name="chevronRight" size={12} />
          </button>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Risk</th>
                <th>Event</th>
                <th>Admin</th>
                <th>Target</th>
                <th>Reason</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {highRiskEvents.map(event => (
                <tr key={event.id}>
                  <td><RiskBadge level={event.riskLevel} /></td>
                  <td className="text-sm" style={{ fontWeight: 600 }}>{event.eventType}</td>
                  <td className="text-sm">{event.actorName || event.actorId?.slice(0, 8)}</td>
                  <td className="text-sm">
                    <div>{event.targetName || event.targetId?.slice(0, 16)}</div>
                    <div style={{ fontSize: 11, color: '#6b6b6b' }}>{event.targetType}</div>
                  </td>
                  <td className="text-sm" style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {event.reason || '-'}
                  </td>
                  <td className="text-sm mono">{formatDate(event.occurredAt)}</td>
                </tr>
              ))}
              {highRiskEvents.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: 32, color: '#6b6b6b' }}>
                    No high-risk events recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Account Type Limits */}
      <div className="surface" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-hairline, #e6e6e6)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6b6b6b' }}>
            Account Type Limits
          </h3>
          <button
            className="btn btn--ghost"
            onClick={() => navigate('/admin/limits')}
            style={{ fontSize: 12 }}
          >
            Manage <Icon name="chevronRight" size={12} />
          </button>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Account Type</th>
                <th>Daily Transfer Limit</th>
                <th>Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {limits.map(limit => (
                <tr key={limit.accountType}>
                  <td className="text-sm" style={{ fontWeight: 600 }}>{limit.accountType}</td>
                  <td className="text-sm tabular">{formatMoney(limit.dailyTransferLimit, 'NGN')}</td>
                  <td className="text-sm mono">{formatDate(limit.updatedAt)}</td>
                </tr>
              ))}
              {limits.length === 0 && (
                <tr>
                  <td colSpan={3} style={{ textAlign: 'center', padding: 32, color: '#6b6b6b' }}>
                    No limits configured.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
