import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAccounts } from '../api/accounts';
import { initiateTransfer, getTransfers, reverseTransfer, resolveAccount } from '../api/transfers';
import { auditList, type AuditEvent } from '../api/audit';
import { downloadTransferReceipt } from '../api/receipts';
import { getBeneficiaries } from '../api/beneficiaries';
import { formatMoney, formatDateTime } from '../utils/format';
import { PageHeader } from '../ui/Card';
import Button from '../ui/Button';
import Dialog from '../ui/Dialog';
import { Field, Input, Select } from '../ui/FormControls';
import { StatusBadge } from '../ui/Badge';
import Icon from '../ui/Icon';
import CopyButton from '../ui/CopyButton';
import { SkeletonRows } from '../ui/Skeleton';
import { EmptyState, ErrorState } from '../ui/States';
import { useToast } from '../ui/Toast';
import type { Account, Beneficiary, Transfer } from '../types';

type Step = 1 | 2 | 3;

export default function Transfers() {
  const { success, error: toastError } = useToast();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [step, setStep] = useState<Step>(1);

  const [source, setSource] = useState('');
  const [dest, setDest] = useState('');
  const [amount, setAmount] = useState('');
  const [desc, setDesc] = useState('');
  const [pin, setPin] = useState('');
  const [busy, setBusy] = useState(false);
  const [idempotencyKey, setIdempotencyKey] = useState('');
  const [completed, setCompleted] = useState<Transfer | null>(null);
  const [resolving, setResolving] = useState(false);
  const [resolvedName, setResolvedName] = useState<string | null>(null);
  const [resolveError, setResolveError] = useState('');
  const [selectedTransfer, setSelectedTransfer] = useState<Transfer | null>(null);
  const [receiptBusy, setReceiptBusy] = useState(false);
  const [reverseBusy, setReverseBusy] = useState(false);
  const [showAuditTrail, setShowAuditTrail] = useState(false);
  const [auditTrail, setAuditTrail] = useState<AuditEvent[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditError, setAuditError] = useState('');

  const load = useCallback(async () => {
    try {
      const [acc, ben, tr] = await Promise.all([getAccounts(), getBeneficiaries(), getTransfers()]);
      setAccounts(acc.data ?? []);
      setBeneficiaries(ben.data ?? []);
      setTransfers(tr.data ?? []);
    } catch (err: any) {
      setLoadError(err.response?.data?.message || 'Failed to load transfers');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAuditTrail = useCallback(async (_transferId: string, reference: string) => {
    setAuditLoading(true);
    setAuditError('');
    try {
      const res = await auditList({ targetType: 'TRANSFER', targetId: reference, page: 0, size: 50 });
      setAuditTrail(res.data?.content ?? []);
    } catch (err: any) {
      setAuditError(err.response?.data?.message || 'Failed to load audit trail');
    } finally {
      setAuditLoading(false);
    }
  }, []);

  useEffect(() => { setIdempotencyKey(crypto.randomUUID()); }, []);

  useEffect(() => { load(); }, [load]);

  const sourceAccount = accounts.find(a => a.accountNumber === source);
  const currency = sourceAccount?.currency ?? 'NGN';
  const isValid =
    source && dest && Number(amount) > 0 &&
    (sourceAccount ? Number(amount) <= Number(sourceAccount.balance) : true) &&
    dest !== source;

  const next = () => setStep(2);
  const back = () => setStep(1);

  const doResolve = async () => {
    if (!dest || dest === source) return;
    setResolving(true);
    setResolveError('');
    setResolvedName(null);
    try {
      const r = await resolveAccount(dest);
      setResolvedName(r.data?.accountName ?? null);
    } catch (err: any) {
      setResolveError(err.response?.data?.message || 'Account not found');
    } finally {
      setResolving(false);
    }
  };

  const submit = async () => {
    setBusy(true);
    try {
      const res = await initiateTransfer({
        sourceAccountNumber: source,
        destinationAccountNumber: dest,
        amount: Number(amount),
        description: desc || undefined,
        pin,
        idempotencyKey,
      });
      setCompleted(res.data ?? (res as any).data ?? null);
      setStep(3);
      setSource('');
      setDest('');
      setAmount('');
      setDesc('');
      setPin('');
      success('Transfer sent');
      const tr = await getTransfers();
      setTransfers(tr.data ?? []);
    } catch (err: any) {
      toastError(err.response?.data?.message || err.message || 'Transfer failed');
      // Keep the same idempotency key on retry so a partially-applied transfer isn't double-charged
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <SkeletonRows rows={6} />;
  if (loadError) return <ErrorState title="Couldn't load transfers" body={loadError} onRetry={load} />;

  const startNew = () => {
    setStep(1);
    setCompleted(null);
    setIdempotencyKey(crypto.randomUUID());
    setResolvedName(null);
    setResolveError('');
  };

  const totalSent = transfers
    .filter(t => t.status === 'COMPLETED')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  return (
    <div className="stack" style={{ gap: 24 }}>
      <PageHeader
        title="Transfers"
        subtitle="Send money between accounts"
        actions={
          step === 3 ? undefined : (
            <Button icon="plus" onClick={startNew}>New transfer</Button>
          )
        }
      />

      <div className="layout-split">
        <div className="surface" style={{ padding: 'var(--space-6)' }}>
          {step === 3 && completed ? (
            <div className="anim-pop" style={{ padding: 'var(--space-4) 0' }}>
              <div className="success-check">
                <Icon name="check" size={44} />
              </div>
              <div className="text-center" style={{ marginTop: 20 }}>
                <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>Transfer complete</h2>
                <p className="muted text-sm" style={{ marginTop: 4 }}>
                  Your money is on its way
                </p>
              </div>
              <div className="receipt" style={{ marginTop: 24 }}>
                <div className="receipt__row">
                  <span className="muted">Amount</span>
                  <span>{formatMoney(completed.amount, currency)}</span>
                </div>
                <div className="receipt__row">
                  <span className="muted">To account</span>
                  <span className="mono">{completed.destinationAccountNumber}</span>
                </div>
                <div className="receipt__row">
                  <span className="muted">Reference</span>
                  <span className="row" style={{ gap: 6 }}>
                    <span className="mono">{completed.reference}</span>
                    <CopyButton value={completed.reference} label="Copy" copiedLabel="Copied" />
                  </span>
                </div>
                <div className="receipt__row">
                  <span className="muted">Date</span>
                  <span>{formatDateTime(completed.createdAt)}</span>
                </div>
                <div className="receipt__row receipt__row--total">
                  <span>Status</span>
                  <StatusBadge status={completed.status} />
                </div>
              </div>
              <div className="row" style={{ justifyContent: 'center', marginTop: 24 }}>
                <Button
                  variant="secondary"
                  icon="download"
                  loading={receiptBusy}
                  onClick={async () => {
                    setReceiptBusy(true);
                    try {
                      await downloadTransferReceipt(completed.id);
                    } catch (err: any) {
                      toastError(err.response?.data?.message || 'Receipt download failed');
                    } finally {
                      setReceiptBusy(false);
                    }
                  }}
                >
                  Download receipt (PDF)
                </Button>
                <Button onClick={startNew}>Send another transfer</Button>
              </div>
            </div>
          ) : (
            <>
              <div className="row" style={{ gap: 10, marginBottom: 24 }} aria-label="Transfer steps">
                <span className={`badge ${step === 1 ? 'badge--brand' : 'badge--success'}`}>
                  <Icon name={step === 1 ? 'edit' : 'check'} size={11} /> 1 · Details
                </span>
                <span className={`badge ${step === 2 ? 'badge--brand' : step === 3 ? 'badge--success' : 'badge--neutral'}`}>
                  2 · Review
                </span>
                <span className={`badge ${step === 3 ? 'badge--success' : 'badge--neutral'}`}>3 · Done</span>
              </div>

              {step === 1 && (
                <form onSubmit={e => { e.preventDefault(); next(); }} className="stack stack--4">
                  <div className="grid-2" style={{ gap: 'var(--space-4)' }}>
                    <Field label="From account">
                      <Select value={source} onChange={e => setSource(e.target.value)} required>
                        <option value="">Select source account</option>
                        {accounts.map(a => (
                          <option key={a.id} value={a.accountNumber}>
                            {a.accountName} · {formatMoney(a.balance, a.currency)}
                          </option>
                        ))}
                      </Select>
                    </Field>

                    {beneficiaries.length > 0 && (
                      <Field label="Saved beneficiary">
                        <Select defaultValue="" onChange={e => { if (e.target.value) { setDest(e.target.value); } }}>
                          <option value="">Choose a beneficiary…</option>
                          {beneficiaries.map(b => (
                            <option key={b.id} value={b.accountNumber}>{b.alias} · {b.accountNumber}</option>
                          ))}
                        </Select>
                      </Field>
                    )}
                  </div>

                  <Field label="Destination account number" hint={
                    resolvedName ? `Account name: ${resolvedName}`
                      : resolveError || undefined
                  }>
                    <div className="row" style={{ gap: 8 }}>
                      <Input
                        icon="send"
                        className="input--mono"
                        placeholder="Enter account number"
                        value={dest}
                        onChange={e => { setDest(e.target.value); setResolvedName(null); setResolveError(''); }}
                        required
                        style={{ flex: 1 }}
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        loading={resolving}
                        disabled={!dest || dest === source}
                        onClick={doResolve}
                        style={{ alignSelf: 'flex-start' }}
                      >
                        Verify
                      </Button>
                    </div>
                  </Field>

                  <div className="grid-2" style={{ gap: 'var(--space-4)' }}>
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
                      <Input
                        placeholder="e.g. Rent, groceries…"
                        value={desc}
                        onChange={e => setDesc(e.target.value)}
                      />
                    </Field>
                  </div>

                  {dest === source && <p className="field__error"><Icon name="alert" size={13} /> Source and destination must differ</p>}

                  <div className="row" style={{ justifyContent: 'flex-end' }}>
                    <Link to="/beneficiaries" className="btn btn--ghost btn--sm">
                      Manage beneficiaries
                    </Link>
                    <Button type="submit" disabled={!isValid}>Review transfer</Button>
                  </div>
                </form>
              )}

              {step === 2 && (
                <div className="stack stack--4">
                  <div className="receipt">
                    <div className="receipt__row">
                      <span className="muted">From</span>
                      <span className="mono">{source}</span>
                    </div>
                    <div className="receipt__row">
                      <span className="muted">To</span>
                      <span className="mono">{dest}</span>
                    </div>
                    <div className="receipt__row">
                      <span className="muted">Amount</span>
                      <span>{formatMoney(Number(amount), currency)}</span>
                    </div>
                    <div className="receipt__row">
                      <span className="muted">Description</span>
                      <span>{desc || '—'}</span>
                    </div>
                    <div className="receipt__row receipt__row--total">
                      <span>Total</span>
                      <span>{formatMoney(Number(amount), currency)}</span>
                    </div>
                  </div>
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
                    <Button variant="secondary" onClick={back}>Back</Button>
                    <Button onClick={submit} loading={busy} icon="send">Confirm & send</Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="stack" style={{ gap: 20 }}>
          <div className="surface" style={{ padding: 'var(--space-5)' }}>
            <div className="row row--between" style={{ marginBottom: 4 }}>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 800, margin: 0 }}>Sent this month</h3>
                <p className="muted text-xs" style={{ margin: '3px 0 0' }}>
                  {transfers.filter(t => t.status === 'COMPLETED').length} completed transfer(s)
                </p>
              </div>
              <span className="tx-row__amount tx-row__amount--debit">−{formatMoney(totalSent, 'NGN')}</span>
            </div>
          </div>

          <div className="surface" style={{ padding: 'var(--space-5)' }}>
            <div className="page-header" style={{ marginBottom: 16 }}>
              <h3 style={{ fontSize: 15, fontWeight: 800, margin: 0 }}>Transfer history</h3>
            </div>
            {transfers.length === 0 ? (
              <EmptyState icon="send" title="No transfers yet" body="Your sent transfers will show up here." />
            ) : (
              <div className="stack scroll-list" style={{ gap: 0, paddingRight: 4 }}>
                {[...transfers]
                  .sort((a, b) => b.createdAt.localeCompare(a.createdAt) || b.id.localeCompare(a.id))
                  .map((t, idx) => {
                    const cur = accounts.find(a => a.accountNumber === t.sourceAccountNumber)?.currency ?? 'NGN';
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setSelectedTransfer(t)}
                        className="tx-row"
                        style={{ padding: '18px 0', width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontFamily: 'inherit', borderTop: idx > 0 ? '1px solid var(--color-border)' : 'none' }}
                      >
                        <span className="tx-row__icon tx-row__icon--debit">
                          <Icon name="send" size={16} />
                        </span>
                        <span className="tx-row__body" style={{ flex: 1, minWidth: 0 }}>
                          <span className="tx-row__title" style={{ display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '280px' }}>
                            {t.description || 'Transfer'}
                          </span>
                          <span className="tx-row__meta">{formatDateTime(t.createdAt)} · {t.reference?.slice(0, 14)}</span>
                        </span>
                        <span className="tx-row__meta hidden-mobile mono">{t.destinationAccountNumber}</span>
                        <StatusBadge status={t.status} />
                        <span className="tx-row__amount tx-row__amount--debit">
                          −{formatMoney(t.amount, cur)}
                        </span>
                      </button>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      </div>

      <Dialog
        open={selectedTransfer !== null}
        onClose={() => {
          setSelectedTransfer(null);
          setShowAuditTrail(false);
          setAuditTrail([]);
        }}
        title="Transfer details"
        subtitle={selectedTransfer ? formatDateTime(selectedTransfer.createdAt) : undefined}
      >
        {selectedTransfer && (
          <div className="stack stack--4">
            <div className="stack" style={{ gap: 10 }}>
              {[
                { label: 'Reference', value: selectedTransfer.reference },
                { label: 'From account', value: selectedTransfer.sourceAccountNumber },
                { label: 'To account', value: selectedTransfer.destinationAccountNumber },
                { label: 'Amount', value: formatMoney(selectedTransfer.amount, currency) },
                { label: 'Description', value: selectedTransfer.description || '—' },
              ].map(row => (
                <div key={row.label} className="row row--between" style={{ gap: 12 }}>
                  <span className="muted text-sm">{row.label}</span>
                  <span className="text-sm font-semibold mono" style={{ textAlign: 'right' }}>{row.value}</span>
                </div>
              ))}
            </div>
            <div className="stack" style={{ gap: 8, marginTop: 8, paddingTop: 16, borderTop: '1px solid var(--color-border)' }}>
              <Button
                variant="ghost"
                icon={showAuditTrail ? 'chevronUp' : 'chevronDown'}
                onClick={() => {
                  setShowAuditTrail(!showAuditTrail);
                  if (!showAuditTrail && auditTrail.length === 0) {
                    fetchAuditTrail(selectedTransfer.id, selectedTransfer.reference);
                  }
                }}
                style={{ alignSelf: 'flex-start', textTransform: 'none' }}
              >
                {showAuditTrail ? 'Hide audit trail' : 'Show audit trail'}
              </Button>
              {showAuditTrail && (
                <div className="stack" style={{ gap: 8, marginTop: 8 }}>
                  {auditLoading ? (
                    <div className="stack" style={{ gap: 8, padding: 'var(--space-4)' }}>
                      <SkeletonRows rows={3} />
                    </div>
                  ) : auditError ? (
                    <div className="surface" style={{ background: 'var(--color-danger-soft)', borderColor: 'var(--color-danger-border)', color: 'var(--color-danger)', padding: '12px 16px' }}>
                      <div className="row" style={{ gap: 8 }}>
                        <Icon name="alert" size={16} />
                        <span className="text-sm font-semibold">{auditError}</span>
                      </div>
                    </div>
                  ) : auditTrail.length === 0 ? (
                    <div className="surface" style={{ padding: 'var(--space-4)', textAlign: 'center', color: 'var(--color-text-3)' }}>
                      No audit events found for this transfer.
                    </div>
                  ) : (
                    <div className="surface" style={{ padding: 0, overflow: 'hidden' }}>
                      <div className="table-wrap">
                        <table className="table">
                          <thead>
                            <tr>
                              <th>Event</th>
                              <th>Action</th>
                              <th>Actor</th>
                              <th>Status</th>
                              <th>Time</th>
                            </tr>
                          </thead>
                          <tbody>
                            {auditTrail.map(event => (
                              <tr key={event.id}>
                                <td className="text-sm">{event.eventType}</td>
                                <td className="text-sm">{event.action || '—'}</td>
                                <td className="text-sm mono">{event.actorId ? `${event.actorType}: ${event.actorId.slice(0, 8)}` : 'System'}</td>
                                <td><StatusBadge status={event.status} /></td>
                                <td className="text-sm mono">{formatDateTime(event.occurredAt)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            {selectedTransfer.status === 'COMPLETED' && (
              <>
                <Button
                  variant="secondary"
                  icon="download"
                  loading={receiptBusy}
                  onClick={async () => {
                    setReceiptBusy(true);
                    try {
                      await downloadTransferReceipt(selectedTransfer.id);
                    } catch (err: any) {
                      toastError(err.response?.data?.message || 'Receipt download failed');
                    } finally {
                      setReceiptBusy(false);
                    }
                  }}
                >
                  Download receipt (PDF)
                </Button>
                <Button
                  variant="danger"
                  icon="refresh"
                  loading={reverseBusy}
                  onClick={async () => {
                    setReverseBusy(true);
                    try {
                      await reverseTransfer(selectedTransfer.id);
                      success('Transfer reversed');
                      setSelectedTransfer(null);
                      const tr = await getTransfers();
                      setTransfers(tr.data ?? []);
                    } catch (err: any) {
                      toastError(err.response?.data?.message || 'Reversal failed');
                    } finally {
                      setReverseBusy(false);
                    }
                  }}
                >
                  Reverse transfer
                </Button>
              </>
            )}
          </div>
        )}
      </Dialog>
    </div>
  );
}
