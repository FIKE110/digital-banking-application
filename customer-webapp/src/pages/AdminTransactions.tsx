import { useCallback, useEffect, useState } from 'react';
import { adminListTransactions, adminReverseTransaction, adminRefundTransaction, adminHoldTransaction, adminReleaseTransaction } from '../api/admin';
import { formatMoney, formatDateTime } from '../utils/format';
import { PageHeader } from '../ui/Card';
import { TypeBadge } from '../ui/Badge';
import Icon from '../ui/Icon';
import { SkeletonRows } from '../ui/Skeleton';
import { EmptyState, ErrorState } from '../ui/States';
import Dialog from '../ui/Dialog';
import { useToast } from '../ui/Toast';
import type { Paginated, Transaction } from '../types';

const PAGE_SIZE = 15;
const TX_TYPES = ['', 'DEPOSIT', 'TRANSFER', 'WITHDRAWAL', 'REVERSAL', 'REFUND'];
const TX_STATUSES = ['', 'COMPLETED', 'PENDING', 'FAILED', 'ON_HOLD', 'REVERSED', 'REFUNDED'];

export default function AdminTransactions() {
  const { success, error: toastError } = useToast();
  const [pageData, setPageData] = useState<Paginated<Transaction> | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [page, setPage] = useState(0);
  const [filters, setFilters] = useState({ search: '', type: '', status: '' });
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionTx, setActionTx] = useState<Transaction | null>(null);
  const [actionKind, setActionKind] = useState<'reverse' | 'refund' | ''>('');
  const [reason, setReason] = useState('');

  const fetchTransactions = useCallback(async () => {
    try {
      const params: Record<string, unknown> = { page, size: PAGE_SIZE };
      if (filters.search) params.search = filters.search;
      if (filters.type) params.type = filters.type;
      if (filters.status) params.status = filters.status;
      const r = await adminListTransactions(params);
      setPageData(r.data ?? null);
    } catch (err: any) {
      setLoadError(err.response?.data?.message || 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

  const handleFilter = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(0);
  };

  const runAction = async (kind: 'reverse' | 'refund') => {
    if (!actionTx) return;
    setBusyId(actionTx.id);
    try {
      if (kind === 'reverse') {
        await adminReverseTransaction(actionTx.id, reason || undefined);
        success('Transaction reversed');
      } else {
        await adminRefundTransaction(actionTx.id, reason || undefined);
        success('Transaction refunded');
      }
      setActionTx(null);
      setActionKind('');
      setReason('');
      await fetchTransactions();
    } catch (err: any) {
      toastError(err.response?.data?.message || 'Failed to submit action');
    } finally {
      setBusyId(null);
    }
  };

  const toggleHold = async (tx: Transaction) => {
    setBusyId(tx.id);
    try {
      if (tx.status === 'ON_HOLD') {
        await adminReleaseTransaction(tx.id);
        success('Transaction released from hold');
      } else {
        await adminHoldTransaction(tx.id);
        success('Transaction placed on hold');
      }
      await fetchTransactions();
    } catch (err: any) {
      toastError(err.response?.data?.message || 'Failed to update transaction');
    } finally {
      setBusyId(null);
    }
  };

  const txs = pageData?.content ?? [];
  const totalPages = pageData?.totalPages ?? 0;

  if (loading) return <SkeletonRows rows={7} />;
  if (loadError) return <ErrorState title="Couldn't load transactions" body={loadError} onRetry={fetchTransactions} />;

  return (
    <div className="stack" style={{ gap: 24 }}>
      <PageHeader
        title="Admin · Transactions"
        subtitle="Review, hold or reverse customer transactions"
        actions={<span className="badge badge--warning"><Icon name="shield" size={11} /> Administrator</span>}
      />

      <div className="surface" style={{ padding: 'var(--space-4)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 'var(--space-3)' }}>
          <input
            type="text"
            placeholder="Reference or account number"
            value={filters.search}
            onChange={e => handleFilter('search', e.target.value)}
            className="input"
          />
          <select value={filters.type} onChange={e => handleFilter('type', e.target.value)} className="input">
            {TX_TYPES.map(t => <option key={t} value={t}>{t || 'All Types'}</option>)}
          </select>
          <select value={filters.status} onChange={e => handleFilter('status', e.target.value)} className="input">
            {TX_STATUSES.map(s => <option key={s} value={s}>{s || 'All Statuses'}</option>)}
          </select>
        </div>
      </div>

      <div className="surface" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Account</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {txs.map(tx => (
                <tr key={tx.id}>
                  <td className="mono text-sm">{tx.reference}</td>
                  <td className="mono text-sm">{tx.accountNumber}</td>
                  <td><TypeBadge type={tx.type} /></td>
                  <td className="font-semibold tabular">{formatMoney(tx.amount, 'NGN')}</td>
                  <td style={{ fontWeight: 700, fontSize: 13 }}>{tx.status}</td>
                  <td className="text-sm">{formatDateTime(tx.createdAt)}</td>
                  <td>
                    <div className="row" style={{ gap: 6 }}>
                      <button
                        className="btn btn--ghost btn--sm"
                        disabled={busyId === tx.id}
                        onClick={() => { setActionTx(tx); setActionKind('reverse'); setReason(''); }}
                        title="Reverse transaction"
                      >
                        <Icon name="refresh" size={13} /> Reverse
                      </button>
                      <button
                        className="btn btn--ghost btn--sm"
                        disabled={busyId === tx.id}
                        onClick={() => { setActionTx(tx); setActionKind('refund'); setReason(''); }}
                        title="Refund transaction"
                      >
                        <Icon name="arrowDownLeft" size={13} /> Refund
                      </button>
                      <button
                        className="btn btn--ghost btn--sm"
                        disabled={busyId === tx.id}
                        onClick={() => toggleHold(tx)}
                        title={tx.status === 'ON_HOLD' ? 'Release transaction' : 'Place transaction on hold'}
                      >
                        <Icon name={tx.status === 'ON_HOLD' ? 'unlock' : 'lock'} size={13} />
                        {tx.status === 'ON_HOLD' ? 'Release' : 'Hold'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {txs.length === 0 && <EmptyState icon="receipt" title="No transactions found" body="Adjust filters to find transactions." />}
      </div>

      {totalPages > 1 && (
        <div className="row" style={{ justifyContent: 'center', gap: 8, alignItems: 'center' }}>
          <button className="btn btn--ghost btn--sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>Previous</button>
          <span className="text-muted" style={{ fontSize: 13 }}>Page {page + 1} of {totalPages}</span>
          <button className="btn btn--ghost btn--sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>Next</button>
        </div>
      )}

      <Dialog
        open={!!actionTx}
        onClose={() => setActionTx(null)}
        title={actionKind === 'reverse' ? 'Reverse transaction' : 'Refund transaction'}
        subtitle={actionTx ? `${actionTx.reference} · ${formatMoney(actionTx.amount, 'NGN')}` : undefined}
        footer={
          <>
            <button className="btn btn--ghost" onClick={() => setActionTx(null)}>Cancel</button>
            <button className="btn btn--brand" onClick={() => runAction(actionKind as 'reverse' | 'refund')}>
              {actionKind === 'reverse' ? 'Reverse transaction' : 'Refund transaction'}
            </button>
          </>
        }
      >
        <div className="stack" style={{ gap: 12 }}>
          <p className="text-sm" style={{ margin: 0 }}>
            This action is executed immediately. It is recorded in the double-entry ledger and the audit trail.
          </p>
          <div className="field">
            <label className="field__label">Reason</label>
            <textarea
              className="textarea"
              rows={3}
              placeholder="Why is this action required?"
              value={reason}
              onChange={e => setReason(e.target.value)}
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
}