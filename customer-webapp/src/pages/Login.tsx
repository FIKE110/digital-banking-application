import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AuthLayout from '../ui/AuthLayout';
import Button from '../ui/Button';
import { Field, Input } from '../ui/FormControls';
import Icon from '../ui/Icon';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const userData = await login(username, password);
      if (userData?.permissions?.includes('manage-admin')) {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      if (err.response?.data?.errorCode === 'EMAIL_NOT_VERIFIED') {
        navigate('/verify-email', { state: { email: username } });
        return;
      }
      setError(err.response?.data?.message || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div style={{ marginBottom: 28 }}>
        <div className="brand__logo" style={{ width: 52, height: 52, fontSize: 22, marginBottom: 20 }}>5</div>
        <h1 style={{ fontSize: 28, fontWeight: 800, fontFamily: "var(--font-display)", letterSpacing: "0.01em", margin: '0 0 6px' }}>
          Welcome back
        </h1>
        <p className="muted text-sm" style={{ margin: 0 }}>
          Sign in to your banking account to continue
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

      <form onSubmit={handleSubmit} className="stack stack--4">
        <Field label="Username">
          <Input
            icon="users"
            placeholder="Enter your username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            autoComplete="username"
            autoFocus
          />
        </Field>
        <Field label="Password">
          <Input
            type={showPassword ? 'text' : 'password'}
            icon="lock"
            placeholder="Enter your password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            action={
              <button
                type="button"
                onClick={() => setShowPassword(s => !s)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                tabIndex={-1}
              >
                <Icon name={showPassword ? 'eyeOff' : 'eye'} size={18} />
              </button>
            }
          />
        </Field>
        <div style={{ textAlign: 'right', marginTop: -4 }}>
          <Link to="/forgot-password" className="text-sm font-semibold" style={{ color: 'var(--color-brand)', textDecoration: 'none' }}>
            Forgot password?
          </Link>
        </div>
        <Button type="submit" block size="lg" loading={loading} icon="lock">
          Sign in
        </Button>
      </form>

      <p className="muted text-sm" style={{ marginTop: 28, textAlign: 'center' }}>
        Don't have an account?{' '}
        <Link to="/register" className="font-semibold" style={{ color: 'var(--color-brand)', textDecoration: 'none' }}>
          Create one
        </Link>
      </p>
      <p className="muted text-xs" style={{ marginTop: 12, textAlign: 'center' }}>
        <Link to="/admin/login" style={{ color: 'var(--color-muted)', textDecoration: 'none' }}>
          Admin login
        </Link>
      </p>
    </AuthLayout>
  );
}
