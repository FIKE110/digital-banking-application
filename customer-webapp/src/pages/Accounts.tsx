import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAccounts, createAccount } from '../api/accounts';
import { formatMoney } from '../utils/format';
import { PageHeader } from '../ui/Card';
import Button from '../ui/Button';
import Dialog from '../ui/Dialog';
import { Field, Input, Select } from '../ui/FormControls';
import Badge, { StatusBadge } from '../ui/Badge';
import Icon from '../ui/Icon';
import { SkeletonRows } from '../ui/Skeleton';
import { EmptyState, ErrorState } from '../ui/States';
import { useToast } from '../ui/Toast';
import CopyButton from '../ui/CopyButton';
import type { Account } from '../types';

const CURRENCY = 'NGN';

export default function Accounts() {
  const { success, error: toastError } = useToast();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState('SAVINGS');
  const [balance, setBalance] = useState('');
  const [busy, setBusy] = useState(false);

  const fetchAccounts = useCallback(async () => {
    try {
      const r = await getAccounts();
      setAccounts(r.data ?? []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load accounts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAccounts(); }, [fetchAccounts]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await createAccount({
        accountName: name,
        accountType: type,
        currency: CURRENCY,
        openingBalance: Number(balance) || 0,
        status: 'ACTIVE',
      });
      success('Account created');
      setShowForm(false);
      setName('');
      setBalance('');
      await fetchAccounts();
    } catch (err: any) {
      toastError(err.response?.data?.message || 'Failed to create account');
    } finally {
      setBusy(false);
    }
  };

  const total = accounts.reduce((s, a) => s + Number(a.balance ?? 0), 0);

  if (loading) return <SkeletonRows rows={5} />;
  if (error) return <ErrorState title="Couldn't load accounts" body={error} onRetry={fetchAccounts} />;

  return (
    <div className="stack" style={{ gap: 24 }}>
      <PageHeader
        title="Accounts"
        subtitle="Manage your bank accounts"
        actions={
          <Button icon="plus" onClick={() => setShowForm(true)}>Open account</Button>
        }
      />

      <div className="grid-2">
        <div className="surface stat-card">
          <div className="stat-card__icon"><Icon name="wallet" size={18} /></div>
          <div>
            <div className="stat-card__label">Total balance</div>
            <div className="stat-card__value">{formatMoney(total, CURRENCY)}</div>
          </div>
        </div>
        <div className="surface stat-card">
          <div className="stat-card__icon stat-card__icon--info"><Icon name="bank" size={18} /></div>
          <div>
            <div className="stat-card__label">Accounts</div>
            <div className="stat-card__value">{accounts.length}</div>
          </div>
        </div>
      </div>

      {accounts.length === 0 ? (
        <EmptyState
          icon="wallet"
          title="No accounts yet"
          body="Open your first account to start banking. Savings or checking, in Naira (NGN)."
          actionLabel="Open account"
          action={() => setShowForm(true)}
        />
      ) : (
        <div className="grid-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
          {accounts.map(a => (
            <Link key={a.id} to={`/accounts/${a.id}`} className="acc-card">
              <div className="acc-card__top">
                <div className="row" style={{ gap: 10 }}>
                  <span className="stat-card__icon">
                    <Icon name={a.accountType === 'SAVINGS' ? 'bank' : 'wallet'} size={17} />
                  </span>
                  <div>
                    <div className="acc-card__name">{a.accountName}</div>
                    <div className="acc-card__num">{a.accountNumber}</div>
                  </div>
                </div>
                <StatusBadge status={a.status} />
              </div>
              <div>
                <div className="muted text-xs">Available balance</div>
                <div className="acc-card__balance">{formatMoney(a.balance, a.currency)}</div>
                <div className="row" style={{ gap: 6, marginTop: 4 }}>
                  <Badge tone="neutral">{a.accountType}</Badge>
                  <Badge tone="neutral">{a.currency}</Badge>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <Dialog open={showForm} onClose={() => setShowForm(false)} title="Open an account" subtitle="Savings or checking account in Naira">
        <form onSubmit={handleCreate} className="stack stack--4">
          <Field label="Account name">
            <Input icon="edit" placeholder="e.g. Daily Spending" value={name} onChange={e => setName(e.target.value)} required />
          </Field>
          <div className="grid-2" style={{ gap: 'var(--space-3)' }}>
            <Field label="Account type">
              <Select value={type} onChange={e => setType(e.target.value)}>
                <option value="SAVINGS">Savings</option>
                <option value="CHECKING">Checking</option>
              </Select>
            </Field>
            <Field label="Currency">
              <Input value={CURRENCY} readOnly />
            </Field>
          </div>
          <Field label="Opening balance" hint="Amount credited to the new account">
            <Input
              type="number"
              min={0}
              step={0.01}
              placeholder="0.00"
              value={balance}
              onChange={e => setBalance(e.target.value)}
              suffix={CURRENCY}
              required
            />
          </Field>
          <div className="row" style={{ justifyContent: 'flex-end' }}>
            <Button variant="secondary" type="button" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button type="submit" loading={busy}>Create account</Button>
          </div>
        </form>
      </Dialog>

      <div className="surface" style={{ padding: 'var(--space-4)' }}>
        <div className="font-semibold" style={{ fontSize: 14 }}>Need an account number?</div>
        <div className="muted text-xs" style={{ margin: '2px 0 12px' }}>Copy an account number to receive money from anyone</div>
        {accounts.length === 0 ? (
          <div className="muted text-sm">Open an account first to get your number.</div>
        ) : (
          <div className="stack" style={{ gap: 8 }}>
            {accounts.map(a => (
              <div key={a.id} className="row row--between" style={{ gap: 12 }}>
                <div style={{ minWidth: 0 }}>
                  <div className="font-semibold text-sm">{a.accountName}</div>
                  <div className="muted text-xs mono">{a.accountNumber}</div>
                </div>
                <CopyButton value={a.accountNumber} label="Copy number" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
