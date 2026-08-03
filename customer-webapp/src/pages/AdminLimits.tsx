import { useCallback, useEffect, useState } from 'react';
import { adminListLimits, adminUpdateLimits } from '../api/admin';
import { formatMoney } from '../utils/format';
import { PageHeader } from '../ui/Card';
import { useToast } from '../ui/Toast';
import { SkeletonRows } from '../ui/Skeleton';
import { EmptyState, ErrorState } from '../ui/States';
import type { AccountTypeLimit, Paginated } from '../types';

const PAGE_SIZE = 15;

export default function AdminLimits() {
  const { success, error: toastError } = useToast();
  const [pageData, setPageData] = useState<Paginated<AccountTypeLimit> | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [page, setPage] = useState(0);

  const fetchLimits = useCallback(async () => {
    try {
      const r = await adminListLimits({ page, size: PAGE_SIZE });
      setPageData(r.data ?? null);
    } catch (err: any) {
      setLoadError(err.response?.data?.message || 'Failed to load limits');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchLimits(); }, [fetchLimits]);

  const startEdit = (limit: AccountTypeLimit) => {
    setEditingId(limit.accountType);
    setEditValue(String(limit.dailyTransferLimit));
  };

  const saveLimit = async (accountType: string) => {
    try {
      await adminUpdateLimits(accountType, { dailyTransferLimit: Number(editValue) });
      success(`Limit for ${accountType} updated`);
      setEditingId(null);
      await fetchLimits();
    } catch (err: any) {
      toastError(err.response?.data?.message || 'Failed to update limit');
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue('');
  };

  const limits = pageData?.content ?? [];
  const totalPages = pageData?.totalPages ?? 0;

  if (loading) return <SkeletonRows rows={5} />;
  if (loadError) return <ErrorState title="Couldn't load limits" body={loadError} onRetry={fetchLimits} />;

  return (
    <div className="stack" style={{ gap: 24 }}>
      <PageHeader
        title="Transaction Limits"
        subtitle="Configure daily transfer limits by account type"
      />

      <div className="surface" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Account Type</th>
                <th>Daily Transfer Limit</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {limits.map(limit => (
                <tr key={limit.accountType}>
                  <td className="font-semibold">{limit.accountType}</td>
                  <td>
                    {editingId === limit.accountType ? (
                      <div className="row" style={{ gap: 8 }}>
                        <input
                          type="number"
                          value={editValue}
                          onChange={e => setEditValue(e.target.value)}
                          className="input"
                          style={{ width: 160 }}
                          min="0"
                          step="100"
                        />
                        <button className="btn btn--sm btn--brand" onClick={() => saveLimit(limit.accountType)}>Save</button>
                        <button className="btn btn--sm btn--ghost" onClick={cancelEdit}>Cancel</button>
                      </div>
                    ) : (
                      <span className="mono">{formatMoney(limit.dailyTransferLimit, 'NGN')}</span>
                    )}
                  </td>
                  <td>
                    {editingId === limit.accountType ? null : (
                      <button
                        className="btn btn--ghost btn--sm"
                        onClick={() => startEdit(limit)}
                      >
                        Edit
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {limits.length === 0 && <EmptyState icon="wallet" title="No limits configured" body="Set daily transfer limits for each account type." />}
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
