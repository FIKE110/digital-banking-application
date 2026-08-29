import { useEffect, useRef, useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../ui/AuthLayout';
import Button from '../ui/Button';
import { Field, Input } from '../ui/FormControls';
import Icon from '../ui/Icon';
import { useToast } from '../ui/Toast';
import { verifyEmail, resendVerification } from '../api/auth';

const RESEND_COOLDOWN = 45;

function maskEmail(email: string): string {
  const [name, domain] = email.split('@');
  if (!name || !domain) return email;
  const visible = name.slice(0, Math.min(2, name.length));
  return `${visible}${'*'.repeat(Math.max(name.length - visible.length, 1))}@${domain}`;
}

export default function VerifyEmail() {
  const location = useLocation();
  const navigate = useNavigate();
  const { success } = useToast();
  const initialEmail = (location.state as { email?: string } | null)?.email ?? '';

  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [verified, setVerified] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startCooldown = () => {
    setCooldown(RESEND_COOLDOWN);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCooldown(c => {
        if (c <= 1 && timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        return Math.max(0, c - 1);
      });
    }, 1000);
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !/^\d{6}$/.test(otp)) {
      setError('Enter your email and the 6-digit code we sent you');
      return;
    }
    setVerifying(true);
    try {
      await verifyEmail(email.trim(), otp);
      setVerified(true);
      success('Email verified');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Verification failed. Please try again.');
      setOtp('');
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    setError('');
    if (!email.trim()) {
      setError('Enter your email first');
      return;
    }
    setResending(true);
    try {
      await resendVerification(email.trim());
      success(`We sent a new code to ${maskEmail(email.trim())}`);
      startCooldown();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not resend code. Please try again.');
    } finally {
      setResending(false);
    }
  };

  if (verified) {
    return (
      <AuthLayout>
        <div className="text-center" style={{ marginBottom: 28 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: 'var(--color-success)',
              color: '#000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
            }}
          >
            <Icon name="check" size={30} />
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, fontFamily: 'var(--font-display)', margin: '0 0 6px' }}>
            Email verified
          </h1>
          <p className="muted text-sm" style={{ margin: 0 }}>
            Your account is ready. Sign in to start banking.
          </p>
        </div>
        <Button block size="lg" icon="lock" onClick={() => navigate('/login')}>
          Go to login
        </Button>
        <p className="muted text-xs" style={{ marginTop: 16, textAlign: 'center' }}>
          You'll need your username and password to sign in.
        </p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div style={{ marginBottom: 28 }}>
        <div className="brand__logo" style={{ width: 52, height: 52, fontSize: 22, marginBottom: 20 }}>5</div>
        <h1 style={{ fontSize: 28, fontWeight: 800, fontFamily: 'var(--font-display)', letterSpacing: '0.01em', margin: '0 0 6px' }}>
          Verify your email
        </h1>
        <p className="muted text-sm" style={{ margin: 0 }}>
          {initialEmail ? (
            <>We sent a 6-digit code to <span className="font-semibold">{maskEmail(initialEmail)}</span>. Enter it below to activate your account.</>
          ) : (
            'Enter the email you registered with and the 6-digit code we sent you.'
          )}
        </p>
      </div>

      {error && (
        <div className="surface" style={{ background: 'var(--color-danger-soft)', borderColor: 'var(--color-danger-border)', color: 'var(--color-danger)', padding: '12px 16px', marginBottom: 20 }} role="alert">
          <div className="row" style={{ gap: 8 }}>
            <Icon name="alert" size={16} />
            <span className="text-sm font-semibold">{error}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleVerify} className="stack stack--4">
        {!initialEmail && (
          <Field label="Email">
            <Input
              type="email"
              icon="globe"
              placeholder="Enter your email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </Field>
        )}
        <Field label="Verification code" hint="Codes expire after 10 minutes">
          <Input
            icon="shield"
            placeholder="••••••"
            value={otp}
            onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            required
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            className="input--mono"
            style={{ letterSpacing: 8, textAlign: 'center', fontSize: 20 }}
          />
        </Field>
        <Button type="submit" block size="lg" loading={verifying}>
          Verify email
        </Button>
      </form>

      <p className="muted text-sm" style={{ marginTop: 24, textAlign: 'center' }}>
        Didn't get the code?{' '}
        <button
          type="button"
          onClick={handleResend}
          disabled={resending || cooldown > 0 || !email.trim()}
          className="font-semibold"
          style={{
            color: cooldown > 0 || !email.trim() ? 'var(--color-text-3)' : 'var(--color-brand)',
            background: 'none',
            border: 'none',
            cursor: resending || cooldown > 0 || !email.trim() ? 'not-allowed' : 'pointer',
            padding: 0,
            fontFamily: 'inherit',
            fontSize: 'inherit',
          }}
        >
          {cooldown > 0 ? `Resend in ${cooldown}s` : resending ? 'Sending…' : 'Resend code'}
        </button>
      </p>

      <p className="muted text-sm" style={{ marginTop: 12, textAlign: 'center' }}>
        <Link to="/login" className="font-semibold" style={{ color: 'var(--color-brand)', textDecoration: 'none' }}>
          Back to sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
