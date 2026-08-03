import { useCallback, useEffect, useState } from 'react';
import { adminListCards, adminFreezeCard, adminUnfreezeCard } from '../api/admin';
import { formatMoney, formatDate } from '../utils/format';
import { PageHeader } from '../ui/Card';
import { StatusBadge } from '../ui/Badge';
import Icon from '../ui/Icon';
import { SkeletonRows } from '../ui/Skeleton';
import { EmptyState, ErrorState } from '../ui/States';
import { useToast } from '../ui/Toast';
import type { AdminCard, Paginated } from '../types';

const PAGE_SIZE = 15;

export default function AdminCards() {
  const { success, error: toastError } = useToast();
  const [pageData, setPageData] = useState<Paginated<AdminCard> | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [search, setSearch] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  const fetchCards = useCallback(async () => {
    try {
      const params: Record<string, unknown> = { page, size: PAGE_SIZE };
      if (statusFilter) params.status = statusFilter;
      if (typeFilter) params.cardType = typeFilter;
      if (search) params.search = search;
      const r = await adminListCards(params);
      setPageData(r.data ?? null);
    } catch (err: any) {
      setLoadError(err.response?.data?.message || 'Failed to load cards');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, typeFilter, search]);

  useEffect(() => { fetchCards(); }, [fetchCards]);

  const toggleFreeze = async (card: AdminCard) => {
    setBusyId(card.id);
    try {
      if (card.status === 'FROZEN') {
        await adminUnfreezeCard(card.id);
        success('Card unfrozen');
      } else {
        await adminFreezeCard(card.id);
        success('Card frozen');
      }
      await fetchCards();
    } catch (err: any) {
      toastError(err.response?.data?.message || 'Failed to update card');
    } finally {
      setBusyId(null);
    }
  };

  const cards = pageData?.content ?? [];
  const totalPages = pageData?.totalPages ?? 0;

  if (loading) return <SkeletonRows rows={7} />;
  if (loadError) return <ErrorState title="Couldn't load cards" body={loadError} onRetry={fetchCards} />;

  return (
    <div className="stack" style={{ gap: 24 }}>
      <PageHeader
        title="Admin · Cards"
        subtitle="Review customer cards and manage freeze status"
        actions={<span className="badge badge--warning"><Icon name="shield" size={11} /> Administrator</span>}
      />

      <div className="surface" style={{ padding: 'var(--space-4)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 'var(--space-3)' }}>
          <input
            type="text"
            placeholder="Search card number or owner"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(0); }}
            className="input"
          />
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(0); }} className="input">
            <option value="">All Statuses</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="FROZEN">FROZEN</option>
            <option value="EXPIRED">EXPIRED</option>
          </select>
          <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(0); }} className="input">
            <option value="">All Card Types</option>
            <option value="DEBIT">DEBIT</option>
            <option value="CREDIT">CREDIT</option>
            <option value="PREPAID">PREPAID</option>
            <option value="VIRTUAL">VIRTUAL</option>
          </select>
        </div>
      </div>

      <div className="surface" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Card</th>
                <th>Type</th>
                <th>Owner</th>
                <th>Account</th>
                <th>Expiry</th>
                <th>Daily Limit</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {cards.map(card => (
                <tr key={card.id}>
                  <td className="mono text-sm">•••• {card.cardNumberLast4}</td>
                  <td className="text-sm">{card.cardType}</td>
                  <td className="font-semibold text-sm">{card.username || `User #${card.userId}`}</td>
                  <td className="mono text-sm">{card.accountNumber}</td>
                  <td className="text-sm">{formatDate(card.expiryDate)}</td>
                  <td className="tabular text-sm">{formatMoney(card.dailyLimit, 'NGN')}</td>
                  <td><StatusBadge status={card.status} /></td>
                  <td>
                    <button
                      className={`btn btn--sm ${card.status === 'FROZEN' ? 'btn--brand' : 'btn--ghost'}`}
                      disabled={busyId === card.id}
                      onClick={() => toggleFreeze(card)}
                    >
                      <Icon name={card.status === 'FROZEN' ? 'unlock' : 'snowflake'} size={13} />
                      {card.status === 'FROZEN' ? 'Unfreeze' : 'Freeze'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {cards.length === 0 && <EmptyState icon="card" title="No cards found" body="Cards issued to customers will appear here." />}
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