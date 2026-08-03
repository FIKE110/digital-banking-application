import { useCallback, useEffect, useState } from 'react';
import { adminListPayments } from '../api/admin';
import { formatMoney, formatDateTime } from '../utils/format';
import { PageHeader } from '../ui/Card';
import { StatusBadge } from '../ui/Badge';
import Icon from '../ui/Icon';
import { SkeletonRows } from '../ui/Skeleton';
import { EmptyState, ErrorState } from '../ui/States';
import type { BillPayment, Paginated } from '../types';

const PAGE_SIZE = 15;
const PAY_STATUSES = ['', 'PENDING', 'COMPLETED', 'FAILED'];

export default function AdminPayments() {
  const [pageData, setPageData] = useState<Paginated<BillPayment> | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [page, setPage] = useState(0);
  const [providerFilter, setProviderFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchPayments = useCallback(async () => {
    try {
      const params: Record<string, unknown> = { page, size: PAGE_SIZE };
      if (providerFilter) params.provider = providerFilter;
      if (statusFilter) params.status = statusFilter;
      const r = await adminListPayments(params);
      setPageData(r.data ?? null);
    } catch (err: any) {
      setLoadError(err.response?.data?.message || 'Failed to load payments');
    } finally {
      setLoading(false);
    }
  }, [page, providerFilter, statusFilter]);

  useEffect(() => { fetchPayments(); }, [fetchPayments]);

  const items = pageData?.content ?? [];
  const totalPages = pageData?.totalPages ?? 0;

  if (loading) return <SkeletonRows rows={7} />;
  if (loadError) return <ErrorState title="Couldn't load payments" body={loadError} onRetry={fetchPayments} />;

  return (
    <div className="stack" style={{ gap: 24 }}>
      <PageHeader
        title="Admin · Payments"
        subtitle="Review all bill payments across customers"
        actions={<span className="badge badge--warning"><Icon name="shield" size={11} /> Administrator</span>}
      />

      <div className="surface" style={{ padding: 'var(--space-4)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 'var(--space-3)' }}>
          <input
            type="text"
            placeholder="Provider (e.g. AEDC, MTN)"
            value={providerFilter}
            onChange={e => { setProviderFilter(e.target.value); setPage(0); }}
            className="input"
          />
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(0); }} className="input">
            {PAY_STATUSES.map(s => <option key={s} value={s}>{s || 'All Statuses'}</option>)}
          </select>
        </div>
      </div>

      <div className="surface" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Source Account</th>
                <th>Provider</th>
                <th>Customer Ref</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {items.map(p => (
                <tr key={p.id}>
                  <td className="mono text-sm">{p.reference}</td>
                  <td className="mono text-sm">{p.sourceAccountNumber}</td>
                  <td className="font-semibold text-sm">{p.provider}</td>
                  <td className="text-sm">{p.customerReference || '—'}</td>
                  <td className="font-semibold tabular">{formatMoney(p.amount, 'NGN')}</td>
                  <td><StatusBadge status={p.status} /></td>
                  <td className="text-sm">{formatDateTime(p.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {items.length === 0 && <EmptyState icon="zap" title="No payments found" body="Bill payments made by customers will appear here." />}
      </div>

      {totalPages > 1 && (
        <div className="row" style={{ justifyContent: 'center', gap: 8, alignItems: 'center' }}>
          <button className="btn btn--ghost btn--sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>Previous</button>
          <span className="text-muted" style={{ fontSize: 13 }}>Page {page + 1} of {totalPages}</span>
          <button className="btn btn--ghost btn--sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>Next</button>
        </div>
      )}
    </div>
  );
}