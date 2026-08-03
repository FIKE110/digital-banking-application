import { useState } from 'react';
import { adminAdjust } from '../api/admin';
import { PageHeader } from '../ui/Card';
import Icon from '../ui/Icon';
import { useToast } from '../ui/Toast';

type AdjustKind = 'credit' | 'debit' | 'balance';

const KIND_LABELS: Record<AdjustKind, string> = {
  credit: 'Manual Credit',
  debit: 'Manual Debit',
  balance: 'Balance Adjustment',
};

export default function AdminAdjustments() {
  const { success, error: toastError } = useToast();
  const [kind, setKind] = useState<AdjustKind>('credit');
  const [form, setForm] = useState({ accountNumber: '', amount: '', reason: '', reference: '' });
  const [busy, setBusy] = useState(false);
  const [queued, setQueued] = useState(false);

  const submit = async () => {
    if (!form.accountNumber.trim() || !form.amount) return;
    setBusy(true);
    setQueued(false);
    try {
      const res = await adminAdjust(kind, {
        accountNumber: form.accountNumber.trim(),
        amount: Number(form.amount),
        reason: form.reason.trim() || undefined,
        reference: form.reference.trim() || undefined,
      });
      if (res.data) {
        setQueued(true);
        success(`Submitted for approval (queue #${res.data.id})`);
      } else {
        success('Adjustment executed successfully');
      }
      setForm({ accountNumber: '', amount: '', reason: '', reference: '' });
    } catch (err: any) {
      toastError(err.response?.data?.message || 'Failed to process adjustment');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="stack" style={{ gap: 24 }}>
      <PageHeader
        title="Admin · Adjustments"
        subtitle="Credit, debit or correct account balances. Amounts of ₦1,000,000 and above require approval."
        actions={<span className="badge badge--warning"><Icon name="shield" size={11} /> Administrator</span>}
      />

      <div className="surface" style={{ maxWidth: 560, padding: 'var(--space-4)' }}>
        <div className="stack" style={{ gap: 16 }}>
          <div className="row" style={{ gap: 8 }}>
            {(Object.keys(KIND_LABELS) as AdjustKind[]).map(k => (
              <button
                key={k}
                className={`btn btn--sm ${kind === k ? 'btn--brand' : 'btn--ghost'}`}
                onClick={() => setKind(k)}
              >
                {KIND_LABELS[k]}
              </button>
            ))}
          </div>

          <div className="field">
            <label className="field__label">Account number</label>
            <input
              className="input"
              value={form.accountNumber}
              onChange={e => setForm(prev => ({ ...prev, accountNumber: e.target.value }))}
              placeholder="e.g. 0012345678"
            />
          </div>

          <div className="field">
            <label className="field__label">Amount ({kind === 'balance' ? 'New balance' : 'NGN'})</label>
            <input
              className="input"
              type="number"
              min="0"
              step="0.01"
              value={form.amount}
              onChange={e => setForm(prev => ({ ...prev, amount: e.target.value }))}
              placeholder="0.00"
            />
          </div>

          <div className="field">
            <label className="field__label">Reason</label>
            <textarea
              className="textarea"
              rows={3}
              value={form.reason}
              onChange={e => setForm(prev => ({ ...prev, reason: e.target.value }))}
              placeholder="Why is this adjustment required?"
            />
          </div>

          <div className="field">
            <label className="field__label">Reference (optional)</label>
            <input
              className="input"
              value={form.reference}
              onChange={e => setForm(prev => ({ ...prev, reference: e.target.value }))}
              placeholder="Internal reference"
            />
          </div>

          <div className="row" style={{ gap: 8, alignItems: 'center' }}>
            <button className="btn btn--brand" onClick={submit} disabled={busy || !form.accountNumber.trim() || !form.amount}>
              <Icon name="check" size={14} /> {KIND_LABELS[kind]}
            </button>
            {queued && <span className="badge badge--warning"><Icon name="clock" size={11} /> Queued for approval</span>}
          </div>

          <p className="text-xs muted" style={{ margin: 0 }}>
            Adjustments below ₦1,000,000 execute immediately. Larger adjustments enter the approval queue for a second administrator.
          </p>
        </div>
      </div>
    </div>
  );
}