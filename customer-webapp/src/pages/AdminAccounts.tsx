import { useCallback, useEffect, useState } from 'react';
import { adminListAccounts, adminUpdateAccountStatus } from '../api/admin';
import { formatMoney } from '../utils/format';
import { PageHeader } from '../ui/Card';
import { StatusBadge } from '../ui/Badge';
import Icon from '../ui/Icon';
import { SkeletonRows } from '../ui/Skeleton';
import { EmptyState, ErrorState } from '../ui/States';
import { useToast } from '../ui/Toast';
import type { AdminAccount, Paginated } from '../types';

const PAGE_SIZE = 15;

export default function AdminAccounts() {
  const { success, error: toastError } = useToast();
  const [pageData, setPageData] = useState<Paginated<AdminAccount> | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchAccounts = useCallback(async () => {
    try {
      const params: Record<string, unknown> = { page, size: PAGE_SIZE };
      if (statusFilter) params.status = statusFilter;
      const r = await adminListAccounts(params);
      setPageData(r.data ?? null);
    } catch (err: any) {
      setLoadError(err.response?.data?.message || 'Failed to load accounts');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => { fetchAccounts(); }, [fetchAccounts]);

  const handleStatusChange = async (id: string, status: string) => {
    setBusyId(id);
    try {
      await adminUpdateAccountStatus(id, status);
      success(`Account status set to ${status}`);
      await fetchAccounts();
    } catch (err: any) {
      toastError(err.response?.data?.message || 'Failed to update status');
    } finally {
      setBusyId(null);
    }
  };

  const accounts = pageData?.content ?? [];
  const totalPages = pageData?.totalPages ?? 0;

  if (loading) return <SkeletonRows rows={7} />;
  if (loadError) return <ErrorState title="Couldn't load accounts" body={loadError} onRetry={fetchAccounts} />;

  return (
    <div className="stack" style={{ gap: 24 }}>
      <PageHeader
        title="Admin · Account management"
        subtitle="Review and manage all customer accounts"
        actions={<span className="badge badge--warning"><Icon name="shield" size={11} /> Administrator</span>}
      />

      <div className="row" style={{ gap: 8, alignItems: 'center' }}>
        <select
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(0); }}
          className="select"
          style={{ padding: '6px 10px', fontSize: 13 }}
        >
          <option value="">All Statuses</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="FROZEN">FROZEN</option>
          <option value="CLOSED">CLOSED</option>
        </select>
        <span className="text-muted" style={{ fontSize: 13 }}>
          {pageData?.totalElements ?? 0} accounts
        </span>
      </div>

      <div className="surface" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Account</th>
                <th>Name</th>
                <th>Type</th>
                <th>Balance</th>
                <th>Owner</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map(a => (
                <tr key={a.id}>
                  <td className="mono">{a.accountNumber}</td>
                  <td><span className="font-semibold">{a.accountName}</span></td>
                  <td>{a.accountType}</td>
                  <td className="font-semibold tabular">{formatMoney(a.balance, a.currency)}</td>
                  <td>
                    <span className="row" style={{ gap: 8 }}>
                      <span className="avatar avatar--sm">{a.username?.charAt(0)?.toUpperCase() ?? 'U'}</span>
                      <span>{a.username ?? `User #${a.userId}`}</span>
                    </span>
                  </td>
                  <td><StatusBadge status={a.status} /></td>
                  <td>
                    <select
                      value={a.status}
                      disabled={busyId === a.id}
                      onChange={e => handleStatusChange(a.id, e.target.value)}
                      className="select"
                      style={{ padding: '6px 10px', fontSize: 13 }}
                      aria-label={`Set status for ${a.accountName}`}
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="FROZEN">FROZEN</option>
                      <option value="CLOSED">CLOSED</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {accounts.length === 0 && <EmptyState icon="bank" title="No accounts found" body="Accounts opened by customers will appear here." />}
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
