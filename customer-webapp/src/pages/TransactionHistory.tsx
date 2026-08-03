import { useEffect, useState, useCallback } from 'react';
import { getAccounts } from '../api/accounts';
import { getTransactions } from '../api/ledger';
import { formatMoney, formatDateTime } from '../utils/format';
import { PageHeader } from '../ui/Card';
import Button from '../ui/Button';
import Dialog from '../ui/Dialog';
import { Input, Select, Field } from '../ui/FormControls';
import { StatusBadge, TypeBadge } from '../ui/Badge';
import Icon from '../ui/Icon';
import CopyButton from '../ui/CopyButton';
import { EmptyState, ErrorState } from '../ui/States';
import type { Account, Paginated, Transaction } from '../types';

export default function TransactionHistory() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [page, setPage] = useState<Paginated<Transaction> | null>(null);
  const [typeFilter, setTypeFilter] = useState('');
  const [accountFilter, setAccountFilter] = useState('');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [loadError, setLoadError] = useState('');
  const [selected, setSelected] = useState<Transaction | null>(null);

  useEffect(() => {
    getAccounts().then(r => setAccounts(r.data ?? [])).catch(() => {});
  }, []);

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedSearch(search), 350);
    return () => window.clearTimeout(t);
  }, [search]);

  useEffect(() => { setCurrentPage(0); }, [typeFilter, accountFilter, debouncedSearch, fromDate, toDate]);

  const fetchTransactions = useCallback(async () => {
    setLoadError('');
    try {
      const r = await getTransactions({
        page: currentPage,
        size: 20,
        type: typeFilter || undefined,
        accountNumber: accountFilter || undefined,
        from: fromDate || undefined,
        to: toDate || undefined,
        q: debouncedSearch.trim() || undefined,
      });
      setPage(r.data);
    } catch (err: any) {
      setLoadError(err.response?.data?.message || 'Failed to load transactions');
    }
  }, [currentPage, typeFilter, accountFilter, fromDate, toDate, debouncedSearch]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const transactions = page?.content ?? [];

  const currencyFor = (t: Transaction) =>
    accounts.find(a => a.accountNumber === t.accountNumber)?.currency ?? 'NGN';

  const clearFilters = () => {
    setTypeFilter('');
    setAccountFilter('');
    setSearch('');
    setFromDate('');
    setToDate('');
  };

  const hasFilters = typeFilter || accountFilter || search || fromDate || toDate;

  return (
    <div className="stack" style={{ gap: 24 }}>
      <PageHeader
        title="Transactions"
        subtitle="Search and filter all account activity"
        actions={hasFilters ? <Button variant="ghost" size="sm" onClick={clearFilters} icon="x">Clear filters</Button> : undefined}
      />

      <div className="surface filter-bar">
        <div className="field field--search">
          <label className="field__label" htmlFor="tx-search">Search</label>
          <Input
            id="tx-search"
            icon="search"
            placeholder="Reference, account, description…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <Field label="Type">
          <Select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
            <option value="">All types</option>
            <option value="CREDIT">Credit</option>
            <option value="DEBIT">Debit</option>
          </Select>
        </Field>
        <Field label="Account">
          <Select value={accountFilter} onChange={e => setAccountFilter(e.target.value)}>
            <option value="">All accounts</option>
            {accounts.map(a => (
              <option key={a.id} value={a.accountNumber}>{a.accountNumber}</option>
            ))}
          </Select>
        </Field>
        <Field label="From">
          <Input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} />
        </Field>
        <Field label="To">
          <Input type="date" value={toDate} onChange={e => setToDate(e.target.value)} />
        </Field>
      </div>

      {loadError && (
        <ErrorState title="Couldn't load transactions" body={loadError} onRetry={fetchTransactions} />
      )}

      <div className="surface" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Account</th>
                <th>Description</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {transactions.map(t => (
                <tr key={t.id} style={{ cursor: 'pointer' }} onClick={() => setSelected(t)}>
                  <td className="mono">{t.accountNumber}</td>
                  <td>
                    <span className="font-semibold" style={{ display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '280px' }}>
                      {t.description || (t.type === 'CREDIT' ? 'Money received' : 'Payment sent')}
                    </span>
                    <div className="muted text-xs" style={{ marginTop: 2 }}>{t.reference?.slice(0, 14)}</div>
                  </td>
                  <td><TypeBadge type={t.type} /></td>
                  <td className="font-semibold tabular" style={{ color: t.type === 'CREDIT' ? 'var(--color-success)' : 'inherit' }}>
                    {t.type === 'CREDIT' ? '+' : '−'}{formatMoney(t.amount, currencyFor(t))}
                  </td>
                  <td><StatusBadge status={t.status} /></td>
                  <td className="muted text-sm">{formatDateTime(t.createdAt)}</td>
                  <td>
                    <button className="icon-btn" style={{ width: 32, height: 32 }} aria-label="View transaction" onClick={(e) => { e.stopPropagation(); setSelected(t); }}>
                      <Icon name="chevronRight" size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {transactions.length === 0 && !loadError && (
          <EmptyState icon="search" title="No transactions found" body="Try adjusting your filters or search terms." />
        )}
      </div>

      {page && page.totalPages > 1 && (
        <div className="pagination">
          <Button variant="secondary" size="sm" disabled={page.first} onClick={() => setCurrentPage(p => p - 1)} icon="chevronLeft">
            Previous
          </Button>
          <span className="pagination__info">
            Page {page.page + 1} of {page.totalPages} · {page.totalElements} transactions
          </span>
          <Button variant="secondary" size="sm" disabled={page.last} onClick={() => setCurrentPage(p => p + 1)}>
            Next <Icon name="chevronRight" size={14} />
          </Button>
        </div>
      )}

      <Dialog
        open={selected !== null}
        onClose={() => setSelected(null)}
        title="Transaction details"
        subtitle={selected ? formatDateTime(selected.createdAt) : undefined}
      >
        {selected && (
          <div className="stack stack--4">
            <div className="row" style={{ gap: 14 }}>
              <span className={`tx-row__icon ${selected.type === 'CREDIT' ? 'tx-row__icon--credit' : 'tx-row__icon--debit'}`} style={{ width: 46, height: 46 }}>
                <Icon name={selected.type === 'CREDIT' ? 'arrowDownLeft' : 'arrowUpRight'} size={20} />
              </span>
              <div>
                <div className="font-semibold" style={{ fontSize: 17, display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '400px' }}>
                  {selected.description || (selected.type === 'CREDIT' ? 'Money received' : 'Payment sent')}
                </div>
                <div className="text-sm font-semibold tabular" style={{ color: selected.type === 'CREDIT' ? 'var(--color-success)' : 'inherit' }}>
                  {selected.type === 'CREDIT' ? '+' : '−'}{formatMoney(selected.amount, currencyFor(selected))}
                </div>
              </div>
              <div className="row" style={{ marginLeft: 'auto', gap: 6 }}>
                <TypeBadge type={selected.type} />
                <StatusBadge status={selected.status} />
              </div>
            </div>
            <div className="receipt">
              <div className="receipt__row">
                <span className="muted">Reference</span>
                <span className="row" style={{ gap: 6 }}>
                  <span className="mono text-sm">{selected.reference}</span>
                  <CopyButton value={selected.reference} label="Copy" copiedLabel="Copied" />
                </span>
              </div>
              <div className="receipt__row">
                <span className="muted">Account</span>
                <span className="mono text-sm">{selected.accountNumber}</span>
              </div>
              <div className="receipt__row">
                <span className="muted">Counterparty</span>
                <span className="mono text-sm">{selected.counterpartyAccountNumber || '—'}</span>
              </div>
              <div className="receipt__row">
                <span className="muted">Amount</span>
                <span className="tabular font-semibold">{formatMoney(selected.amount, currencyFor(selected))}</span>
              </div>
              <div className="receipt__row">
                <span className="muted">Status</span>
                <StatusBadge status={selected.status} />
              </div>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
