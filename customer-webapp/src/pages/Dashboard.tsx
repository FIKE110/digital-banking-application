import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAccounts, deposit } from '../api/accounts';
import { getTransactions } from '../api/ledger';
import { getCards, type Card } from '../api/cards';
import { useAuth } from '../contexts/AuthContext';
import { formatMoney, formatDateTime } from '../utils/format';
import Icon from '../ui/Icon';
import Button from '../ui/Button';
import Dialog from '../ui/Dialog';
import { Field, Input, Select } from '../ui/FormControls';
import { SkeletonRows } from '../ui/Skeleton';
import { ErrorState } from '../ui/States';
import { useToast } from '../ui/Toast';
import BankCard from '../ui/BankCard';
import type { Account, Transaction } from '../types';

interface QuickAction {
  label: string;
  icon: string;
  to?: string;
  onClick?: () => void;
}

const CATEGORY_COLORS = ['#00c853', '#ff1744', '#ffd600', '#171717', '#6b6b6b', '#e0e0e0', '#000000', '#9e9e9e'];

function spendingByDescription(txs: Transaction[]): Array<{ label: string; value: number; color: string }> {
  const map = new Map<string, number>();
  txs.filter(t => t.type === 'DEBIT').forEach(t => {
    const key = t.description || 'Other';
    map.set(key, (map.get(key) ?? 0) + Number(t.amount));
  });
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([label, value], i) => ({ label, value, color: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }));
}

