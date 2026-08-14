import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AuthLayout from '../ui/AuthLayout';
import Button from '../ui/Button';
import { Field, Input } from '../ui/FormControls';
import Icon from '../ui/Icon';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(username, email, password);
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div style={{ marginBottom: 28 }}>
        <div className="brand__logo" style={{ width: 52, height: 52, fontSize: 22, marginBottom: 20 }}>5</div>
        <h1 style={{ fontSize: 28, fontWeight: 800, fontFamily: "var(--font-display)", letterSpacing: "0.01em", margin: '0 0 6px' }}>
          Create your account
        </h1>
        <p className="muted text-sm" style={{ margin: 0 }}>
          Start your digital banking journey in under a minute
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
            placeholder="Choose a username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            autoComplete="username"
          />
        </Field>
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
        <Field label="Password" hint="At least 6 characters">
          <Input
            type="password"
            icon="lock"
            placeholder="Create a strong password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            minLength={6}
            autoComplete="new-password"
          />
        </Field>
        <Button type="submit" block size="lg" loading={loading}>
          Create account
        </Button>
      </form>

      <p className="muted text-sm" style={{ marginTop: 28, textAlign: 'center' }}>
        Already have an account?{' '}
        <Link to="/login" className="font-semibold" style={{ color: 'var(--color-brand)', textDecoration: 'none' }}>
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
