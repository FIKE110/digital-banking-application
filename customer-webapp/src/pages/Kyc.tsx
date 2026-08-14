import { useCallback, useEffect, useState } from 'react';
import { PageHeader } from '../ui/Card';
import Button from '../ui/Button';
import { Field, Input } from '../ui/FormControls';
import Icon from '../ui/Icon';
import { SkeletonRows } from '../ui/Skeleton';
import { ErrorState } from '../ui/States';
import { useToast } from '../ui/Toast';
import { getKycStatus, submitKyc, type KycStatus } from '../api/kyc';
import { BANK_NAME } from '../config';

const STATUS_TONE: Record<string, string> = {
  VERIFIED: 'badge--success',
  PENDING: 'badge--warning',
  UNVERIFIED: 'badge--neutral',
};

const TIER_INFO: Record<string, string> = {
  TIER_1: 'Standard — everyday banking limits',
  TIER_2: 'Verified — higher transfer and bill limits',
  TIER_3: 'Premium — maximum limits and perks',
};

export default function Kyc() {
  const { success, error: toastError } = useToast();
  const [status, setStatus] = useState<KycStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [bvn, setBvn] = useState('');
  const [nin, setNin] = useState('');
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    getKycStatus()
      .then(r => setStatus(r.data ?? null))
      .catch((err: any) => setLoadError(err.response?.data?.message || 'Failed to load KYC status'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await submitKyc({ bvn, nin });
      setSubmitted(true);
      setBvn('');
      setNin('');
      success('Identity details submitted for review');
      await load();
    } catch (err: any) {
      toastError(err.response?.data?.message || 'Submission failed');
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <SkeletonRows rows={6} />;
  if (loadError) return <ErrorState title="Couldn't load KYC status" body={loadError} onRetry={load} />;

  const verified = status?.verified ?? false;
  const pending = status?.bvnVerificationStatus === 'PENDING' || status?.ninVerificationStatus === 'PENDING';
  const kycStatus = status?.bvnVerificationStatus ?? 'UNVERIFIED';
  const tier = status?.tier ?? 'TIER_1';

  return (
    <div className="stack" style={{ gap: 24 }}>
      <PageHeader
        title="Identity verification"
        subtitle="Submit your BVN and NIN to unlock higher limits"
        actions={verified
          ? <span className="badge badge--success"><Icon name="checkCircle" size={11} /> Verified</span>
          : pending
            ? <span className="badge badge--warning"><Icon name="clock" size={11} /> Pending review</span>
            : <span className="badge badge--neutral"><Icon name="info" size={11} /> Not verified</span>}
      />

      <div className="layout-split">
        <div className="surface" style={{ padding: 'var(--space-6)' }}>
          {submitted ? (
            <div className="stack" style={{ gap: 16 }}>
              <div className="success-check" style={{ alignSelf: 'center' }}>
                <Icon name="check" size={40} />
              </div>
              <div className="text-center">
                <h2 style={{ fontSize: 19, fontWeight: 800, margin: 0 }}>Submitted for review</h2>
                <p className="muted text-sm" style={{ marginTop: 4 }}>
                  Our team will review your details. You'll be notified once your tier is upgraded.
                </p>
              </div>
              <div className="row" style={{ justifyContent: 'center' }}>
                <Button variant="secondary" onClick={() => setSubmitted(false)}>Submit new details</Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="stack" style={{ gap: 'var(--space-4)' }}>
              <div className="stack" style={{ gap: 8 }}>
                <div className="row" style={{ gap: 10 }}>
                  <span className={`stat-card__icon ${STATUS_TONE[kycStatus] === 'badge--success' ? 'stat-card__icon--success' : kycStatus === 'PENDING' ? 'stat-card__icon--warning' : 'stat-card__icon--info'}`}>
                    <Icon name="fingerprint" size={18} />
                  </span>
                  <div>
                    <div className="font-semibold" style={{ fontSize: 14 }}>Current tier: {tier.replace('_', ' ')}</div>
                    <div className="muted text-xs">{TIER_INFO[tier] ?? ''}</div>
                  </div>
                </div>
              </div>

              <Field label="BVN (Bank Verification Number)" hint="An 11-digit number issued by the CBN">
                <Input
                  inputMode="numeric"
                  pattern="\d*"
                  maxLength={11}
                  placeholder="Enter your 11-digit BVN"
                  value={bvn}
                  onChange={e => setBvn(e.target.value)}
                  required
                />
              </Field>
              <Field label="NIN (National Identification Number)" hint="An 11-digit number issued by NIMC">
                <Input
                  inputMode="numeric"
                  pattern="\d*"
                  maxLength={11}
                  placeholder="Enter your 11-digit NIN"
                  value={nin}
                  onChange={e => setNin(e.target.value)}
                  required
                />
              </Field>

              {status?.bvn && (
                <div className="surface" style={{ background: 'var(--color-brand-soft)', borderColor: 'var(--color-brand-border)', padding: '10px 14px' }}>
                  <div className="row" style={{ gap: 8 }}>
                    <Icon name="info" size={15} />
                    <span className="text-sm">Previously submitted on {BANK_NAME}: BVN {status.bvn}, NIN {status.nin}. Submitting again will replace your old details.</span>
                  </div>
                </div>
              )}

              <div className="row" style={{ justifyContent: 'flex-end' }}>
                <Button type="submit" loading={busy} icon="shield">
                  {status?.bvn ? 'Resubmit for review' : 'Submit for review'}
                </Button>
              </div>
            </form>
          )}
        </div>

        <div className="stack" style={{ gap: 20 }}>
          <div className="surface" style={{ padding: 'var(--space-6)' }}>
            <div className="stat-card__label" style={{ marginBottom: 12 }}>Verification status</div>
            <div className="stack" style={{ gap: 12 }}>
              <div className="row row--between">
                <span className="text-sm">BVN verification</span>
                <span className={`badge ${STATUS_TONE[status?.bvnVerificationStatus ?? 'UNVERIFIED']}`}>
                  {status?.bvnVerificationStatus ?? 'Unverified'}
                </span>
              </div>
              <div className="row row--between">
                <span className="text-sm">NIN verification</span>
                <span className={`badge ${STATUS_TONE[status?.ninVerificationStatus ?? 'UNVERIFIED']}`}>
                  {status?.ninVerificationStatus ?? 'Unverified'}
                </span>
              </div>
            </div>
          </div>

          <div className="surface" style={{ padding: 'var(--space-6)' }}>
            <div className="stat-card__label" style={{ marginBottom: 10 }}>Tiers</div>
            <div className="stack" style={{ gap: 10 }}>
              {Object.entries(TIER_INFO).map(([t, desc]) => (
                <div key={t} className="row" style={{ gap: 10 }}>
                  {tier === t
                    ? <Icon name="checkCircle" size={14} />
                    : <span style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid var(--color-border)', flexShrink: 0 }} />}
                  <div>
                    <div className="font-semibold text-sm">{t.replace('_', ' ')}</div>
                    <div className="muted text-xs">{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}