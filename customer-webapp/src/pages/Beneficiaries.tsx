import { useCallback, useEffect, useState } from 'react';
import { getBeneficiaries, createBeneficiary, deleteBeneficiary } from '../api/beneficiaries';
import { formatDate } from '../utils/format';
import { PageHeader } from '../ui/Card';
import Button from '../ui/Button';
import Dialog from '../ui/Dialog';
import { Field, Input } from '../ui/FormControls';
import Icon from '../ui/Icon';
import CopyButton from '../ui/CopyButton';
import { SkeletonRows } from '../ui/Skeleton';
import { EmptyState, ErrorState } from '../ui/States';
import { useToast } from '../ui/Toast';
import type { Beneficiary } from '../types';
import { BANK_NAME } from '../config';

export default function BeneficiariesPage() {
  const { success, error: toastError } = useToast();
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [alias, setAlias] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [bankName, setBankName] = useState('');
  const [description, setDescription] = useState('');
  const [busy, setBusy] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Beneficiary | null>(null);

  const fetchBeneficiaries = useCallback(async () => {
    try {
      const r = await getBeneficiaries();
      setBeneficiaries(r.data ?? []);
    } catch (err: any) {
      setLoadError(err.response?.data?.message || 'Failed to load beneficiaries');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBeneficiaries(); }, [fetchBeneficiaries]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await createBeneficiary({ alias, accountNumber, bankName: bankName || undefined, description: description || undefined });
      success('Beneficiary added');
      setShowForm(false);
      setAlias('');
      setAccountNumber('');
      setBankName('');
      setDescription('');
      await fetchBeneficiaries();
    } catch (err: any) {
      toastError(err.response?.data?.message || 'Failed to add beneficiary');
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setBusy(true);
    try {
      await deleteBeneficiary(deleteTarget.id);
      success('Beneficiary removed');
      setDeleteTarget(null);
      await fetchBeneficiaries();
    } catch (err: any) {
      toastError(err.response?.data?.message || 'Failed to remove beneficiary');
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <SkeletonRows rows={5} />;
  if (loadError) return <ErrorState title="Couldn't load beneficiaries" body={loadError} onRetry={fetchBeneficiaries} />;

  return (
    <div className="stack" style={{ gap: 24 }}>
      <PageHeader
        title="Beneficiaries"
        subtitle="Saved accounts for faster transfers"
        actions={
          <Button icon="plus" onClick={() => setShowForm(true)}>Add beneficiary</Button>
        }
      />

      {beneficiaries.length === 0 ? (
        <EmptyState
          icon="users"
          title="No beneficiaries yet"
          body="Save the people and businesses you pay often, then send money to them in a tap."
          actionLabel="Add beneficiary"
          action={() => setShowForm(true)}
        />
      ) : (
        <div className="grid-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
          {beneficiaries.map(b => (
            <div key={b.id} className="surface" style={{ padding: 'var(--space-5)' }}>
              <div className="row row--between" style={{ gap: 10, alignItems: 'flex-start' }}>
                <div className="row" style={{ gap: 12 }}>
                  <div className="avatar" style={{ width: 42, height: 42, fontSize: 15 }}>
                    {b.alias?.charAt(0).toUpperCase() ?? '?'}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div className="font-semibold" style={{ fontSize: 15 }}>{b.alias}</div>
                    <div className="mono text-sm muted">{b.accountNumber}</div>
                    <div className="muted text-xs mt-1">{b.bankName || BANK_NAME}</div>
                  </div>
                </div>
                <Button variant="danger-ghost" size="sm" onClick={() => setDeleteTarget(b)}>
                  <Icon name="trash" size={13} /> Remove
                </Button>
              </div>
              <div className="row row--between" style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--color-border)' }}>
                <span className="muted text-xs">Added {formatDate(b.createdAt)}</span>
                <CopyButton value={b.accountNumber} label="Copy number" copiedLabel="Copied" />
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showForm} onClose={() => setShowForm(false)} title="Add beneficiary" subtitle="Save an account for quick transfers">
        <form onSubmit={handleCreate} className="stack stack--4">
          <Field label="Alias" hint="e.g. Mom, Landlord, Gym">
            <Input icon="users" placeholder="Who is this?" value={alias} onChange={e => setAlias(e.target.value)} required />
          </Field>
          <Field label="Account number">
            <Input
              icon="bank"
              className="input--mono"
              placeholder="10-digit account number"
              value={accountNumber}
              onChange={e => setAccountNumber(e.target.value)}
              required
              maxLength={10}
            />
          </Field>
          <Field label="Bank name (optional)">
            <Input placeholder={`e.g. ${BANK_NAME}`} value={bankName} onChange={e => setBankName(e.target.value)} />
          </Field>
          <Field label="Description (optional)">
            <Input placeholder="e.g. Monthly rent" value={description} onChange={e => setDescription(e.target.value)} />
          </Field>
          <div className="row" style={{ justifyContent: 'flex-end' }}>
            <Button variant="secondary" type="button" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button type="submit" loading={busy}>Add beneficiary</Button>
          </div>
        </form>
      </Dialog>

      <Dialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="Remove beneficiary"
        subtitle={deleteTarget ? `${deleteTarget.alias} · ${deleteTarget.accountNumber}` : undefined}
      >
        <div className="stack stack--4">
          <p className="text-sm" style={{ color: 'var(--color-text-2)' }}>
            This beneficiary will be removed from your saved list. Transfers already sent are not affected.
          </p>
          <div className="row" style={{ justifyContent: 'flex-end' }}>
            <Button variant="secondary" type="button" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete} loading={busy}>Remove</Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
