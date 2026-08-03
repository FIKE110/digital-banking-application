import { useEffect, useState } from 'react';
import { getProfile, updateProfile, changePassword, changeEmail } from '../api/profile';
import { useAuth } from '../contexts/AuthContext';
import { PageHeader } from '../ui/Card';
import Button from '../ui/Button';
import { Field, Input } from '../ui/FormControls';
import Icon from '../ui/Icon';
import { SkeletonRows } from '../ui/Skeleton';
import { ErrorState } from '../ui/States';
import { useToast } from '../ui/Toast';
import type { Profile as ProfileType } from '../types';

export default function Profile() {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [loadError, setLoadError] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [saving, setSaving] = useState(false);

  const [pwCurrent, setPwCurrent] = useState('');
  const [pwNew, setPwNew] = useState('');
  const [pwBusy, setPwBusy] = useState(false);

  const [newEmail, setNewEmail] = useState('');
  const [emailPw, setEmailPw] = useState('');
  const [emailBusy, setEmailBusy] = useState(false);

  useEffect(() => {
    getProfile().then(r => {
      const p = r.data;
      setProfile(p);
      setFirstName(p.firstName ?? '');
      setLastName(p.lastName ?? '');
      setPhoneNumber(p.phoneNumber ?? '');
    }).catch(err => setLoadError(err.response?.data?.message || 'Failed to load profile'));
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await updateProfile({ firstName, lastName, phoneNumber });
      setProfile(res.data);
      success('Profile updated');
    } catch (err: any) {
      toastError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwBusy(true);
    try {
      await changePassword(pwCurrent, pwNew);
      success('Password changed');
      setPwCurrent('');
      setPwNew('');
    } catch (err: any) {
      toastError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setPwBusy(false);
    }
  };

  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailBusy(true);
    try {
      await changeEmail(newEmail, emailPw);
      success('Email changed');
      setNewEmail('');
      setEmailPw('');
    } catch (err: any) {
      toastError(err.response?.data?.message || 'Failed to change email');
    } finally {
      setEmailBusy(false);
    }
  };

  if (loadError) return <ErrorState title="Couldn't load profile" body={loadError} />;
  if (!profile) return <SkeletonRows rows={5} />;

  const initials = (profile.firstName ?? user?.username ?? 'U').charAt(0).toUpperCase();

  return (
    <div className="stack" style={{ gap: 24, maxWidth: 720 }}>
      <PageHeader title="Profile" subtitle="Manage your personal information and security" />

      <div className="surface row" style={{ padding: 'var(--space-5)', gap: 16 }}>
        <div className="avatar" style={{ width: 56, height: 56, fontSize: 20 }}>{initials}</div>
        <div className="flex-1">
          <div className="font-semibold" style={{ fontSize: 18 }}>{profile.username}</div>
          <div className="muted text-sm">{profile.email}</div>
          <div className="row" style={{ gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
            {(user?.roleNames ?? []).map(r => (
              <span key={r} className="badge badge--info">{r}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="surface" style={{ padding: 'var(--space-5)' }}>
        <div className="page-header" style={{ marginBottom: 16 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700 }}>Personal information</h2>
        </div>
        <form onSubmit={handleUpdateProfile} className="grid-2" style={{ gap: 'var(--space-4)' }}>
          <Field label="First name">
            <Input icon="users" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="First name" />
          </Field>
          <Field label="Last name">
            <Input value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Last name" />
          </Field>
          <Field label="Phone number">
            <Input icon="phone" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} placeholder="Phone number" />
          </Field>
          <div className="row" style={{ alignItems: 'flex-end' }}>
            <Button type="submit" loading={saving}>Save changes</Button>
          </div>
        </form>
      </div>

      <div className="surface" style={{ padding: 'var(--space-5)' }}>
        <div className="page-header" style={{ marginBottom: 16 }}>
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 700 }}>Security</h2>
            <p className="muted text-sm">Password and email</p>
          </div>
        </div>
        <div className="stack" style={{ gap: 20 }}>
          <form onSubmit={handleChangePassword} className="stack stack--4">
            <div className="grid-2" style={{ gap: 'var(--space-3)' }}>
              <Field label="Current password">
                <Input type="password" icon="lock" value={pwCurrent} onChange={e => setPwCurrent(e.target.value)} required autoComplete="current-password" />
              </Field>
              <Field label="New password" hint="At least 6 characters">
                <Input type="password" icon="shield" value={pwNew} onChange={e => setPwNew(e.target.value)} required minLength={6} autoComplete="new-password" />
              </Field>
            </div>
            <div className="row">
              <Button type="submit" variant="secondary" loading={pwBusy} icon="lock">Change password</Button>
            </div>
          </form>

          <form onSubmit={handleChangeEmail} className="stack stack--4" style={{ borderTop: '1px solid var(--color-border)', paddingTop: 20 }}>
            <div className="grid-2" style={{ gap: 'var(--space-3)' }}>
              <Field label="New email">
                <Input type="email" icon="globe" value={newEmail} onChange={e => setNewEmail(e.target.value)} required autoComplete="email" />
              </Field>
              <Field label="Current password">
                <Input type="password" icon="lock" value={emailPw} onChange={e => setEmailPw(e.target.value)} required autoComplete="current-password" />
              </Field>
            </div>
            <div className="row">
              <Button type="submit" variant="secondary" loading={emailBusy} icon="send">Change email</Button>
            </div>
          </form>
        </div>
      </div>

      <div className="surface row" style={{ padding: 'var(--space-4)', gap: 12 }}>
        <span className="stat-card__icon stat-card__icon--info"><Icon name="info" size={17} /></span>
        <p className="muted text-sm" style={{ margin: 0 }}>
          Account created {new Date(user?.createdAt ?? Date.now()).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>
    </div>
  );
}
