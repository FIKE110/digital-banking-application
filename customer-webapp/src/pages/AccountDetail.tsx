import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getAccount, getBalance, deposit } from '../api/accounts';
import { getAccountEntries } from '../api/ledger';
import { formatMoney, formatDate, formatDateTime } from '../utils/format';
import { PageHeader } from '../ui/Card';
import Button from '../ui/Button';
import Dialog from '../ui/Dialog';
import { Field, Input } from '../ui/FormControls';
import { StatusBadge, TypeBadge } from '../ui/Badge';
import Icon from '../ui/Icon';
import CopyButton from '../ui/CopyButton';
import { SkeletonRows } from '../ui/Skeleton';
import { ErrorState, EmptyState } from '../ui/States';
import { useToast } from '../ui/Toast';
import type { AccountBalance, AccountDetail, Transaction } from '../types';

export default function AccountDetailPage() {
  const { id } = useParams();
  const { success, error: toastError } = useToast();
  const [account, setAccount] = useState<AccountDetail | null>(null);
  const [balance, setBalanceData] = useState<AccountBalance | null>(null);
  const [entries, setEntries] = useState<Transaction[]>([]);
  const [loadError, setLoadError] = useState('');
  const [depositOpen, setDepositOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositDescription, setDepositDescription] = useState('');
  const [depositLoading, setDepositLoading] = useState(false);
  const [entriesLoading, setEntriesLoading] = useState(true);

  const refreshAccount = useCallback(() => {
    if (!id) return;
    Promise.all([
      getAccount(id).then(r => setAccount(r.data)),
      getBalance(id).then(r => setBalanceData(r.data)),
    ]).catch(err => setLoadError(err.response?.data?.message || 'Failed to load account details'));
  }, [id]);

  useEffect(() => {
    if (!id) return;
    refreshAccount();
  }, [id, refreshAccount]);

  useEffect(() => {
    if (!account?.accountNumber) return;
    getAccountEntries(account.accountNumber)
      .then(r => setEntries(r.data || []))
      .catch(() => {})
      .finally(() => setEntriesLoading(false));
  }, [account]);

  const currency = account?.currency || balance?.currency || 'NGN';

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || Number(depositAmount) < 1) return;
    setDepositLoading(true);
    try {
      await deposit(id, Number(depositAmount), depositDescription || undefined);
      success(`Deposited ${formatMoney(Number(depositAmount), currency)}`);
      setDepositOpen(false);
      setDepositAmount('');
      setDepositDescription('');
      refreshAccount();
    } catch (err: any) {
      toastError(err.response?.data?.message || 'Deposit failed. Please try again.');
    } finally {
      setDepositLoading(false);
    }
  };

  if (loadError) return <ErrorState title="Couldn't load account" body={loadError} />;
  if (!account) return <SkeletonRows rows={6} />;

  return (
    <div className="stack" style={{ gap: 24 }}>
      <PageHeader
        title={account.accountName}
        subtitle={`${account.accountNumber} · ${account.accountType} · opened ${formatDate(account.createdAt)}`}
        actions={
          <>
            <Link to="/accounts" className="btn btn--secondary btn--sm">
              <Icon name="arrowLeft" size={15} /> All accounts
            </Link>
            <Button icon="arrowDownLeft" onClick={() => setDepositOpen(true)}>Deposit</Button>
          </>
        }
      />

      <div className="hero">
        <div className="hero__top">
          <span className="hero__label">Available balance</span>
          <StatusBadge status={account.status} />
        </div>
        <div className="hero__balance">{formatMoney(balance?.balance ?? account.balance, currency)}</div>
        <div className="hero__details">
          <div>
            <div className="hero__stat-label">Account number</div>
            <div className="row" style={{ gap: 8 }}>
              <span className="hero__stat-value mono">{account.accountNumber}</span>
              <CopyButton value={account.accountNumber} label="Copy" copiedLabel="Copied" />
            </div>
          </div>
          <div>
            <div className="hero__stat-label">Currency</div>
            <div className="hero__stat-value">{currency}</div>
          </div>
          <div>
            <div className="hero__stat-label">Account type</div>
            <div className="hero__stat-value">{account.accountType}</div>
          </div>
        </div>
      </div>

      <div className="grid-3">
        <div className="surface stat-card">
          <div className="stat-card__icon stat-card__icon--success"><Icon name="trending" size={18} /></div>
          <div>
            <div className="stat-card__label">Credits</div>
            <div className="stat-card__value">
              {formatMoney(entries.filter(t => t.type === 'CREDIT').reduce((s, t) => s + Number(t.amount), 0), currency)}
            </div>
          </div>
        </div>
        <div className="surface stat-card">
          <div className="stat-card__icon stat-card__icon--danger"><Icon name="receipt" size={18} /></div>
          <div>
            <div className="stat-card__label">Debits</div>
            <div className="stat-card__value">
              {formatMoney(entries.filter(t => t.type === 'DEBIT').reduce((s, t) => s + Number(t.amount), 0), currency)}
            </div>
          </div>
        </div>
        <div className="surface stat-card">
          <div className="stat-card__icon stat-card__icon--info"><Icon name="transactions" size={18} /></div>
          <div>
            <div className="stat-card__label">Transactions</div>
            <div className="stat-card__value">{entries.length}</div>
          </div>
        </div>
      </div>

      <div className="surface" style={{ padding: 'var(--space-5)' }}>
        <div className="page-header" style={{ marginBottom: 16 }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>Transaction history</h3>
          </div>
          <Link to="/transactions" className="btn btn--ghost btn--sm">
            View all <Icon name="chevronRight" size={14} />
          </Link>
        </div>
        {entriesLoading ? (
          <SkeletonRows rows={4} />
        ) : entries.length === 0 ? (
          <EmptyState icon="receipt" title="No transactions yet" body="Activity on this account will appear here." />
        ) : (
          <div className="stack" style={{ gap: 2 }}>
            {entries.slice(0, 10).map(t => {
              const credit = t.type === 'CREDIT';
              return (
                <div key={t.id} className="tx-row">
                  <span className={`tx-row__icon ${credit ? 'tx-row__icon--credit' : 'tx-row__icon--debit'}`}>
                    <Icon name={credit ? 'arrowDownLeft' : 'arrowUpRight'} size={16} />
                  </span>
                  <span className="tx-row__body">
                    <span className="tx-row__title">{t.description || (credit ? 'Money received' : 'Payment sent')}</span>
                    <span className="tx-row__meta" style={{ marginTop: 10 }}>{formatDateTime(t.createdAt)} · {t.reference?.slice(0, 12) ?? '—'}</span>
                  </span>
                  <TypeBadge type={t.type} />
                  <span className={`tx-row__amount ${credit ? 'tx-row__amount--credit' : 'tx-row__amount--debit'}`}>
                    {credit ? '+' : '−'}{formatMoney(t.amount, currency)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Dialog
        open={depositOpen}
        onClose={() => setDepositOpen(false)}
        title="Deposit money"
        subtitle={`Credit funds to ${account.accountName} (${account.accountNumber})`}
      >
        <form onSubmit={handleDeposit} className="stack stack--4">
          <Field label={`Amount (${currency})`} hint="Minimum deposit is 1.00">
            <Input
              type="number"
              min={1}
              step={0.01}
              placeholder="0.00"
              value={depositAmount}
              onChange={e => setDepositAmount(e.target.value)}
              required
              suffix={currency}
            />
          </Field>
          <Field label="Description (optional)">
            <Input
              placeholder="e.g. Payday deposit, gift…"
              value={depositDescription}
              onChange={e => setDepositDescription(e.target.value)}
            />
          </Field>
          <div className="row" style={{ justifyContent: 'flex-end' }}>
            <Button variant="secondary" type="button" onClick={() => setDepositOpen(false)}>Cancel</Button>
            <Button type="submit" loading={depositLoading}>Deposit</Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
