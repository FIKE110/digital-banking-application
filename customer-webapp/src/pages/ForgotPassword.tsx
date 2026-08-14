import { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../api/auth';
import AuthLayout from '../ui/AuthLayout';
import Button from '../ui/Button';
import { Field, Input } from '../ui/FormControls';
import Icon from '../ui/Icon';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      await forgotPassword(email);
      setMessage('If an account exists for that email, an OTP has been sent to reset your password.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Request failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div style={{ marginBottom: 28 }}>
        <div className="brand__logo" style={{ width: 52, height: 52, fontSize: 22, marginBottom: 20 }}>5</div>
        <h1 style={{ fontSize: 28, fontWeight: 800, fontFamily: "var(--font-display)", letterSpacing: "0.01em", margin: '0 0 6px' }}>
          Forgot password
        </h1>
        <p className="muted text-sm" style={{ margin: 0 }}>
          Enter your email and we'll send you a reset OTP
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
        </div>
      )}

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
        <Button type="submit" block size="lg" loading={loading}>
          Send reset OTP
        </Button>
      </form>

      <p className="muted text-sm" style={{ marginTop: 28, textAlign: 'center' }}>
        <Link to="/login" className="font-semibold" style={{ color: 'var(--color-brand)', textDecoration: 'none' }}>
          ← Back to sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
