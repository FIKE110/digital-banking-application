import { useCallback, useEffect, useState } from 'react';
import { adminListBeneficiaries, adminDeleteBeneficiary } from '../api/admin';
import { formatDate } from '../utils/format';
import { PageHeader } from '../ui/Card';
import Icon from '../ui/Icon';
import { SkeletonRows } from '../ui/Skeleton';
import { EmptyState, ErrorState } from '../ui/States';
import Dialog from '../ui/Dialog';
import { useToast } from '../ui/Toast';
import type { AdminBeneficiary, Paginated } from '../types';

const PAGE_SIZE = 15;

export default function AdminBeneficiaries() {
  const { success, error: toastError } = useToast();
  const [pageData, setPageData] = useState<Paginated<AdminBeneficiary> | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminBeneficiary | null>(null);

  const fetchBeneficiaries = useCallback(async () => {
    try {
      const params: Record<string, unknown> = { page, size: PAGE_SIZE };
      if (search) params.search = search;
      const r = await adminListBeneficiaries(params);
      setPageData(r.data ?? null);
    } catch (err: any) {
      setLoadError(err.response?.data?.message || 'Failed to load beneficiaries');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchBeneficiaries(); }, [fetchBeneficiaries]);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setBusyId(deleteTarget.id);
    try {
      await adminDeleteBeneficiary(deleteTarget.id);
      success('Beneficiary removed');
      setDeleteTarget(null);
      await fetchBeneficiaries();
    } catch (err: any) {
      toastError(err.response?.data?.message || 'Failed to remove beneficiary');
    } finally {
      setBusyId(null);
    }
  };

  const items = pageData?.content ?? [];
  const totalPages = pageData?.totalPages ?? 0;

  if (loading) return <SkeletonRows rows={7} />;
  if (loadError) return <ErrorState title="Couldn't load beneficiaries" body={loadError} onRetry={fetchBeneficiaries} />;

  return (
    <div className="stack" style={{ gap: 24 }}>
      <PageHeader
        title="Admin · Beneficiaries"
        subtitle="View and remove beneficiary records across all customers"
        actions={<span className="badge badge--warning"><Icon name="shield" size={11} /> Administrator</span>}
      />

      <div className="surface" style={{ padding: 'var(--space-4)' }}>
        <input
          type="text"
          placeholder="Search alias, account number or owner"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(0); }}
          className="input"
          style={{ maxWidth: 320 }}
        />
      </div>

      <div className="surface" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Alias</th>
                <th>Account</th>
                <th>Bank</th>
                <th>Owner</th>
                <th>Added</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map(b => (
                <tr key={b.id}>
                  <td className="font-semibold">{b.alias}</td>
                  <td className="mono text-sm">{b.accountNumber}</td>
                  <td className="text-sm">{b.bankName || '—'}</td>
                  <td className="text-sm">{b.username || `User #${b.userId}`}</td>
                  <td className="text-sm">{formatDate(b.createdAt)}</td>
                  <td>
                    <button className="btn btn--danger-ghost btn--sm" disabled={busyId === b.id} onClick={() => setDeleteTarget(b)}>
                      <Icon name="trash" size={13} /> Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {items.length === 0 && <EmptyState icon="users" title="No beneficiaries found" body="Beneficiaries saved by customers will appear here." />}
      </div>

      {totalPages > 1 && (
        <div className="row" style={{ justifyContent: 'center', gap: 8, alignItems: 'center' }}>
          <button className="btn btn--ghost btn--sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>Previous</button>
          <span className="text-muted" style={{ fontSize: 13 }}>Page {page + 1} of {totalPages}</span>
          <button className="btn btn--ghost btn--sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>Next</button>
        </div>
      )}

      <Dialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Remove beneficiary"
        subtitle={deleteTarget ? `${deleteTarget.alias} · ${deleteTarget.accountNumber}` : undefined}
        footer={
          <>
            <button className="btn btn--ghost" onClick={() => setDeleteTarget(null)}>Cancel</button>
            <button className="btn btn--danger" onClick={confirmDelete}>Remove beneficiary</button>
          </>
        }
      >
        <p className="text-sm" style={{ margin: 0 }}>
          This will permanently remove this beneficiary for the customer. This action is recorded in the audit trail.
        </p>
      </Dialog>
    </div>
  );
}