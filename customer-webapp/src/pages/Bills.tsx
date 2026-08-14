import { useCallback, useEffect, useMemo, useState } from 'react';
import { getAccounts } from '../api/accounts';
import { payBill, getBillPayments, getBillerCatalog } from '../api/bills';
import { downloadBillReceipt } from '../api/receipts';
import { formatMoney, formatDateTime } from '../utils/format';
import { PageHeader } from '../ui/Card';
import Button from '../ui/Button';
import Dialog from '../ui/Dialog';
import { Field, Input, Select } from '../ui/FormControls';
import { StatusBadge } from '../ui/Badge';
import Icon from '../ui/Icon';
import { SkeletonRows } from '../ui/Skeleton';
import { EmptyState, ErrorState } from '../ui/States';
import { useToast } from '../ui/Toast';
import type { Account, BillPayment, BillerCatalogItem } from '../types';

interface Provider {
  name: string;
  icon: string;
  tone: string;
}

const FALLBACK_PROVIDERS: Provider[] = [
  { name: 'Electricity', icon: 'zap', tone: 'warning' },
  { name: 'Internet', icon: 'wifi', tone: 'brand' },
  { name: 'Cable TV', icon: 'tv', tone: 'danger' },
  { name: 'Water', icon: 'droplet', tone: 'info' },
  { name: 'Mobile Top-up', icon: 'phone', tone: 'success' },
  { name: 'Data & Airtime', icon: 'globe', tone: 'brand' },
  { name: 'Insurance', icon: 'shield', tone: 'warning' },
  { name: 'Education', icon: 'gift', tone: 'info' },
  { name: 'Rent', icon: 'home', tone: 'neutral' },
  { name: 'Transport', icon: 'plane', tone: 'danger' },
];

const CATEGORY_ICON: Record<string, string> = {
  Utilities: 'zap',
  Entertainment: 'tv',
  Mobile: 'phone',
  Financial: 'shield',
  Education: 'gift',
  Housing: 'home',
  Travel: 'plane',
};

const CATEGORY_TONE: Record<string, string> = {
  Utilities: 'warning',
  Entertainment: 'danger',
  Mobile: 'success',
  Financial: 'warning',
  Education: 'info',
  Housing: 'neutral',
  Travel: 'danger',
};

function mapCatalog(items: BillerCatalogItem[]): Provider[] {
  return items.map(item => ({
    name: item.name,
    icon: CATEGORY_ICON[item.category] ?? 'receipt',
    tone: CATEGORY_TONE[item.category] ?? 'neutral',
  }));
}

const TONE_CLASS: Record<string, string> = {
  warning: 'stat-card__icon--warning',
  brand: '',
  danger: 'stat-card__icon--danger',
  info: 'stat-card__icon--info',
  success: 'stat-card__icon--success',
  neutral: '',
};

