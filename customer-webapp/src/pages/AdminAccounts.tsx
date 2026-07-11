import { useEffect, useState } from 'react';
import { adminListAccounts, adminUpdateAccountStatus } from '../api/admin';

export default function AdminAccounts() {
  const [accounts, setAccounts] = useState<any[]>([]);

  const fetchAccounts = () => adminListAccounts().then(r => setAccounts(r.data || [])).catch(() => {});
  useEffect(() => { fetchAccounts(); }, []);

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await adminUpdateAccountStatus(id, status);
      fetchAccounts();
    } catch { alert('Failed to update status'); }
  };

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24, color: '#1e293b' }}>Admin · Account Management</h1>

      <div style={{ background: '#fff', borderRadius: 8, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr style={{ textAlign: 'left', background: '#f8fafc', fontSize: 13, color: '#64748b' }}>
            <th style={{ padding: 12 }}>Account</th><th>Name</th><th>Type</th><th>Balance</th><th>Owner</th><th>Status</th><th>Actions</th>
          </tr></thead>
          <tbody>
            {accounts.map((a: any) => (
              <tr key={a.id} style={{ borderTop: '1px solid #f1f5f9' }}>
                <td style={{ padding: 12, fontFamily: 'monospace', fontSize: 13 }}>{a.accountNumber}</td>
                <td>{a.accountName}</td>
                <td>{a.accountType}</td>
                <td style={{ fontWeight: 600 }}>${a.balance?.toFixed(2)}</td>
                <td style={{ fontSize: 14 }}>{a.username || a.userId}</td>
                <td><span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 12, fontWeight: 600, background: a.status === 'ACTIVE' ? '#dcfce7' : a.status === 'FROZEN' ? '#fef3c7' : '#f1f5f9', color: a.status === 'ACTIVE' ? '#16a34a' : a.status === 'FROZEN' ? '#d97706' : '#64748b' }}>{a.status}</span></td>
                <td>
                  <select
                    value={a.status}
                    onChange={e => handleStatusChange(a.id, e.target.value)}
                    style={{ padding: '4px 8px', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: 13 }}
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="FROZEN">FROZEN</option>
                    <option value="CLOSED">CLOSED</option>
                  </select>
                </td>
              </tr>
            ))}
            {accounts.length === 0 && <tr><td colSpan={7} style={{ padding: 24, textAlign: 'center', color: '#94a3b8' }}>No accounts found</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
