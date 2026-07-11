import { useEffect, useState } from 'react';
import { getProfile, updateProfile, changePassword, changeEmail } from '../api/profile';

export default function Profile() {
  const [profile, setProfile] = useState<any>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [saving, setSaving] = useState(false);

  const [pwCurrent, setPwCurrent] = useState('');
  const [pwNew, setPwNew] = useState('');
  const [pwMsg, setPwMsg] = useState('');

  const [newEmail, setNewEmail] = useState('');
  const [emailPw, setEmailPw] = useState('');
  const [emailMsg, setEmailMsg] = useState('');

  useEffect(() => {
    getProfile().then(r => {
      const p = r.data;
      setProfile(p);
      setFirstName(p.firstName || '');
      setLastName(p.lastName || '');
      setPhoneNumber(p.phoneNumber || '');
    }).catch(() => {});
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await updateProfile({ firstName, lastName, phoneNumber });
      setProfile(res.data);
      setSaving(false);
    } catch { setSaving(false); }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwMsg('');
    try {
      await changePassword(pwCurrent, pwNew);
      setPwMsg('Password changed successfully');
      setPwCurrent('');
      setPwNew('');
    } catch (err: any) { setPwMsg(err.response?.data?.message || 'Failed'); }
  };

  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailMsg('');
    try {
      await changeEmail(newEmail, emailPw);
      setEmailMsg('Email changed successfully');
      setNewEmail('');
      setEmailPw('');
    } catch (err: any) { setEmailMsg(err.response?.data?.message || 'Failed'); }
  };

  if (!profile) return <p>Loading...</p>;

  const cardStyle: React.CSSProperties = { background: '#fff', padding: 20, borderRadius: 8, marginBottom: 24 };
  const inputStyle: React.CSSProperties = { padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: 15, width: '100%', boxSizing: 'border-box' };

  return (
    <div style={{ maxWidth: 600 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Profile</h1>

      <div style={cardStyle}>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Personal Information</h2>
        <p style={{ color: '#64748b', marginBottom: 16 }}>{profile.username} · {profile.email}</p>
        <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input placeholder="First Name" value={firstName} onChange={e => setFirstName(e.target.value)} style={inputStyle} />
          <input placeholder="Last Name" value={lastName} onChange={e => setLastName(e.target.value)} style={inputStyle} />
          <input placeholder="Phone Number" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} style={inputStyle} />
          <button type="submit" disabled={saving} style={btnStyle}>{saving ? 'Saving...' : 'Update Profile'}</button>
        </form>
      </div>

      <div style={cardStyle}>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Change Password</h2>
        <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input type="password" placeholder="Current password" value={pwCurrent} onChange={e => setPwCurrent(e.target.value)} required style={inputStyle} />
          <input type="password" placeholder="New password" value={pwNew} onChange={e => setPwNew(e.target.value)} required style={inputStyle} />
          {pwMsg && <p style={{ color: pwMsg.includes('success') ? '#16a34a' : 'red', margin: 0 }}>{pwMsg}</p>}
          <button type="submit" style={btnStyle}>Change Password</button>
        </form>
      </div>

      <div style={cardStyle}>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Change Email</h2>
        <form onSubmit={handleChangeEmail} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input type="email" placeholder="New email" value={newEmail} onChange={e => setNewEmail(e.target.value)} required style={inputStyle} />
          <input type="password" placeholder="Current password" value={emailPw} onChange={e => setEmailPw(e.target.value)} required style={inputStyle} />
          {emailMsg && <p style={{ color: emailMsg.includes('success') ? '#16a34a' : 'red', margin: 0 }}>{emailMsg}</p>}
          <button type="submit" style={btnStyle}>Change Email</button>
        </form>
      </div>
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  padding: '10px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6,
  fontSize: 14, fontWeight: 600, cursor: 'pointer'
};
