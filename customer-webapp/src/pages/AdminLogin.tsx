import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AuthLayout from '../ui/AuthLayout';
import Button from '../ui/Button';
import { Field, Input } from '../ui/FormControls';
import Icon from '../ui/Icon';

export default function AdminLogin() {
  const { login, user, token } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token && user?.permissions?.includes('manage-admin')) {
      navigate('/admin', { replace: true });
    }
  }, [token, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const userData = await login(username, password);
      if (userData?.permissions?.includes('manage-admin')) {
        navigate('/admin');
      } else {
        setError('You do not have admin privileges. Please use the customer login.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div style={{ marginBottom: 28 }}>
        <div className="brand__logo" style={{ width: 52, height: 52, fontSize: 22, marginBottom: 20, background: '#000000' }}>
          <span style={{ color: '#00c853' }}>5</span>
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 800, fontFamily: "var(--font-display)", letterSpacing: "0.01em", margin: '0 0 6px' }}>
          Admin Access
        </h1>
        <p className="muted text-sm" style={{ margin: 0 }}>
          Sign in with your administrator credentials
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
        <Field label="Admin Username">
          <Input
            icon="shield"
            placeholder="Enter admin username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            autoComplete="username"
            autoFocus
          />
        </Field>
        <Field label="Password">
          <Input
            type="password"
            icon="lock"
            placeholder="Enter admin password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </Field>
        <Button type="submit" block size="lg" loading={loading} icon="lock">
          Sign in as Admin
        </Button>
      </form>

      <p className="muted text-sm" style={{ marginTop: 28, textAlign: 'center' }}>
        Not an admin?{' '}
        <Link to="/login" className="font-semibold" style={{ color: 'var(--color-brand)', textDecoration: 'none' }}>
          Customer login
        </Link>
      </p>
    </AuthLayout>
  );
}
