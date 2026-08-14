import { useState } from 'react';
import { Link } from 'react-router-dom';
import { resetPassword } from '../api/auth';
import AuthLayout from '../ui/AuthLayout';
import Button from '../ui/Button';
import { Field, Input } from '../ui/FormControls';
import Icon from '../ui/Icon';

export default function ResetPassword() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      await resetPassword(email, otp, newPassword);
      setMessage('Password reset successfully. You can now sign in with your new password.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Reset failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div style={{ marginBottom: 28 }}>
        <div className="brand__logo" style={{ width: 52, height: 52, fontSize: 22, marginBottom: 20 }}>5</div>
        <h1 style={{ fontSize: 28, fontWeight: 800, fontFamily: "var(--font-display)", letterSpacing: "0.01em", margin: '0 0 6px' }}>
          Reset password
        </h1>
        <p className="muted text-sm" style={{ margin: 0 }}>
          Enter the OTP you received along with your new password
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

      {message && (
        <div className="surface" style={{ background: 'var(--color-success-soft)', borderColor: 'var(--color-success-border)', color: 'var(--color-success)', padding: '12px 16px', marginBottom: 20 }} role="status">
          <div className="row" style={{ gap: 8 }}>
            <Icon name="checkCircle" size={16} />
            <span className="text-sm font-semibold">{message}</span>
          </div>
          <Button style={{ marginTop: 12 }} block onClick={() => { window.location.href = '/login'; }}>
            Go to sign in
          </Button>
        </div>
      )}

      {!message && (
        <form onSubmit={handleSubmit} className="stack stack--4">
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
          <Field label="OTP" hint="6-digit code sent to your email">
            <Input
              inputMode="numeric"
              icon="shield"
              placeholder="000000"
              value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
              required
              maxLength={6}
            />
          </Field>
          <Field label="New password" hint="At least 6 characters">
            <Input
              type="password"
              icon="lock"
              placeholder="Create a new password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
            />
          </Field>
          <Button type="submit" block size="lg" loading={loading}>
            Reset password
          </Button>
        </form>
      )}

      <p className="muted text-sm" style={{ marginTop: 28, textAlign: 'center' }}>
        <Link to="/login" className="font-semibold" style={{ color: 'var(--color-brand)', textDecoration: 'none' }}>
          ← Back to sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