export default function Dashboard() {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [txns, setTxns] = useState<Transaction[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hidden, setHidden] = useState(false);
  const [depositOpen, setDepositOpen] = useState(false);
  const [depAccount, setDepAccount] = useState('');
  const [depAmount, setDepAmount] = useState('');
  const [depBusy, setDepBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const [acc, tx, cd] = await Promise.all([
        getAccounts(),
        getTransactions({ size: 10 }),
        getCards(),
      ]);
      setAccounts(acc.data ?? []);
      setTxns(tx.data?.content ?? []);
      setCards(cd.data ?? []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const primary = accounts[0];
  const total = accounts.reduce((sum, a) => sum + Number(a.balance ?? 0), 0);
  const primaryCurrency = primary?.currency ?? 'NGN';

  const monthTxns = useMemo(() => {
    const now = new Date();
    return txns.filter(t => new Date(t.createdAt).getMonth() === now.getMonth() && new Date(t.createdAt).getFullYear() === now.getFullYear());
  }, [txns]);

  const income = monthTxns.filter(t => t.type === 'CREDIT').reduce((s, t) => s + Number(t.amount), 0);
  const spending = monthTxns.filter(t => t.type === 'DEBIT').reduce((s, t) => s + Number(t.amount), 0);

  const currencyFor = (accountNumber: string) =>
    accounts.find(a => a.accountNumber === accountNumber)?.currency ?? primaryCurrency;

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!depAccount || !Number(depAmount) || Number(depAmount) <= 0) return;
    setDepBusy(true);
    try {
      await deposit(depAccount, Number(depAmount));
      success('Deposit successful');
      setDepositOpen(false);
      setDepAmount('');
      await load();
    } catch (err: any) {
      toastError(err.response?.data?.message || 'Deposit failed');
    } finally {
      setDepBusy(false);
    }
  };

  const quickActions: QuickAction[] = [
    { label: 'Send money', icon: 'send', to: '/transfers' },
    { label: 'Deposit', icon: 'arrowDownLeft', onClick: () => setDepositOpen(true) },
    { label: 'Pay bills', icon: 'zap', to: '/payments' },
    { label: 'Top up', icon: 'phone', to: '/payments' },
    { label: 'Cards', icon: 'card', to: '/cards' },
    { label: 'Verify ID', icon: 'fingerprint', to: '/kyc' },
    { label: 'Statements', icon: 'receipt', to: '/transactions' },
  ];

  if (loading) return <SkeletonRows rows={8} />;
  if (error) return <ErrorState title="Couldn't load your dashboard" body={error} onRetry={load} />;

  return (
    <div className="stack" style={{ gap: 24 }}>
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div>
          <h1 className="page-header__title" style={{ fontSize: 22 }}>
            Welcome back, {user?.username ?? 'there'}
          </h1>
          <p className="page-header__subtitle">Here's what's happening with your money today</p>
        </div>
        <Link to="/transfers" className="btn btn--primary">
          <Icon name="send" size={16} /> New transfer
        </Link>
      </div>

      <div className="hero">
        <div className="hero__top">
          <span className="hero__label">Total balance</span>
          <button
            type="button"
            className="hero__balance-toggle"
            onClick={() => setHidden(v => !v)}
            aria-label={hidden ? 'Show balance' : 'Hide balance'}
          >
            <Icon name={hidden ? 'eye' : 'eyeOff'} size={16} />
          </button>
        </div>
        <div className={`hero__balance ${hidden ? 'hero__balance--hidden' : ''}`}>
          {formatMoney(total, primaryCurrency)}
        </div>
        <div className="hero__details">
          <div>
            <div className="hero__stat-label">Primary account</div>
            <div className="hero__stat-value mono">{primary?.accountNumber ?? '—'}</div>
          </div>
          <div>
            <div className="hero__stat-label">Account type</div>
            <div className="hero__stat-value">{primary?.accountType ?? '—'}</div>
          </div>
          <div>
            <div className="hero__stat-label">This month</div>
            <div className="hero__stat-value">
              <span style={{ color: '#00c853' }}>+{formatMoney(income, primaryCurrency)}</span>
              {' '}
              <span style={{ color: '#ff1744' }}>−{formatMoney(spending, primaryCurrency)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="quick-actions" role="navigation" aria-label="Quick actions">
        {quickActions.map(qa => (
          qa.to ? (
            <Link key={qa.label} to={qa.to} className="qa">
              <span className="qa__icon"><Icon name={qa.icon} size={20} /></span>
              {qa.label}
            </Link>
          ) : (
            <button key={qa.label} type="button" className="qa" onClick={qa.onClick}>
              <span className="qa__icon"><Icon name={qa.icon} size={20} /></span>
              {qa.label}
            </button>
          )
        ))}
      </div>

      <div className="grid-3">
        <div className="surface stat-card">
          <div className="stat-card__icon"><Icon name="wallet" size={18} /></div>
          <div>
            <div className="stat-card__label">Accounts</div>
            <div className="stat-card__value">{accounts.length}</div>
            <div className="stat-card__hint">{accounts.length ? 'Ready to use' : 'Open your first account'}</div>
          </div>
        </div>
        <div className="surface stat-card">
          <div className="stat-card__icon stat-card__icon--success"><Icon name="trending" size={18} /></div>
          <div>
            <div className="stat-card__label">Income (month)</div>
            <div className="stat-card__value" style={{ color: 'var(--color-success)' }}>
              {formatMoney(income, primaryCurrency)}
            </div>
          </div>
        </div>
        <div className="surface stat-card">
          <div className="stat-card__icon stat-card__icon--danger"><Icon name="receipt" size={18} /></div>
          <div>
            <div className="stat-card__label">Spending (month)</div>
            <div className="stat-card__value">{formatMoney(spending, primaryCurrency)}</div>
          </div>
        </div>
      </div>

      <div className="grid-2" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
        <div className="surface" style={{ padding: 'var(--space-5)' }}>
          <div className="page-header" style={{ marginBottom: 16 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>Spending breakdown</h3>
              <p className="muted text-sm">Where your money went this month</p>
            </div>
          </div>
          {monthTxns.filter(t => t.type === 'DEBIT').length === 0 ? (
            <div className="state" style={{ padding: 'var(--space-5) var(--space-2)' }}>
              <div className="state__icon"><Icon name="receipt" size={22} /></div>
              <div className="state__title text-sm">No spending yet this month</div>
            </div>
          ) : (
            <div className="chart-bars">
              {spendingByDescription(monthTxns).map(d => (
                <div key={d.label} className="chart-bar-row">
                  <span className="chart-bar-row__label" title={d.label}>{d.label}</span>
                  <div className="chart-bar-track" role="img" aria-label={`${d.label}: ${d.value}`}>
                    <div className="chart-bar-fill" style={{ width: `${Math.max((d.value / Math.max(spending, 1)) * 100, 4)}%` }} />
                  </div>
                  <span className="chart-bar-row__value">{formatMoney(d.value, primaryCurrency)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="surface" style={{ padding: 'var(--space-5)' }}>
          <div className="page-header" style={{ marginBottom: 16 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>Recent activity</h3>
            </div>
            <Link to="/transactions" className="btn btn--ghost btn--sm">
              View all <Icon name="chevronRight" size={14} />
            </Link>
          </div>
          {txns.length === 0 ? (
            <div className="state" style={{ padding: 'var(--space-5) var(--space-2)' }}>
              <div className="state__icon"><Icon name="receipt" size={22} /></div>
              <div className="state__title text-sm">No transactions yet</div>
            </div>
          ) : (
            <div className="stack" style={{ gap: 4 }}>
              {txns.slice(0, 6).map(t => {
                const credit = t.type === 'CREDIT';
                return (
                  <Link key={t.id} to="/transactions" className="tx-row" style={{ textDecoration: 'none' }}>
                    <span className={`tx-row__icon ${credit ? 'tx-row__icon--credit' : 'tx-row__icon--debit'}`}>
                      <Icon name={credit ? 'arrowDownLeft' : 'arrowUpRight'} size={16} />
                    </span>
                    <span className="tx-row__body">
                      <span className="tx-row__title">{t.description || (credit ? 'Money received' : 'Payment sent')}</span>
                      <span className="tx-row__meta">{formatDateTime(t.createdAt)} · {t.accountNumber}</span>
                    </span>
                    <span className={`tx-row__amount ${credit ? 'tx-row__amount--credit' : 'tx-row__amount--debit'}`}>
                      {credit ? '+' : '−'}{formatMoney(t.amount, currencyFor(t.accountNumber))}
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {cards.length > 0 && (
        <div className="surface" style={{ padding: 'var(--space-5)' }}>
          <div className="page-header" style={{ marginBottom: 16 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>Your cards</h3>
              <p className="muted text-sm">Tap a card for details</p>
            </div>
            <Link to="/cards" className="btn btn--ghost btn--sm">
              Manage <Icon name="chevronRight" size={14} />
            </Link>
          </div>
          <div className="row" style={{ gap: 16, overflowX: 'auto', paddingBottom: 4 }}>
            {cards.slice(0, 3).map(card => (
              <Link
                key={card.id}
                to="/cards"
                className="bank-card-link"
                style={{ minWidth: 300, maxWidth: 340, flex: 1, display: 'block' }}
                aria-label={`View details for card ending in ${card.cardNumber.slice(-4)}`}
              >
                <BankCard
                  card={{
                    id: card.id,
                    last4: card.cardNumber.slice(-4),
                    cardholderName: 'YOU',
                    expiry: card.expiryDate?.slice(0, 7)?.replace('-', '/'),
                    status: card.status,
                    type: card.cardType,
                  }}
                />
              </Link>
            ))}
          </div>
        </div>
      )}

      <Dialog
        open={depositOpen}
        onClose={() => setDepositOpen(false)}
        title="Deposit money"
        subtitle="Credit funds to one of your accounts"
      >
        <form onSubmit={handleDeposit} className="stack stack--4">
          <Field label="Account">
            <Select value={depAccount} onChange={e => setDepAccount(e.target.value)} required>
              <option value="">Select an account</option>
              {accounts.map(a => (
                <option key={a.id} value={a.accountNumber}>
                  {a.accountName} · {a.accountNumber} · {formatMoney(a.balance, a.currency)}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Amount">
            <Input
              type="number"
              min={0.01}
              step={0.01}
              placeholder="0.00"
              value={depAmount}
              onChange={e => setDepAmount(e.target.value)}
              required
              suffix={primaryCurrency}
            />
          </Field>
          <div className="row" style={{ justifyContent: 'flex-end' }}>
            <Button variant="secondary" type="button" onClick={() => setDepositOpen(false)}>Cancel</Button>
            <Button type="submit" loading={depBusy}>Deposit</Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
