import { useEffect, useState } from 'react';
import { PageHeader } from '../ui/Card';
import Button from '../ui/Button';
import { Field, Input } from '../ui/FormControls';
import Dialog from '../ui/Dialog';
import Icon from '../ui/Icon';
import { useToast } from '../ui/Toast';
import { useAuth } from '../contexts/AuthContext';
import { getPinStatus, setPin as savePin, forgotPin, resetPin } from '../api/pin';

export default function SecurityPin() {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  const [pinSet, setPinSet] = useState<boolean | null>(null);
  const [pinSetAt, setPinSetAt] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  const [pin, setPin] = useState('');
  const [currentPin, setCurrentPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [saving, setSaving] = useState(false);

  const [forgotOpen, setForgotOpen] = useState(false);
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState(user?.email ?? '');
  const [otp, setOtp] = useState('');
  const [newPin, setNewPin] = useState('');
  const [forgotBusy, setForgotBusy] = useState(false);

  const loadStatus = () => {
    getPinStatus()
      .then(r => {
        setPinSet(r.data?.pinSet ?? false);
        setPinSetAt(r.data?.pinSetAt);
      })
      .catch(() => setPinSet(false))
      .finally(() => setLoading(false));
  };

  useEffect(loadStatus, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pin !== confirmPin) {
      toastError('PINs do not match');
      return;
    }
    setSaving(true);
    try {
      await savePin(pin, pinSet ? currentPin : undefined);
      success(pinSet ? 'Transaction PIN updated' : 'Transaction PIN created');
      setPin('');
      setCurrentPin('');
      setConfirmPin('');
      loadStatus();
    } catch (err: any) {
      toastError(err.response?.data?.message || 'Failed to save PIN');
    } finally {
      setSaving(false);
    }
  };

  const requestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotBusy(true);
    try {
      await forgotPin(email);
      setStep('otp');
    } catch (err: any) {
      toastError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setForgotBusy(false);
    }
  };

  const submitReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotBusy(true);
    try {
      await resetPin(email, otp, newPin);
      success('Transaction PIN reset successfully');
      setForgotOpen(false);
      setStep('email');
      setOtp('');
      setNewPin('');
      loadStatus();
    } catch (err: any) {
      toastError(err.response?.data?.message || 'Failed to reset PIN');
    } finally {
      setForgotBusy(false);
    }
  };

  return (
    <div className="stack" style={{ gap: 24 }}>
      <PageHeader
        title="Security PIN"
        subtitle="Protect your transfers and bill payments with a 4-digit PIN"
      />

      <div className="layout-split">
        <div className="surface" style={{ padding: 'var(--space-6)' }}>
          <div className="page-header" style={{ marginBottom: 20 }}>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>
                {pinSet ? 'Change PIN' : 'Create PIN'}
              </h2>
              <p className="muted text-sm" style={{ margin: '4px 0 0' }}>
                {pinSet
                  ? `PIN set on ${pinSetAt ? new Date(pinSetAt).toLocaleString() : 'your account'}`
                  : 'Set a 4-digit PIN to authorise transactions'}
              </p>
            </div>
            {pinSet !== null && (
              <span className={`badge ${pinSet ? 'badge--success' : 'badge--warning'}`}>
                {pinSet ? 'Active' : 'Not set'}
              </span>
            )}
          </div>

          {loading ? null : (
            <form onSubmit={save} className="stack" style={{ gap: 'var(--space-4)' }}>
              {pinSet && (
                <Field label="Current PIN">
                  <Input
                    type="password"
                    inputMode="numeric"
                    pattern="\d*"
                    maxLength={4}
                    value={currentPin}
                    onChange={e => setCurrentPin(e.target.value)}
                    placeholder="Enter current PIN"
                    autoComplete="off"
                  />
                </Field>
              )}
              <Field label={pinSet ? 'New PIN' : 'Choose a PIN'}>
                <Input
                  type="password"
                  inputMode="numeric"
                  pattern="\d*"
                  maxLength={4}
                  value={pin}
                  onChange={e => setPin(e.target.value)}
                  placeholder="4-digit PIN"
                  autoComplete="new-password"
                />
              </Field>
              <Field label="Confirm PIN">
                <Input
                  type="password"
                  inputMode="numeric"
                  pattern="\d*"
                  maxLength={4}
                  value={confirmPin}
                  onChange={e => setConfirmPin(e.target.value)}
                  placeholder="Re-enter PIN"
                  autoComplete="new-password"
                />
              </Field>
              <div className="row" style={{ gap: 12, alignItems: 'flex-end' }}>
                <Button type="submit" loading={saving}>
                  {pinSet ? 'Update PIN' : 'Set PIN'}
                </Button>
                {pinSet && (
                  <Button type="button" variant="ghost" onClick={() => setForgotOpen(true)}>
                    Forgot PIN?
                  </Button>
                )}
              </div>
            </form>
          )}
        </div>

        <div className="stack" style={{ gap: 20 }}>
          <div className="surface" style={{ padding: 'var(--space-6)' }}>
            <div className="row" style={{ gap: 12 }}>
              <span className="stat-card__icon stat-card__icon--warning">
                <Icon name="lock" size={17} />
              </span>
              <div>
                <div className="font-semibold" style={{ fontSize: 14 }}>How it works</div>
                <ul className="muted text-sm stack" style={{ gap: 6, margin: '10px 0 0', paddingLeft: 18 }}>
                  <li>You'll be asked for your PIN when sending money or paying bills</li>
                  <li>After 5 incorrect attempts your PIN is locked and must be reset</li>
                  <li>Reset your PIN with the OTP sent to your email</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={forgotOpen} onClose={() => setForgotOpen(false)} title="Forgot your PIN?">
        {step === 'email' ? (
          <form onSubmit={requestOtp} className="stack" style={{ gap: 'var(--space-4)' }}>
            <Field label="Email">
              <Input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Enter your account email"
                required
                autoComplete="email"
              />
            </Field>
            <Button type="submit" block loading={forgotBusy}>Send reset OTP</Button>
          </form>
        ) : (
          <form onSubmit={submitReset} className="stack" style={{ gap: 'var(--space-4)' }}>
            <Field label="OTP">
              <Input
                value={otp}
                onChange={e => setOtp(e.target.value)}
                placeholder="Enter the 6-digit OTP"
                inputMode="numeric"
                maxLength={6}
                required
              />
            </Field>
            <Field label="New PIN">
              <Input
                type="password"
                inputMode="numeric"
                pattern="\d*"
                maxLength={4}
                value={newPin}
                onChange={e => setNewPin(e.target.value)}
                placeholder="4-digit PIN"
                required
              />
            </Field>
            <Button type="submit" block loading={forgotBusy}>Reset PIN</Button>
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              onClick={() => setStep('email')}
            >
              ← Back to email
            </button>
          </form>
        )}
      </Dialog>
    </div>
  );
}