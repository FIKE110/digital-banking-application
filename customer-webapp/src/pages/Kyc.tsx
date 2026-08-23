import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../ui/Card';
import Button from '../ui/Button';
import { Field, Input, Select } from '../ui/FormControls';
import Icon from '../ui/Icon';
import { useToast } from '../ui/Toast';
import { submitKyc, type KycSubmitPayload } from '../api/kyc';
import { useKyc } from '../contexts/KycContext';

const STEPS = [
  { key: 'personal', label: 'Personal details' },
  { key: 'bvn', label: 'BVN verification' },
  { key: 'nin', label: 'NIN verification' },
  { key: 'match', label: 'Identity match' },
  { key: 'address', label: 'Address' },
  { key: 'review', label: 'Review & submit' },
];

const TIER_INFO: Record<string, string> = {
  TIER_1: 'Standard (everyday banking limits)',
  TIER_2: 'Verified (higher transfer and bill limits)',
  TIER_3: 'Premium (maximum limits and perks)',
};

interface FormState {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  phoneNumber: string;
  address: string;
  city: string;
  state: string;
  country: string;
  bvn: string;
  nin: string;
}

const INITIAL_FORM: FormState = {
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  gender: '',
  phoneNumber: '',
  address: '',
  city: '',
  state: '',
  country: 'Nigeria',
  bvn: '',
  nin: '',
};

