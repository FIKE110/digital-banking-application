import { useCallback, useEffect, useState } from 'react';
import { auditList, auditGetById, type AuditEvent } from '../api/audit';
import { formatMoney, formatDate, formatDateTime } from '../utils/format';
import { PageHeader } from '../ui/Card';
import { StatusBadge } from '../ui/Badge';
import Icon from '../ui/Icon';
import { SkeletonRows } from '../ui/Skeleton';
import { EmptyState, ErrorState } from '../ui/States';
import { useToast } from '../ui/Toast';
import type { Paginated } from '../types';

const RISK_LEVELS = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const ACTOR_TYPES = ['ADMIN', 'USER', 'SYSTEM'];
const STATUS_OPTIONS = ['COMPLETED', 'PENDING', 'FAILED'];

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
        letterSpacing: '0.02em',
      }}
    >
      {level === 'CRITICAL' && <Icon name="alert" size={10} />}
      {level}
    </span>
  );
}

function EventDetailModal({ event, onClose }: { event: AuditEvent; onClose: () => void }) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: 24,
      }}
      onClick={onClose}
    >
      <div
        className="surface"
        style={{ maxWidth: 600, width: '100%', maxHeight: '80vh', overflow: 'auto', padding: 0 }}
        onClick={e => e.stopPropagation()}
      >
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--color-hairline, #e6e6e6)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Audit Event Detail</h3>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6b6b6b', fontFamily: 'monospace' }}>
              {event.id}
            </p>
          </div>
          <button className="btn btn--ghost" onClick={onClose} style={{ padding: 4 }}>
            <Icon name="x" size={16} />
          </button>
        </div>

        <div style={{ padding: 20 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, alignItems: 'center' }}>
            <RiskBadge level={event.riskLevel} />
            <StatusBadge status={event.status} />
            <span style={{ fontSize: 12, color: '#6b6b6b' }}>
              {formatDate(event.occurredAt)}
            </span>
          </div>

          <table width="100%" cellPadding={0} cellSpacing={0} style={{ fontSize: 13 }}>
            <tbody>
              <tr>
                <td style={{ padding: '8px 0', color: '#6b6b6b', width: 120 }}>Event Type</td>
                <td style={{ padding: '8px 0', fontWeight: 600 }}>{event.eventType}</td>
              </tr>
              <tr>
                <td style={{ padding: '8px 0', color: '#6b6b6b' }}>Action</td>
                <td style={{ padding: '8px 0', fontWeight: 600 }}>{event.action || '—'}</td>
              </tr>
              <tr>
                <td style={{ padding: '8px 0', color: '#6b6b6b' }}>Actor</td>
                <td style={{ padding: '8px 0' }}>
                  <div style={{ fontWeight: 600 }}>{event.actorName || event.actorId}</div>
                  <div style={{ fontSize: 11, color: '#6b6b6b' }}>
                    {event.actorType} · {event.actorEmail || 'N/A'}
                  </div>
                </td>
              </tr>
              <tr>
                <td style={{ padding: '8px 0', color: '#6b6b6b' }}>Target</td>
                <td style={{ padding: '8px 0' }}>
                  <div style={{ fontWeight: 600 }}>{event.targetName || event.targetId}</div>
                  <div style={{ fontSize: 11, color: '#6b6b6b' }}>{event.targetType}</div>
                </td>
              </tr>
              {event.reason && (
                <tr>
                  <td style={{ padding: '8px 0', color: '#6b6b6b' }}>Reason</td>
                  <td style={{ padding: '8px 0', fontWeight: 500 }}>{event.reason}</td>
                </tr>
              )}
              <tr>
                <td style={{ padding: '8px 0', color: '#6b6b6b' }}>Timestamp</td>
                <td style={{ padding: '8px 0', fontFamily: 'monospace', fontSize: 12 }}>
                  {formatDateTime(event.occurredAt)}
                </td>
              </tr>
              {event.amount && (
                <tr>
                  <td style={{ padding: '8px 0', color: '#6b6b6b' }}>Amount</td>
                  <td style={{ padding: '8px 0', fontWeight: 700, color: '#00c853' }}>
                    {formatMoney(Number(event.amount), event.currency || 'NGN')}
                  </td>
                </tr>
              )}
              {event.before && (
                <tr>
                  <td style={{ padding: '8px 0', color: '#6b6b6b' }}>Before</td>
                  <td style={{ padding: '8px 0', fontFamily: 'monospace', fontSize: 12 }}>{event.before}</td>
                </tr>
              )}
              {event.after && (
                <tr>
                  <td style={{ padding: '8px 0', color: '#6b6b6b' }}>After</td>
                  <td style={{ padding: '8px 0', fontFamily: 'monospace', fontSize: 12 }}>{event.after}</td>
                </tr>
              )}
              <tr>
                <td style={{ padding: '8px 0', color: '#6b6b6b' }}>IP Address</td>
                <td style={{ padding: '8px 0', fontFamily: 'monospace', fontSize: 12 }}>
                  {event.ipAddress || '—'}
                </td>
              </tr>
              <tr>
                <td style={{ padding: '8px 0', color: '#6b6b6b' }}>User Agent</td>
                <td style={{ padding: '8px 0', fontSize: 12, wordBreak: 'break-all' }}>
                  {event.userAgent || '—'}
                </td>
              </tr>
              <tr>
                <td style={{ padding: '8px 0', color: '#6b6b6b' }}>Service</td>
                <td style={{ padding: '8px 0', fontFamily: 'monospace', fontSize: 12 }}>
                  {event.serviceName || '—'}
                </td>
              </tr>
              <tr>
                <td style={{ padding: '8px 0', color: '#6b6b6b' }}>Request ID</td>
                <td style={{ padding: '8px 0', fontFamily: 'monospace', fontSize: 12 }}>
                  {event.requestId || '—'}
                </td>
              </tr>
              <tr>
                <td style={{ padding: '8px 0', color: '#6b6b6b' }}>Correlation ID</td>
                <td style={{ padding: '8px 0', fontFamily: 'monospace', fontSize: 12 }}>
                  {event.correlationId || '—'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function AdminAuditTrail() {
  const { error: toastError } = useToast();
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedEvent, setSelectedEvent] = useState<AuditEvent | null>(null);
  const [filters, setFilters] = useState({
    eventType: '',
    actorId: '',
    targetType: '',
    correlationId: '',
    status: '',
    riskLevel: '',
    actorType: '',
  });

  const fetchEvents = useCallback(async () => {
    try {
      const res = await auditList({
        ...filters,
        page,
        size: 50,
      });
      const data = res.data as Paginated<AuditEvent> | undefined;
      setEvents(data?.content ?? []);
      setTotalPages(data?.totalPages ?? 0);
    } catch (err: any) {
      setLoadError(err.response?.data?.message || 'Failed to load audit events');
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(0);
  };

  const clearFilters = () => {
    setFilters({
      eventType: '',
      actorId: '',
      targetType: '',
      correlationId: '',
      status: '',
      riskLevel: '',
      actorType: '',
    });
    setPage(0);
  };

  const handleRowClick = async (event: AuditEvent) => {
    try {
      const res = await auditGetById(event.id);
      setSelectedEvent(res.data as AuditEvent);
    } catch {
      toastError('Failed to load event details');
    }
  };

  if (loading) return <SkeletonRows rows={7} />;
  if (loadError) return <ErrorState title="Couldn't load audit events" body={loadError} onRetry={fetchEvents} />;

  return (
    <div className="stack" style={{ gap: 24 }}>
      <PageHeader
        title="Audit Trail"
        subtitle="View all system audit events with detailed filtering"
        actions={
          <button className="btn btn--ghost" onClick={clearFilters} style={{ marginRight: 8 }}>
            <Icon name="x" size={14} /> Clear filters
          </button>
        }
      />

      <div className="surface" style={{ padding: 'var(--space-4)', marginBottom: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 'var(--space-3)' }}>
          <input
            type="text"
            placeholder="Event type"
            value={filters.eventType}
            onChange={e => handleFilterChange('eventType', e.target.value)}
            className="input"
          />
          <input
            type="text"
            placeholder="Actor ID"
            value={filters.actorId}
            onChange={e => handleFilterChange('actorId', e.target.value)}
            className="input"
          />
          <input
            type="text"
            placeholder="Target type"
            value={filters.targetType}
            onChange={e => handleFilterChange('targetType', e.target.value)}
            className="input"
          />
          <input
            type="text"
            placeholder="Correlation ID"
            value={filters.correlationId}
            onChange={e => handleFilterChange('correlationId', e.target.value)}
            className="input"
          />
          <select
            value={filters.status}
            onChange={e => handleFilterChange('status', e.target.value)}
            className="input"
          >
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select
            value={filters.riskLevel}
            onChange={e => handleFilterChange('riskLevel', e.target.value)}
            className="input"
          >
            <option value="">All Risk Levels</option>
            {RISK_LEVELS.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          <select
            value={filters.actorType}
            onChange={e => handleFilterChange('actorType', e.target.value)}
            className="input"
          >
            <option value="">All Actor Types</option>
            {ACTOR_TYPES.map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="surface" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Risk</th>
                <th>Event Type</th>
                <th>Action</th>
                <th>Actor</th>
                <th>Target</th>
                <th>Status</th>
                <th>Time</th>
                <th>Correlation</th>
              </tr>
            </thead>
            <tbody>
              {events.map(event => (
                <tr
                  key={event.id}
                  onClick={() => handleRowClick(event)}
                  style={{ cursor: 'pointer' }}
                >
                  <td><RiskBadge level={event.riskLevel} /></td>
                  <td className="text-sm" style={{ fontWeight: 600 }}>{event.eventType}</td>
                  <td className="text-sm">{event.action || '—'}</td>
                  <td className="text-sm">
                    <div style={{ fontWeight: 500 }}>{event.actorName || event.actorId?.slice(0, 8)}</div>
                    <div style={{ fontSize: 11, color: '#6b6b6b' }}>{event.actorType}</div>
                  </td>
                  <td className="text-sm">
                    <div>{event.targetName || event.targetId?.slice(0, 16)}</div>
                    <div style={{ fontSize: 11, color: '#6b6b6b' }}>{event.targetType}</div>
                  </td>
                  <td><StatusBadge status={event.status} /></td>
                  <td className="text-sm mono">{formatDate(event.occurredAt)}</td>
                  <td className="text-sm mono">{event.correlationId?.slice(0, 12) || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {events.length === 0 && <EmptyState icon="search" title="No audit events found" body="Try adjusting your filters." />}
      </div>

      {totalPages > 1 && (
        <div className="row" style={{ justifyContent: 'center', gap: 8, marginTop: 16 }}>
          <button
            className="btn btn--ghost"
            disabled={page === 0}
            onClick={() => setPage(p => p - 1)}
          >
            <Icon name="chevronLeft" size={14} /> Previous
          </button>
          <span className="text-sm" style={{ alignSelf: 'center' }}>
            Page {page + 1} of {totalPages}
          </span>
          <button
            className="btn btn--ghost"
            disabled={page >= totalPages - 1}
            onClick={() => setPage(p => p + 1)}
          >
            Next <Icon name="chevronRight" size={14} />
          </button>
        </div>
      )}

      {selectedEvent && (
        <EventDetailModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      )}
    </div>
  );
}