export default function Bills() {
  const { success, error: toastError } = useToast();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [payments, setPayments] = useState<BillPayment[]>([]);
  const [catalog, setCatalog] = useState<Provider[]>(FALLBACK_PROVIDERS);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [source, setSource] = useState('');
  const [customerReference, setCustomerReference] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [pin, setPin] = useState('');
  const [busy, setBusy] = useState(false);
  const [receiptBusyId, setReceiptBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [acc, pay, cat] = await Promise.all([
        getAccounts(),
        getBillPayments(),
        getBillerCatalog().catch(() => ({ data: null })),
      ]);
      setAccounts(acc.data ?? []);
      setPayments(pay.data ?? []);
      if (cat.data?.length) setCatalog(mapCatalog(cat.data));
    } catch (err: any) {
      setLoadError(err.response?.data?.message || 'Failed to load payment services');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const sourceAccount = accounts.find(a => a.accountNumber === source);
  const currency = sourceAccount?.currency ?? 'NGN';

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProvider || !source || !customerReference || Number(amount) <= 0) return;
    setBusy(true);
    try {
      await payBill({
        sourceAccountNumber: source,
        provider: selectedProvider,
        customerReference,
        amount: Number(amount),
        description: description || undefined,
        pin,
      });
      success(`Payment to ${selectedProvider} initiated`);
      setSelectedProvider(null);
      setSource('');
      setCustomerReference('');
      setAmount('');
      setDescription('');
      setPin('');
      const res = await getBillPayments();
      setPayments(res.data ?? []);
    } catch (err: any) {
      toastError(err.response?.data?.message || 'Payment failed');
    } finally {
      setBusy(false);
    }
  };

  const paymentCurrency = (p: BillPayment) =>
    accounts.find(a => a.accountNumber === p.sourceAccountNumber)?.currency ?? 'NGN';

  const totals = useMemo(() => {
    const completed = payments.filter(p => p.status === 'COMPLETED');
    return {
      count: completed.length,
      sum: completed.reduce((s, p) => s + Number(p.amount), 0),
    };
  }, [payments]);

  if (loading) return <SkeletonRows rows={6} />;
  if (loadError) return <ErrorState title="Couldn't load payment services" body={loadError} onRetry={load} />;

  return (
    <div className="stack" style={{ gap: 24 }}>
      <PageHeader
        title="Payments"
        subtitle="Pay bills, top up airtime and more"
      />

      <div className="grid-3">
        <div className="surface stat-card">
          <div className="stat-card__icon"><Icon name="zap" size={18} /></div>
          <div>
            <div className="stat-card__label">Billers available</div>
            <div className="stat-card__value">{catalog.length}</div>
          </div>
        </div>
        <div className="surface stat-card">
          <div className="stat-card__icon stat-card__icon--success"><Icon name="checkCircle" size={18} /></div>
          <div>
            <div className="stat-card__label">Completed payments</div>
            <div className="stat-card__value">{totals.count}</div>
          </div>
        </div>
        <div className="surface stat-card">
          <div className="stat-card__icon stat-card__icon--info"><Icon name="receipt" size={18} /></div>
          <div>
            <div className="stat-card__label">Total paid</div>
            <div className="stat-card__value">{formatMoney(totals.sum, currency)}</div>
          </div>
        </div>
      </div>

      <div className="surface" style={{ padding: 'var(--space-5)' }}>
        <div className="page-header" style={{ marginBottom: 16 }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>Choose a service</h3>
            <p className="muted text-sm">Select a biller to get started</p>
          </div>
        </div>
        <div className="grid-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))' }}>
          {catalog.map(p => (
            <button
              key={p.name}
              type="button"
              className="qa"
              onClick={() => setSelectedProvider(p.name)}
              aria-pressed={selectedProvider === p.name}
              style={selectedProvider === p.name ? { borderColor: 'var(--color-brand)', color: 'var(--color-brand)', background: 'var(--color-brand-soft)' } : undefined}
            >
              <span className={`qa__icon ${TONE_CLASS[p.tone]}`}>
                <Icon name={p.icon} size={20} />
              </span>
              {p.name}
            </button>
          ))}
        </div>
      </div>

      <Dialog
        open={selectedProvider !== null}
        onClose={() => setSelectedProvider(null)}
        title={selectedProvider ? `Pay ${selectedProvider}` : ''}
        subtitle="Enter your payment details"
      >
        <form onSubmit={handlePay} className="stack stack--4">
          <Field label="Pay from">
            <Select value={source} onChange={e => setSource(e.target.value)} required>
              <option value="">Select payment account</option>
              {accounts.map(a => (
                <option key={a.id} value={a.accountNumber}>
                  {a.accountName} · {formatMoney(a.balance, a.currency)}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Customer reference" hint="Account number, meter number or phone number">
            <Input
              icon="users"
              placeholder="e.g. meter / account / phone number"
              value={customerReference}
              onChange={e => setCustomerReference(e.target.value)}
              required
            />
          </Field>
          <Field label={`Amount (${currency})`} hint={sourceAccount && Number(amount) > Number(sourceAccount.balance) ? 'Insufficient balance' : undefined}>
            <Input
              type="number"
              min={0.01}
              step={0.01}
              placeholder="0.00"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              required
              suffix={currency}
            />
          </Field>
          <Field label="Description (optional)">
            <Input placeholder="e.g. December electricity bill" value={description} onChange={e => setDescription(e.target.value)} />
          </Field>
          <Field label="Transaction PIN">
            <Input
              type="password"
              inputMode="numeric"
              pattern="\d*"
              maxLength={4}
              value={pin}
              onChange={e => setPin(e.target.value)}
              placeholder="Enter your 4-digit PIN"
              autoComplete="off"
              required
            />
          </Field>
          <div className="row" style={{ justifyContent: 'flex-end' }}>
            <Button variant="secondary" type="button" onClick={() => setSelectedProvider(null)}>Cancel</Button>
            <Button type="submit" loading={busy} icon="zap">Pay {selectedProvider}</Button>
          </div>
        </form>
      </Dialog>

      <div className="surface" style={{ padding: 'var(--space-5)' }}>
        <div className="page-header" style={{ marginBottom: 16 }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>Payment history</h3>
          </div>
        </div>
        {payments.length === 0 ? (
          <EmptyState icon="receipt" title="No payments yet" body="Your paid bills will appear here." />
        ) : (
          <div className="stack" style={{ gap: 2 }}>
            {payments.slice(0, 10).map(p => (
              <div key={p.id} className="tx-row">
                <span className="tx-row__icon tx-row__icon--debit">
                  <Icon name="zap" size={16} />
                </span>
                <span className="tx-row__body">
                  <span className="tx-row__title">{p.provider}</span>
                  <span className="tx-row__meta"> {formatDateTime(p.createdAt)} · {p.customerReference} · {p.reference?.slice(0, 12)}</span>
                </span>
                <span className="tx-row__meta hidden-mobile mono">{p.sourceAccountNumber}</span>
                <StatusBadge status={p.status} />
                <button
                  type="button"
                  className="icon-btn"
                  title="Download receipt (PDF)"
                  aria-label="Download receipt"
                  disabled={receiptBusyId === p.id}
                  onClick={async e => {
                    e.stopPropagation();
                    setReceiptBusyId(p.id);
                    try {
                      await downloadBillReceipt(p.id);
                      success('Receipt downloaded');
                    } catch (err: any) {
                      toastError(err.response?.data?.message || 'Receipt download failed');
                    } finally {
                      setReceiptBusyId(null);
                    }
                  }}
                >
                  <Icon name="download" size={15} />
                </button>
                <span className="tx-row__amount tx-row__amount--debit">
                  −{formatMoney(p.amount, paymentCurrency(p))}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
