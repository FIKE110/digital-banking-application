import { useEffect, useState } from 'react';
import { getAccounts } from '../api/accounts';
import { initiateTransfer, getTransfers, reverseTransfer } from '../api/transfers';

export default function Transfers() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [transfers, setTransfers] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [source, setSource] = useState('');
  const [dest, setDest] = useState('');
  const [amount, setAmount] = useState(0);
  const [desc, setDesc] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    getAccounts().then(r => setAccounts(r.data || [])).catch(() => {});
    getTransfers().then(r => setTransfers(r.data || [])).catch(() => {});
  }, []);

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await initiateTransfer({ sourceAccountNumber: source, destinationAccountNumber: dest, amount, description: desc });
      setShowForm(false);
      setDest('');
      setAmount(0);
      setDesc('');
      const tr = await getTransfers();
      setTransfers(tr.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Transfer failed');
    }
  };

  const handleReverse = async (id: string) => {
    if (!confirm('Reverse this transfer?')) return;
    try {
      await reverseTransfer(id);
      const tr = await getTransfers();
      setTransfers(tr.data || []);
    } catch { alert('Reversal failed'); }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Transfers</h1>
        <button onClick={() => setShowForm(!showForm)} style={btnStyle}>
          {showForm ? 'Cancel' : '+ New Transfer'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleTransfer} style={{ background: '#fff', padding: 20, borderRadius: 8, marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 400 }}>
          <select value={source} onChange={e => setSource(e.target.value)} required style={inputStyle}>
            <option value="">Select source account</option>
            {accounts.map((a: any) => (
              <option key={a.id} value={a.accountNumber}>{a.accountNumber} - ${a.balance?.toFixed(2)}</option>
            ))}
          </select>
          <input placeholder="Destination account number" value={dest} onChange={e => setDest(e.target.value)} required style={inputStyle} />
          <input type="number" step="0.01" placeholder="Amount" value={amount} onChange={e => setAmount(Number(e.target.value))} required style={inputStyle} />
          <input placeholder="Description (optional)" value={desc} onChange={e => setDesc(e.target.value)} style={inputStyle} />
          {error && <p style={{ color: 'red', margin: 0 }}>{error}</p>}
          <button type="submit" style={btnStyle}>Send Transfer</button>
        </form>
      )}

      <div style={{ background: '#fff', borderRadius: 8, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr style={{ textAlign: 'left', background: '#f8fafc', fontSize: 13, color: '#64748b' }}>
            <th style={{ padding: 12 }}>Reference</th><th>From</th><th>To</th><th>Amount</th><th>Status</th><th>Date</th><th></th>
          </tr></thead>
          <tbody>
            {transfers.map((t: any) => (
              <tr key={t.id} style={{ borderTop: '1px solid #f1f5f9' }}>
                <td style={{ padding: 12, fontSize: 13, fontFamily: 'monospace' }}>{t.reference?.slice(0, 12)}...</td>
                <td>{t.sourceAccountNumber}</td>
                <td>{t.destinationAccountNumber}</td>
                <td>${t.amount?.toFixed(2)}</td>
                <td><span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 12, fontWeight: 600, background: t.status === 'COMPLETED' ? '#dcfce7' : t.status === 'REVERSED' ? '#fef3c7' : '#f1f5f9', color: t.status === 'COMPLETED' ? '#16a34a' : t.status === 'REVERSED' ? '#d97706' : '#64748b' }}>{t.status}</span></td>
                <td style={{ fontSize: 14 }}>{new Date(t.createdAt).toLocaleDateString()}</td>
                <td>{t.status === 'COMPLETED' && <button onClick={() => handleReverse(t.id)} style={{ padding: '4px 8px', fontSize: 12, background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: 4, cursor: 'pointer' }}>Reverse</button>}</td>
              </tr>
            ))}
            {transfers.length === 0 && <tr><td colSpan={7} style={{ padding: 24, textAlign: 'center', color: '#94a3b8' }}>No transfers yet</td></tr>}
          </tbody>
        </table>
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
