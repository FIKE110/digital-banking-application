import { useState, type CSSProperties } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AuthLayout from '../ui/AuthLayout';
import Button from '../ui/Button';
import { Field, Input } from '../ui/FormControls';
import Icon from '../ui/Icon';
import { useToast } from '../ui/Toast';

const STRENGTH_META = [
  { label: 'Very weak', color: 'var(--color-danger)' },
  { label: 'Weak', color: 'var(--color-danger)' },
  { label: 'Fair', color: '#d99e00' },
  { label: 'Good', color: 'var(--color-brand)' },
  { label: 'Strong', color: 'var(--color-brand)' },
];

function getPasswordStrength(pw: string): number {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 8) score += 1;
  if (pw.length >= 12) score += 1;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score += 1;
  if (/\d/.test(pw)) score += 1;
  if (/[^A-Za-z0-9]/.test(pw)) score += 1;
  return Math.min(score, 4);
}

function PasswordStrength({ password }: { password: string }) {
  const score = getPasswordStrength(password);
  if (!password) return null;
  const meta = STRENGTH_META[score];
  return (
    <div className="pw-strength" style={{ '--strength-color': meta.color } as CSSProperties}>
      <div className="pw-strength__bars" aria-hidden="true">
        {[0, 1, 2, 3].map(i => (
          <span key={i} className={`pw-strength__bar${i < score ? ' pw-strength__bar--on' : ''}`} />
        ))}
      </div>
      <div className="pw-strength__label">{meta.label}</div>
    </div>
  );
}

export default function Register() {
  const { register, login } = useAuth();
  const { success } = useToast();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    let ok = true;
    if (username.trim().length < 5) {
      setUsernameError('Username must be at least 5 characters');
      ok = false;
    } else {
      setUsernameError('');
    }
    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      ok = false;
    } else if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
      setPasswordError('Password must include both letters and numbers');
      ok = false;
    } else {
      setPasswordError('');
    }
    return ok;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!validate()) return;
    setLoading(true);
    try {
      await register(username, email, password);
      await login(username, password);
      success('Login successful. Redirecting to your dashboard…');
      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Unable to complete sign up. Please try again.');
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
        <Field label="Username" error={usernameError}>
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
        <Field label="Password" hint="At least 6 characters, including letters and numbers" error={passwordError}>
          <Input
            type={showPassword ? 'text' : 'password'}
            icon="lock"
            placeholder="Create a strong password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            minLength={6}
            autoComplete="new-password"
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
          <PasswordStrength password={password} />
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
