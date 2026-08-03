import { useCallback, useEffect, useState } from 'react';
import { adminListCustomers, adminGetCustomer } from '../api/admin';
import { formatMoney } from '../utils/format';
import { PageHeader } from '../ui/Card';
import { StatusBadge } from '../ui/Badge';
import Icon from '../ui/Icon';
import { SkeletonRows } from '../ui/Skeleton';
import { EmptyState, ErrorState } from '../ui/States';
import Dialog from '../ui/Dialog';
import { useToast } from '../ui/Toast';
import type { AdminCustomer, AdminCustomerDetail, Paginated } from '../types';

const PAGE_SIZE = 15;

export default function AdminCustomers() {
  const { error: toastError } = useToast();
  const [pageData, setPageData] = useState<Paginated<AdminCustomer> | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [detail, setDetail] = useState<AdminCustomerDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchCustomers = useCallback(async () => {
    try {
      const params: Record<string, unknown> = { page, size: PAGE_SIZE };
      if (search) params.search = search;
      const r = await adminListCustomers(params);
      setPageData(r.data ?? null);
    } catch (err: any) {
      setLoadError(err.response?.data?.message || 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  const openDetail = async (customer: AdminCustomer) => {
    setDetailLoading(true);
    try {
      const r = await adminGetCustomer(customer.id);
      setDetail(r.data ?? null);
    } catch (err: any) {
      toastError(err.response?.data?.message || 'Failed to load customer details');
    } finally {
      setDetailLoading(false);
    }
  };

  const customers = pageData?.content ?? [];
  const totalPages = pageData?.totalPages ?? 0;

  if (loading) return <SkeletonRows rows={7} />;
  if (loadError) return <ErrorState title="Couldn't load customers" body={loadError} onRetry={fetchCustomers} />;

  return (
    <div className="stack" style={{ gap: 24 }}>
      <PageHeader
        title="Admin · Customers"
        subtitle="View all registered customers and their profile details"
        actions={<span className="badge badge--warning"><Icon name="shield" size={11} /> Administrator</span>}
      />

      <div className="surface" style={{ padding: 'var(--space-4)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 'var(--space-3)' }}>
          <input
            type="text"
            placeholder="Search username, email or UID"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(0); }}
            className="input"
          />
        </div>
      </div>

      <div className="surface" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Email</th>
                <th>UID</th>
                <th>Accounts</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Detail</th>
              </tr>
            </thead>
            <tbody>
              {customers.map(c => (
                <tr key={c.id}>
                  <td>
                    <span className="row" style={{ gap: 8 }}>
                      <span className="avatar avatar--sm">{c.username?.charAt(0)?.toUpperCase() ?? 'U'}</span>
                      <span className="font-semibold">{c.username}</span>
                    </span>
                  </td>
                  <td className="text-sm">{c.email}</td>
                  <td className="mono text-sm">{c.uid?.slice(0, 12) ?? '—'}</td>
                  <td className="text-sm">{c.accountCount}</td>
                  <td><StatusBadge status={c.status} /></td>
                  <td className="text-sm">{c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '—'}</td>
                  <td>
                    <button className="btn btn--ghost btn--sm" onClick={() => openDetail(c)}>
                      <Icon name="eye" size={13} /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {customers.length === 0 && <EmptyState icon="users" title="No customers found" body="Adjust your search to find customers." />}
      </div>

      {totalPages > 1 && (
        <div className="row" style={{ justifyContent: 'center', gap: 8, alignItems: 'center' }}>
          <button className="btn btn--ghost btn--sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>Previous</button>
          <span className="text-muted" style={{ fontSize: 13 }}>Page {page + 1} of {totalPages}</span>
          <button className="btn btn--ghost btn--sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>Next</button>
        </div>
      )}

      <Dialog
        open={!!detail}
        onClose={() => setDetail(null)}
        title={detail ? detail.customer.username : 'Customer detail'}
        subtitle={detail ? detail.customer.email : undefined}
      >
        {detailLoading && <div className="state"><div className="state__title">Loading…</div></div>}
        {!detailLoading && detail && (
          <div className="stack" style={{ gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
              <div className="surface" style={{ padding: 'var(--space-3)' }}>
                <div className="muted text-xs">PHONE</div>
                <div className="font-semibold text-sm">{detail.phoneNumber || '—'}</div>
              </div>
              <div className="surface" style={{ padding: 'var(--space-3)' }}>
                <div className="muted text-xs">GENDER</div>
                <div className="font-semibold text-sm">{detail.gender || '—'}</div>
              </div>
              <div className="surface" style={{ padding: 'var(--space-3)' }}>
                <div className="muted text-xs">DATE OF BIRTH</div>
                <div className="font-semibold text-sm">{detail.dateOfBirth || '—'}</div>
              </div>
              <div className="surface" style={{ padding: 'var(--space-3)' }}>
                <div className="muted text-xs">KYC STATUS</div>
                <div className="font-semibold text-sm"><StatusBadge status={detail.kycStatus || 'UNKNOWN'} /></div>
              </div>
            </div>

            <div className="row" style={{ gap: 12 }}>
              <span className="badge badge--info"><Icon name="card" size={11} /> {detail.cardCount} cards</span>
              <span className="badge badge--info"><Icon name="users" size={11} /> {detail.beneficiaryCount} beneficiaries</span>
            </div>

            <div>
              <div className="font-semibold" style={{ marginBottom: 8 }}>Accounts</div>
              {detail.accounts.length === 0 && <p className="muted text-sm">No accounts.</p>}
              {detail.accounts.length > 0 && (
                <div className="surface" style={{ padding: 0, overflow: 'hidden' }}>
                  <div className="table-wrap">
                    <table className="table">
                      <thead>
                        <tr><th>Account</th><th>Name</th><th>Type</th><th>Balance</th><th>Status</th></tr>
                      </thead>
                      <tbody>
                        {detail.accounts.map(a => (
                          <tr key={a.id}>
                            <td className="mono text-sm">{a.accountNumber}</td>
                            <td className="text-sm">{a.accountName}</td>
                            <td className="text-sm">{a.accountType}</td>
                            <td className="font-semibold tabular text-sm">{formatMoney(a.balance, a.currency)}</td>
                            <td><StatusBadge status={a.status} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}