export default function Kyc() {
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();
  const { kyc, refresh } = useKyc();

  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [busy, setBusy] = useState(false);
  const [restarting, setRestarting] = useState(false);

  const status = restarting ? 'NOT_STARTED' : (kyc?.status ?? 'NOT_STARTED');

  const set = (key: keyof FormState) => (value: string) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const initials = useMemo(() => {
    const first = form.firstName?.charAt(0)?.toUpperCase() ?? '';
    const last = form.lastName?.charAt(0)?.toUpperCase() ?? '';
    return first + last;
  }, [form.firstName, form.lastName]);

  const personalValid =
    form.firstName.trim() !== '' &&
    form.lastName.trim() !== '' &&
    form.dateOfBirth !== '' &&
    form.gender !== '' &&
    /^\d{7,15}$/.test(form.phoneNumber.trim());

  const addressValid =
    form.address.trim() !== '' &&
    form.city.trim() !== '' &&
    form.state.trim() !== '' &&
    form.country.trim() !== '';

  const bvnValid = /^\d{11}$/.test(form.bvn.trim());
  const ninValid = /^\d{11}$/.test(form.nin.trim());

  const stepValid = () => {
    switch (step) {
      case 0: return personalValid;
      case 1: return bvnValid;
      case 2: return ninValid;
      case 3: return true;
      case 4: return addressValid;
      default: return true;
    }
  };

  const next = () => {
    if (!stepValid()) return;
    setStep(s => Math.min(s + 1, STEPS.length - 1));
  };

  const handleSubmit = async () => {
    setBusy(true);
    const payload: KycSubmitPayload = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      dateOfBirth: form.dateOfBirth,
      gender: form.gender,
      phoneNumber: form.phoneNumber.trim(),
      address: form.address.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
      country: form.country.trim(),
      bvn: form.bvn.trim(),
      nin: form.nin.trim(),
    };
    try {
      await submitKyc(payload);
      setRestarting(false);
      success('Identity details submitted for review');
      await refresh();
    } catch (err: any) {
      toastError(err.response?.data?.message || 'Submission failed');
      setStep(4);
    } finally {
      setBusy(false);
    }
  };

  // Pending / under-review screen
  if (!restarting && (status === 'UNDER_REVIEW' || status === 'SUBMITTED')) {
    return (
      <div className="stack" style={{ gap: 24, maxWidth: 560, margin: '0 auto' }}>
        <div className="surface" style={{ padding: 'var(--space-7)' }}>
          <div className="stack" style={{ gap: 20, alignItems: 'center', textAlign: 'center' }}>
            <div className="success-check" style={{ background: 'var(--color-warning-soft)', borderColor: 'var(--color-warning-border)' }}>
              <Icon name="clock" size={40} />
            </div>
            <div>
              <h2 style={{ fontSize: 21, fontWeight: 800, margin: 0 }}>KYC Under Review</h2>
              <p className="muted text-sm" style={{ marginTop: 8 }}>
                We've received your information and our team is reviewing it. You can explore the
                app while you wait. We'll notify you once your account has been approved.
              </p>
            </div>

            <div className="surface" style={{ width: '100%', borderColor: 'var(--color-border)', padding: 'var(--space-5)' }}>
              <div className="stat-card__label" style={{ marginBottom: 12 }}>Verification progress</div>
              <div className="stack" style={{ gap: 12 }}>
                {[
                  { label: 'Personal information', done: true },
                  { label: 'BVN verification', done: true },
                  { label: 'NIN verification', done: true },
                  { label: 'Identity match', done: true },
                  { label: 'Back-office review', done: false },
                ].map(item => (
                  <div key={item.label} className="row" style={{ gap: 10 }}>
                    {item.done ? (
                      <span className="stat-card__icon stat-card__icon--success" style={{ width: 22, height: 22 }}>
                        <Icon name="check" size={13} />
                      </span>
                    ) : (
                      <span className="stat-card__icon stat-card__icon--warning" style={{ width: 22, height: 22 }}>
                        <Icon name="clock" size={13} />
                      </span>
                    )}
                    <span className="text-sm">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <Button onClick={() => navigate('/dashboard')} icon="arrowRight">
              Go to dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Approved screen
  if (!restarting && status === 'APPROVED') {
    return (
      <div className="stack" style={{ gap: 24, maxWidth: 560, margin: '0 auto' }}>
        <div className="surface" style={{ padding: 'var(--space-7)' }}>
          <div className="stack" style={{ gap: 20, alignItems: 'center', textAlign: 'center' }}>
            <div className="success-check">
              <Icon name="check" size={40} />
            </div>
            <div>
              <h2 style={{ fontSize: 21, fontWeight: 800, margin: 0 }}>Identity verified</h2>
              <p className="muted text-sm" style={{ marginTop: 8 }}>
                Your details have been verified. Full banking is now enabled, including transfers,
                cards, and bill payments.
              </p>
            </div>
            <div className="badge badge--success" style={{ padding: '6px 14px' }}>
              Tier: {(kyc?.tier ?? 'TIER_1').replace('_', ' ')} · {TIER_INFO[kyc?.tier ?? 'TIER_1']}
            </div>
            <Button onClick={() => navigate('/dashboard')} icon="arrowRight">
              Go to dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Rejected screen
  if (!restarting && status === 'REJECTED') {
    return (
      <div className="stack" style={{ gap: 24, maxWidth: 560, margin: '0 auto' }}>
        <div className="surface" style={{ padding: 'var(--space-7)' }}>
          <div className="stack" style={{ gap: 20, alignItems: 'center', textAlign: 'center' }}>
            <div className="success-check" style={{ background: 'var(--color-danger-soft)', borderColor: 'var(--color-danger-border)' }}>
              <Icon name="alert" size={40} />
            </div>
            <div>
              <h2 style={{ fontSize: 21, fontWeight: 800, margin: 0 }}>Verification rejected</h2>
              <p className="muted text-sm" style={{ marginTop: 8 }}>
                {kyc?.rejectionReason || 'Your identity details could not be verified.'}
                Update your information and resubmit.
              </p>
            </div>
            <Button onClick={() => setRestarting(true)} icon="refresh">
              Restart verification
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Onboarding stepper
  return (
    <div className="stack" style={{ gap: 20, maxWidth: 640, margin: '0 auto' }}>
      <PageHeader
        title="Verify your identity"
        subtitle="This only takes a few minutes and unlocks the full 5ive experience"
      />

      <div className="surface" style={{ padding: 'var(--space-5)' }}>
        <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
          {STEPS.map((s, i) => (
            <div key={s.key} className="row" style={{ gap: 6, alignItems: 'center' }}>
              <span
                className="stat-card__icon"
                style={{
                  width: 22, height: 22,
                  background: i === step ? 'var(--color-brand)' : i < step ? 'var(--color-success-soft)' : 'var(--color-surface-3)',
                  color: i === step ? 'var(--color-brand-contrast)' : i < step ? 'var(--color-success)' : 'var(--color-text-3)',
                }}
              >
                {i < step ? <Icon name="check" size={12} /> : <span style={{ fontSize: 11, fontWeight: 700 }}>{i + 1}</span>}
              </span>
              <span className="text-xs" style={{ fontWeight: i === step ? 700 : 500 }}>{s.label}</span>
              {i < STEPS.length - 1 && <span className="muted" style={{ margin: '0 4px' }}>·</span>}
            </div>
          ))}
        </div>
      </div>

      <div className="surface" style={{ padding: 'var(--space-6)' }}>
        {step === 0 && (
          <form className="stack" style={{ gap: 'var(--space-4)' }} onSubmit={e => { e.preventDefault(); next(); }}>
            <div className="stat-card__label">Your personal details</div>
            <div className="grid-2">
              <Field label="First name">
                <Input value={form.firstName} onChange={e => set('firstName')(e.target.value)} placeholder="e.g. Adaeze" required />
              </Field>
              <Field label="Last name">
                <Input value={form.lastName} onChange={e => set('lastName')(e.target.value)} placeholder="e.g. Okafor" required />
              </Field>
            </div>
            <div className="grid-2">
              <Field label="Date of birth">
                <Input type="date" value={form.dateOfBirth} onChange={e => set('dateOfBirth')(e.target.value)} required />
              </Field>
              <Field label="Gender">
                <Select value={form.gender} onChange={e => set('gender')(e.target.value)} required>
                  <option value="">Select</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                </Select>
              </Field>
            </div>
            <Field label="Phone number" hint="A valid phone number, digits only">
              <Input inputMode="numeric" value={form.phoneNumber} onChange={e => set('phoneNumber')(e.target.value)} placeholder="08012345678" required />
            </Field>
            <div className="row" style={{ justifyContent: 'flex-end' }}>
              <Button type="submit" icon="arrowRight" disabled={!personalValid}>Continue</Button>
            </div>
          </form>
        )}

        {step === 1 && (
          <form className="stack" style={{ gap: 'var(--space-4)' }} onSubmit={e => { e.preventDefault(); next(); }}>
            <div className="stat-card__label">BVN verification</div>
            <Field label="Bank Verification Number (BVN)" hint="An 11-digit number issued by the CBN">
              <Input inputMode="numeric" maxLength={11} value={form.bvn} onChange={e => set('bvn')(e.target.value)} placeholder="Enter your 11-digit BVN" required />
            </Field>
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <Button variant="secondary" onClick={() => setStep(0)}>Back</Button>
              <Button type="submit" icon="arrowRight" disabled={!bvnValid}>Continue</Button>
            </div>
          </form>
        )}

        {step === 2 && (
          <form className="stack" style={{ gap: 'var(--space-4)' }} onSubmit={e => { e.preventDefault(); next(); }}>
            <div className="stat-card__label">NIN verification</div>
            <div className="surface" style={{ background: 'var(--color-info-soft)', borderColor: 'var(--color-info-border)', padding: '10px 14px' }}>
              <div className="row" style={{ gap: 8 }}>
                <Icon name="info" size={15} />
                <span className="text-sm">Demo environment: this check is mocked. Any valid 11-digit NIN will pass.</span>
              </div>
            </div>
            <Field label="National Identification Number (NIN)" hint="An 11-digit number issued by NIMC">
              <Input inputMode="numeric" maxLength={11} value={form.nin} onChange={e => set('nin')(e.target.value)} placeholder="Enter your 11-digit NIN" required />
            </Field>
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <Button variant="secondary" onClick={() => setStep(1)}>Back</Button>
              <Button type="submit" icon="arrowRight" disabled={!ninValid}>Continue</Button>
            </div>
          </form>
        )}

        {step === 3 && (
          <div className="stack" style={{ gap: 'var(--space-4)' }}>
            <div className="stat-card__label">Identity match</div>
            <div className="surface" style={{ borderColor: 'var(--color-border)', padding: 'var(--space-5)' }}>
              <div className="row" style={{ gap: 12 }}>
                <span className="avatar" style={{ width: 44, height: 44, fontSize: 16 }}>{initials || '?'}</span>
                <div>
                  <div style={{ fontWeight: 700 }}>{form.firstName || 'First'} {form.lastName || 'Last'}</div>
                  <div className="muted text-xs">Date of birth: {form.dateOfBirth || '-'} · {form.gender || '-'}</div>
                </div>
              </div>
              <div style={{ borderTop: '1px solid var(--color-border)', margin: 'var(--space-4) 0' }} />
              <div className="row" style={{ gap: 10 }}>
                <span className="stat-card__icon stat-card__icon--success" style={{ width: 22, height: 22 }}>
                  <Icon name="check" size={13} />
                </span>
                <span className="text-sm">BVN record name matches your details</span>
              </div>
              <div className="row" style={{ gap: 10, marginTop: 6 }}>
                <span className="stat-card__icon stat-card__icon--success" style={{ width: 22, height: 22 }}>
                  <Icon name="check" size={13} />
                </span>
                <span className="text-sm">NIN record name matches your details</span>
              </div>
              <div className="row" style={{ gap: 10, marginTop: 6 }}>
                <span className="stat-card__icon stat-card__icon--success" style={{ width: 22, height: 22 }}>
                  <Icon name="check" size={13} />
                </span>
                <span className="text-sm">No conflicting records found</span>
              </div>
            </div>
            <div className="surface" style={{ background: 'var(--color-info-soft)', borderColor: 'var(--color-info-border)', padding: '10px 14px' }}>
              <div className="row" style={{ gap: 8 }}>
                <Icon name="info" size={15} />
                <span className="text-sm">Demo environment: identity matching is simulated and always succeeds.</span>
              </div>
            </div>
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <Button variant="secondary" onClick={() => setStep(2)}>Back</Button>
              <Button onClick={next} icon="arrowRight">Continue</Button>
            </div>
          </div>
        )}

        {step === 4 && (
          <form className="stack" style={{ gap: 'var(--space-4)' }} onSubmit={e => { e.preventDefault(); next(); }}>
            <div className="stat-card__label">Address & contact</div>
            <Field label="Residential address">
              <Input value={form.address} onChange={e => set('address')(e.target.value)} placeholder="e.g. 12 Allen Avenue" required />
            </Field>
            <div className="grid-2">
              <Field label="City">
                <Input value={form.city} onChange={e => set('city')(e.target.value)} placeholder="e.g. Ikeja" required />
              </Field>
              <Field label="State">
                <Input value={form.state} onChange={e => set('state')(e.target.value)} placeholder="e.g. Lagos" required />
              </Field>
            </div>
            <Field label="Country">
              <Input value={form.country} onChange={e => set('country')(e.target.value)} placeholder="Nigeria" required />
            </Field>
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <Button variant="secondary" onClick={() => setStep(3)}>Back</Button>
              <Button type="submit" icon="arrowRight" disabled={!addressValid}>Continue</Button>
            </div>
          </form>
        )}

        {step === 5 && (
          <div className="stack" style={{ gap: 'var(--space-4)' }}>
            <div className="stat-card__label">Review & submit</div>
            <div className="surface" style={{ borderColor: 'var(--color-border)', padding: 'var(--space-5)' }}>
              <div className="stack" style={{ gap: 10 }}>
                {[
                  { k: 'Full name', v: `${form.firstName} ${form.lastName}` },
                  { k: 'Date of birth', v: form.dateOfBirth },
                  { k: 'Gender', v: form.gender },
                  { k: 'Phone', v: form.phoneNumber },
                  { k: 'Address', v: `${form.address}, ${form.city}, ${form.state}, ${form.country}` },
                  { k: 'BVN', v: `****${form.bvn.slice(-4)}` },
                  { k: 'NIN', v: `****${form.nin.slice(-4)}` },
                ].map(item => (
                  <div key={item.k} className="row" style={{ justifyContent: 'space-between', gap: 12 }}>
                    <span className="text-sm muted">{item.k}</span>
                    <span className="text-sm font-semibold" style={{ textAlign: 'right' }}>{item.v}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="surface" style={{ background: 'var(--color-warning-soft)', borderColor: 'var(--color-warning-border)', padding: '10px 14px' }}>
              <div className="row" style={{ gap: 8 }}>
                <Icon name="info" size={15} />
                <span className="text-sm">By submitting, you confirm these details are yours. Verification is mocked in this demo and an admin must approve your account.</span>
              </div>
            </div>
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <Button variant="secondary" onClick={() => setStep(4)}>Back</Button>
              <Button onClick={handleSubmit} loading={busy} icon="shield">
                Submit for review
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}