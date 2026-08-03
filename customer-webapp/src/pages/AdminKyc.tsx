import { useCallback, useEffect, useState } from 'react';
import { adminListKyc, adminApproveKyc, adminRejectKyc } from '../api/admin';
import { formatDate } from '../utils/format';
import { PageHeader } from '../ui/Card';
import { StatusBadge } from '../ui/Badge';
import Icon from '../ui/Icon';
import { SkeletonRows } from '../ui/Skeleton';
import { EmptyState, ErrorState } from '../ui/States';
import Dialog from '../ui/Dialog';
import { useToast } from '../ui/Toast';
import type { AdminKyc, Paginated } from '../types';

const PAGE_SIZE = 15;

export default function AdminKyc() {
  const { success, error: toastError } = useToast();
  const [pageData, setPageData] = useState<Paginated<AdminKyc> | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [busyId, setBusyId] = useState<number | null>(null);
  const [rejectRecord, setRejectRecord] = useState<AdminKyc | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const fetchKyc = useCallback(async () => {
    try {
      const params: Record<string, unknown> = { page, size: PAGE_SIZE };
      if (statusFilter) params.status = statusFilter;
      const r = await adminListKyc(params);
      setPageData(r.data ?? null);
    } catch (err: any) {
      setLoadError(err.response?.data?.message || 'Failed to load KYC records');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => { fetchKyc(); }, [fetchKyc]);

  const approve = async (record: AdminKyc) => {
    setBusyId(record.id);
    try {
      await adminApproveKyc(record.id);
      success(`KYC approved for ${record.username}`);
      await fetchKyc();
    } catch (err: any) {
      toastError(err.response?.data?.message || 'Failed to approve KYC');
    } finally {
      setBusyId(null);
    }
  };

  const reject = async () => {
    if (!rejectRecord) return;
    setBusyId(rejectRecord.id);
    try {
      await adminRejectKyc(rejectRecord.id, rejectReason || undefined);
      success(`KYC rejected for ${rejectRecord.username}`);
      setRejectRecord(null);
      setRejectReason('');
      await fetchKyc();
    } catch (err: any) {
      toastError(err.response?.data?.message || 'Failed to reject KYC');
    } finally {
      setBusyId(null);
    }
  };

  const records = pageData?.content ?? [];
  const totalPages = pageData?.totalPages ?? 0;

  if (loading) return <SkeletonRows rows={7} />;
  if (loadError) return <ErrorState title="Couldn't load KYC records" body={loadError} onRetry={fetchKyc} />;

  return (
    <div className="stack" style={{ gap: 24 }}>
      <PageHeader
        title="Admin · KYC Verification"
        subtitle="Review and verify customer identity records"
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
          <option value="PENDING">PENDING</option>
          <option value="VERIFIED">VERIFIED</option>
          <option value="REJECTED">REJECTED</option>
        </select>
        <span className="text-muted" style={{ fontSize: 13 }}>
          {pageData?.totalElements ?? 0} records
        </span>
      </div>

      <div className="surface" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Email</th>
                <th>BVN</th>
                <th>NIN</th>
                <th>Status</th>
                <th>Submitted</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {records.map(r => (
                <tr key={r.id}>
                  <td className="font-semibold">{r.username}</td>
                  <td className="text-sm">{r.email}</td>
                  <td className="mono text-sm">{r.bvn || '—'}</td>
                  <td className="mono text-sm">{r.nin || '—'}</td>
                  <td><StatusBadge status={r.bvnStatus || 'PENDING'} /></td>
                  <td className="text-sm">{formatDate(r.createdAt)}</td>
                  <td>
                    <div className="row" style={{ gap: 6 }}>
                      <button
                        className="btn btn--sm btn--brand"
                        disabled={busyId === r.id || (r.bvnStatus ?? '') === 'VERIFIED'}
                        onClick={() => approve(r)}
                      >
                        <Icon name="check" size={13} /> Approve
                      </button>
                      <button
                        className="btn btn--sm btn--danger-ghost"
                        disabled={busyId === r.id || (r.bvnStatus ?? '') === 'REJECTED'}
                        onClick={() => { setRejectRecord(r); setRejectReason(''); }}
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {records.length === 0 && <EmptyState icon="fingerprint" title="No KYC records found" body="KYC submissions will appear here." />}
      </div>

      {totalPages > 1 && (
        <div className="row" style={{ justifyContent: 'center', gap: 8, alignItems: 'center' }}>
          <button className="btn btn--ghost btn--sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>Previous</button>
          <span className="text-muted" style={{ fontSize: 13 }}>Page {page + 1} of {totalPages}</span>
          <button className="btn btn--ghost btn--sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>Next</button>
        </div>
      )}

      <Dialog
        open={!!rejectRecord}
        onClose={() => setRejectRecord(null)}
        title="Reject KYC submission"
        subtitle={rejectRecord ? `${rejectRecord.username} · ${rejectRecord.email}` : undefined}
        footer={
          <>
            <button className="btn btn--ghost" onClick={() => setRejectRecord(null)}>Cancel</button>
            <button className="btn btn--danger" onClick={reject}>Reject KYC</button>
          </>
        }
      >
        <div className="field">
          <label className="field__label">Reason (optional)</label>
          <textarea
            className="textarea"
            rows={3}
            placeholder="Why is this submission being rejected?"
            value={rejectReason}
            onChange={e => setRejectReason(e.target.value)}
          />
        </div>
      </Dialog>
    </div>
  );
}