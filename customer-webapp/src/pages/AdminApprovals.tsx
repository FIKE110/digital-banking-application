import { useCallback, useEffect, useState } from 'react';
import { adminListApprovals, adminApproveApproval, adminRejectApproval } from '../api/admin';
import { formatDateTime } from '../utils/format';
import { PageHeader } from '../ui/Card';
import { StatusBadge } from '../ui/Badge';
import Icon from '../ui/Icon';
import { SkeletonRows } from '../ui/Skeleton';
import { EmptyState, ErrorState } from '../ui/States';
import Dialog from '../ui/Dialog';
import { useToast } from '../ui/Toast';
import type { AdminApproval, Paginated } from '../types';

const PAGE_SIZE = 15;
const APPROVAL_STATUSES = ['', 'PENDING', 'APPROVED', 'REJECTED', 'EXPIRED'];
const ACTION_TYPES = ['', 'TRANSACTION_REVERSAL', 'TRANSACTION_REFUND', 'MANUAL_CREDIT', 'MANUAL_DEBIT', 'BALANCE_ADJUSTMENT'];

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

function parsePayload(payload: string): Record<string, unknown> {
  try {
    return JSON.parse(payload);
  } catch {
    return {};
  }
}

export default function AdminApprovals() {
  const { success, error: toastError } = useToast();
  const [pageData, setPageData] = useState<Paginated<AdminApproval> | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [actionFilter, setActionFilter] = useState('');
  const [busyId, setBusyId] = useState<number | null>(null);
  const [review, setReview] = useState<{ approval: AdminApproval; kind: 'approve' | 'reject' } | null>(null);
  const [note, setNote] = useState('');

  const fetchApprovals = useCallback(async () => {
    try {
      const params: Record<string, unknown> = { page, size: PAGE_SIZE };
      if (statusFilter) params.status = statusFilter;
      if (actionFilter) params.actionType = actionFilter;
      const r = await adminListApprovals(params);
      setPageData(r.data ?? null);
    } catch (err: any) {
      setLoadError(err.response?.data?.message || 'Failed to load approvals');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, actionFilter]);

  useEffect(() => { fetchApprovals(); }, [fetchApprovals]);

  const submitReview = async () => {
    if (!review) return;
    setBusyId(review.approval.id);
    try {
      if (review.kind === 'approve') {
        await adminApproveApproval(review.approval.id, note || undefined);
        success('Approval approved and action executed');
      } else {
        await adminRejectApproval(review.approval.id, note || undefined);
        success('Approval rejected');
      }
      setReview(null);
      setNote('');
      await fetchApprovals();
    } catch (err: any) {
      toastError(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setBusyId(null);
    }
  };

  const approvals = pageData?.content ?? [];
  const totalPages = pageData?.totalPages ?? 0;

  if (loading) return <SkeletonRows rows={7} />;
  if (loadError) return <ErrorState title="Couldn't load approvals" body={loadError} onRetry={fetchApprovals} />;

  return (
    <div className="stack" style={{ gap: 24 }}>
      <PageHeader
        title="Admin · Approval Queue"
        subtitle="Maker-checker: review and approve pending admin actions"
        actions={
          <>
            <span className="badge badge--warning"><Icon name="shield" size={11} /> Administrator</span>
            <span className="badge badge--info"><Icon name="clock" size={11} /> 24h expiry</span>
          </>
        }
      />

      <div className="surface" style={{ padding: 'var(--space-4)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 'var(--space-3)' }}>
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(0); }} className="input">
            {APPROVAL_STATUSES.map(s => <option key={s} value={s}>{s || 'All Statuses'}</option>)}
          </select>
          <select value={actionFilter} onChange={e => { setActionFilter(e.target.value); setPage(0); }} className="input">
            {ACTION_TYPES.map(t => <option key={t} value={t}>{t || 'All Action Types'}</option>)}
          </select>
        </div>
      </div>

      <div className="surface" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Action</th>
                <th>Requested By</th>
                <th>Risk</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Expires</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {approvals.map(a => (
                <tr key={a.id}>
                  <td className="mono text-sm">#{a.id}</td>
                  <td className="text-sm" style={{ fontWeight: 600 }}>{a.actionType}</td>
                  <td className="text-sm">{a.requestedByName}</td>
                  <td><RiskBadge level={a.riskLevel} /></td>
                  <td className="text-sm" style={{ maxWidth: 220 }}>
                    <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {a.reason || '—'}
                    </span>
                  </td>
                  <td><StatusBadge status={a.status} /></td>
                  <td className="text-sm">{formatDateTime(a.expiresAt)}</td>
                  <td>
                    {a.status === 'PENDING' ? (
                      <div className="row" style={{ gap: 6 }}>
                        <button className="btn btn--sm btn--brand" disabled={busyId === a.id} onClick={() => { setReview({ approval: a, kind: 'approve' }); setNote(''); }}>
                          <Icon name="check" size={13} /> Approve
                        </button>
                        <button className="btn btn--sm btn--danger-ghost" disabled={busyId === a.id} onClick={() => { setReview({ approval: a, kind: 'reject' }); setNote(''); }}>
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-sm muted">{a.reviewedByName || '—'}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {approvals.length === 0 && <EmptyState icon="clock" title="No approvals found" body="Pending admin actions will appear here for review." />}
      </div>

      {totalPages > 1 && (
        <div className="row" style={{ justifyContent: 'center', gap: 8, alignItems: 'center' }}>
          <button className="btn btn--ghost btn--sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>Previous</button>
          <span className="text-muted" style={{ fontSize: 13 }}>Page {page + 1} of {totalPages}</span>
          <button className="btn btn--ghost btn--sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>Next</button>
        </div>
      )}

      <Dialog
        open={!!review}
        onClose={() => setReview(null)}
        title={review?.kind === 'approve' ? 'Approve action' : 'Reject action'}
        subtitle={review ? `${review.approval.actionType} · #${review.approval.id} · ${review.approval.requestedByName}` : undefined}
        footer={
          <>
            <button className="btn btn--ghost" onClick={() => setReview(null)}>Cancel</button>
            {review?.kind === 'approve' && <button className="btn btn--brand" onClick={submitReview} disabled={busyId !== null}>Approve & execute</button>}
            {review?.kind === 'reject' && <button className="btn btn--danger" onClick={submitReview} disabled={busyId !== null}>Reject</button>}
          </>
        }
      >
        {review && (
          <div className="stack" style={{ gap: 12 }}>
            <div className="surface" style={{ padding: 'var(--space-3)', fontSize: 13 }}>
              {Object.entries(parsePayload(review.approval.actionPayload)).map(([key, value]) => (
                <div key={key} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid var(--color-hairline, #eee)' }}>
                  <span className="muted">{key}</span>
                  <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>{String(value)}</span>
                </div>
              ))}
            </div>
            <div className="field">
              <label className="field__label">{review.kind === 'approve' ? 'Note (optional)' : 'Reason for rejection'}</label>
              <textarea className="textarea" rows={3} value={note} onChange={e => setNote(e.target.value)} placeholder="Add a note for the audit trail" />
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}