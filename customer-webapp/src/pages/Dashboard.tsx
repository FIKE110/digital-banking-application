import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAccounts } from '../api/accounts';
import { getTransactions } from '../api/ledger';

export default function Dashboard() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [recentTxns, setRecentTxns] = useState<any[]>([]);

  useEffect(() => {
    getAccounts().then(r => setAccounts(r.data || [])).catch(() => {});
    getTransactions().then(r => setRecentTxns((r.data || []).slice(0, 5))).catch(() => {});
  }, []);

  const totalBalance = accounts.reduce((s, a) => s + (a.balance || 0), 0);

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Dashboard</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 32 }}>
        <div style={{ background: '#fff', padding: 20, borderRadius: 8, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
          <p style={{ color: '#64748b', fontSize: 14, margin: 0 }}>Total Balance</p>
          <p style={{ fontSize: 28, fontWeight: 700, margin: '4px 0 0' }}>${totalBalance.toFixed(2)}</p>
        </div>
        <div style={{ background: '#fff', padding: 20, borderRadius: 8, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
          <p style={{ color: '#64748b', fontSize: 14, margin: 0 }}>Accounts</p>
          <p style={{ fontSize: 28, fontWeight: 700, margin: '4px 0 0' }}>{accounts.length}</p>
        </div>
        <div style={{ background: '#fff', padding: 20, borderRadius: 8, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
          <p style={{ color: '#64748b', fontSize: 14, margin: 0 }}>Recent Transactions</p>
          <p style={{ fontSize: 28, fontWeight: 700, margin: '4px 0 0' }}>{recentTxns.length}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div style={{ background: '#fff', padding: 20, borderRadius: 8, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Your Accounts</h2>
          {accounts.length === 0 ? <p style={{ color: '#94a3b8' }}>No accounts yet. <Link to="/accounts">Create one</Link></p> : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr style={{ textAlign: 'left', color: '#64748b', fontSize: 13 }}>
                <th style={{ padding: '8px 4px' }}>Account</th><th>Type</th><th>Balance</th>
              </tr></thead>
              <tbody>
                {accounts.map((a: any) => (
                  <tr key={a.id}>
                    <td style={{ padding: '8px 4px' }}><Link to={`/accounts/${a.id}`}>{a.accountNumber}</Link></td>
                    <td>{a.accountType}</td>
                    <td>${a.balance?.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div style={{ background: '#fff', padding: 20, borderRadius: 8, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Recent Activity</h2>
          {recentTxns.length === 0 ? <p style={{ color: '#94a3b8' }}>No transactions yet.</p> : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr style={{ textAlign: 'left', color: '#64748b', fontSize: 13 }}>
                <th style={{ padding: '8px 4px' }}>Type</th><th>Amount</th><th>Date</th>
              </tr></thead>
              <tbody>
                {recentTxns.map((t: any) => (
                  <tr key={t.id}>
                    <td style={{ padding: '8px 4px', color: t.type === 'CREDIT' ? '#16a34a' : '#dc2626' }}>{t.type}</td>
                    <td>${t.amount?.toFixed(2)}</td>
                    <td>{new Date(t.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
