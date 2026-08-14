import { useEffect, useState } from 'react';
import { PageHeader } from '../ui/Card';
import Button from '../ui/Button';
import { Field, Input } from '../ui/FormControls';
import Icon from '../ui/Icon';
import { useToast } from '../ui/Toast';
import { useTheme } from '../ui/Theme';
import { useAuth } from '../contexts/AuthContext';
import { BANK_NAME } from '../config';
import { getProfile, updateProfile, type ProfileData } from '../api/profile';

export default function Settings() {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const { success, error: toastError } = useToast();

  const [form, setForm] = useState<ProfileData>({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
  });
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getProfile()
      .then(r => {
        setForm(r.data ?? { username: '', email: '' });
      })
      .catch(() => {
        setForm({
          username: user?.username ?? '',
          email: user?.email ?? '',
        });
      })
      .finally(() => setLoaded(true));
  }, [user]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({
        firstName: form.firstName,
        lastName: form.lastName,
        phoneNumber: form.phoneNumber,
      });
      success('Profile updated');
    } catch (err: any) {
      toastError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="stack" style={{ gap: 24 }}>
      <PageHeader title="Settings" subtitle="Manage your profile, preferences and security" />

      <div className="layout-split">
        <div className="stack" style={{ gap: 20 }}>
          <div className="surface" style={{ padding: 'var(--space-6)' }}>
            <div className="page-header" style={{ marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>Profile</h2>
                <p className="muted text-sm" style={{ margin: '4px 0 0' }}>Your personal information</p>
              </div>
            </div>
            {!loaded ? null : (
              <form onSubmit={save} className="grid-2" style={{ gap: 'var(--space-4)' }}>
                <Field label="First name">
                  <Input value={form.firstName ?? ''} onChange={e => setForm({ ...form, firstName: e.target.value })} />
                </Field>
                <Field label="Last name">
                  <Input value={form.lastName ?? ''} onChange={e => setForm({ ...form, lastName: e.target.value })} />
                </Field>
                <Field label="Phone number">
                  <Input value={form.phoneNumber ?? ''} onChange={e => setForm({ ...form, phoneNumber: e.target.value })} />
                </Field>
                <div className="row" style={{ alignItems: 'flex-end' }}>
                  <Button type="submit" loading={saving}>Save changes</Button>
                </div>
              </form>
            )}
          </div>

          <div className="surface" style={{ padding: 'var(--space-6)' }}>
            <div className="page-header" style={{ marginBottom: 16 }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>Security</h2>
                <p className="muted text-sm" style={{ margin: '4px 0 0' }}>Keep your account safe</p>
              </div>
            </div>
            <div className="row row--between" style={{ padding: 'var(--space-3) 0', borderTop: '1px solid var(--color-border)' }}>
              <div className="row" style={{ gap: 12 }}>
                <span className="stat-card__icon stat-card__icon--warning"><Icon name="lock" size={17} /></span>
                <div>
                  <div className="font-semibold" style={{ fontSize: 14 }}>Change password</div>
                  <div className="muted text-xs">Reset your password using the recovery link</div>
                </div>
              </div>
              <a href="/forgot-password" className="btn btn--secondary btn--sm">Reset password</a>
            </div>
            <div className="row row--between" style={{ padding: 'var(--space-3) 0', borderTop: '1px solid var(--color-border)' }}>
              <div className="row" style={{ gap: 12 }}>
                <span className="stat-card__icon stat-card__icon--warning"><Icon name="lock" size={17} /></span>
                <div>
                  <div className="font-semibold" style={{ fontSize: 14 }}>Security PIN</div>
                  <div className="muted text-xs">4-digit PIN required for transfers and bill payments</div>
                </div>
              </div>
              <a href="/pin" className="btn btn--secondary btn--sm">Manage PIN</a>
            </div>
            <div className="row row--between" style={{ padding: 'var(--space-3) 0', borderTop: '1px solid var(--color-border)' }}>
              <div className="row" style={{ gap: 12 }}>
                <span className="stat-card__icon stat-card__icon--danger"><Icon name="logout" size={17} /></span>
                <div>
                  <div className="font-semibold" style={{ fontSize: 14 }}>Sign out</div>
                  <div className="muted text-xs">End your session on this device</div>
                </div>
              </div>
              <Button variant="danger-ghost" size="sm" onClick={logout}>Sign out</Button>
            </div>
          </div>
        </div>

        <div className="stack" style={{ gap: 20 }}>
          <div className="surface" style={{ padding: 'var(--space-6)' }}>
            <div className="row" style={{ gap: 14 }}>
              <span className="avatar" style={{ width: 46, height: 46, fontSize: 17 }}>
                {(user?.username?.[0] ?? 'A').toUpperCase()}
              </span>
              <div style={{ minWidth: 0 }}>
                <div className="font-semibold" style={{ fontSize: 16, fontWeight: 800 }}>{form.username || user?.username}</div>
                <div className="muted text-sm" style={{ marginTop: 2 }}>{form.email || user?.email}</div>
              </div>
            </div>
            <div className="stack" style={{ gap: 10, marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--color-border)' }}>
              <div className="row row--between">
                <span className="muted text-sm">Username</span>
                <span className="mono text-sm">{form.username || '—'}</span>
              </div>
              <div className="row row--between">
                <span className="muted text-sm">Email</span>
                <span className="text-sm">{form.email || '—'}</span>
              </div>
            </div>
          </div>

          <div className="surface" style={{ padding: 'var(--space-6)' }}>
            <div className="page-header" style={{ marginBottom: 16 }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>Appearance</h2>
                <p className="muted text-sm" style={{ margin: '4px 0 0' }}>Choose how {BANK_NAME} looks</p>
              </div>
            </div>
            <div className="row row--between" style={{ padding: 'var(--space-3) 0' }}>
              <div className="row" style={{ gap: 12 }}>
                <span className="stat-card__icon"><Icon name={theme === 'light' ? 'sun' : 'moon'} size={17} /></span>
                <div>
                  <div className="font-semibold" style={{ fontSize: 14 }}>{theme === 'light' ? 'Light mode' : 'Dark mode'}</div>
                  <div className="muted text-xs">Switch between light and dark themes</div>
                </div>
              </div>
              <Button variant={theme === 'light' ? 'primary' : 'secondary'} size="sm" onClick={toggle}>
                {theme === 'light' ? 'Use dark' : 'Use light'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
