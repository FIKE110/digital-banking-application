import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAccounts, createAccount } from '../api/accounts';

export default function Accounts() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState('SAVINGS');
  const [currency, setCurrency] = useState('NGN');
  const [balance, setBalance] = useState(0);
  const [error, setError] = useState('');

  const fetchAccounts = () => getAccounts().then(r => setAccounts(r.data || [])).catch(() => {});
  useEffect(() => { fetchAccounts(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await createAccount({ accountName: name, accountType: type, currency, openingBalance: balance, status: 'ACTIVE' });
      setShowForm(false);
      setName('');
      setBalance(0);
      fetchAccounts();
    } catch { setError('Failed to create account'); }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Accounts</h1>
        <button onClick={() => setShowForm(!showForm)} style={btnStyle}>
          {showForm ? 'Cancel' : '+ New Account'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} style={{ background: '#fff', padding: 20, borderRadius: 8, marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 400 }}>
          <input placeholder="Account Name" value={name} onChange={e => setName(e.target.value)} required style={inputStyle} />
          <select value={type} onChange={e => setType(e.target.value)} style={inputStyle}>
            <option value="SAVINGS">Savings</option>
            <option value="CHECKING">Checking</option>
          </select>
          <select value={currency} onChange={e => setCurrency(e.target.value)} style={inputStyle}>
            <option value="NGN">NGN</option>
            <option value="USD">USD</option>
          </select>
          <input type="number" step="0.01" placeholder="Opening Balance" value={balance} onChange={e => setBalance(Number(e.target.value))} required style={inputStyle} />
          {error && <p style={{ color: 'red', margin: 0 }}>{error}</p>}
          <button type="submit" style={btnStyle}>Create Account</button>
        </form>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {accounts.map((a: any) => (
          <Link key={a.id} to={`/accounts/${a.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{ background: '#fff', padding: 16, borderRadius: 8, boxShadow: '0 1px 2px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontWeight: 600, margin: 0 }}>{a.accountName}</p>
                <p style={{ color: '#64748b', fontSize: 13, margin: '2px 0 0' }}>{a.accountNumber} · {a.accountType}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontWeight: 700, fontSize: 18, margin: 0 }}>${a.balance?.toFixed(2)}</p>
                <p style={{ color: '#64748b', fontSize: 12, margin: 0 }}>{a.currency} · {a.status}</p>
              </div>
            </div>
          </Link>
        ))}
        {accounts.length === 0 && <p style={{ color: '#94a3b8' }}>No accounts yet. Click "+ New Account" to create one.</p>}
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: 15
};
const btnStyle: React.CSSProperties = {
  padding: '10px 16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6,
  fontSize: 14, fontWeight: 600, cursor: 'pointer'
};
