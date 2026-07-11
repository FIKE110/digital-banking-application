import { useEffect, useState } from 'react';
import { getTransactions } from '../api/ledger';

export default function TransactionHistory() {
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    getTransactions().then(r => setTransactions(r.data || [])).catch(() => {});
  }, []);

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Transaction History</h1>

      <div style={{ background: '#fff', borderRadius: 8, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr style={{ textAlign: 'left', background: '#f8fafc', fontSize: 13, color: '#64748b' }}>
            <th style={{ padding: 12 }}>Account</th><th>Counterparty</th><th>Type</th><th>Amount</th><th>Description</th><th>Status</th><th>Date</th>
          </tr></thead>
          <tbody>
            {transactions.map((t: any) => (
              <tr key={t.id} style={{ borderTop: '1px solid #f1f5f9' }}>
                <td style={{ padding: 12 }}>{t.accountNumber}</td>
                <td>{t.counterpartyAccountNumber || '-'}</td>
                <td><span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 12, fontWeight: 600, background: t.type === 'CREDIT' ? '#dcfce7' : '#fef2f2', color: t.type === 'CREDIT' ? '#16a34a' : '#dc2626' }}>{t.type}</span></td>
                <td style={{ fontWeight: 600 }}>${t.amount?.toFixed(2)}</td>
                <td style={{ color: '#64748b', fontSize: 14 }}>{t.description || '-'}</td>
                <td><span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 12, color: '#64748b', background: '#f1f5f9' }}>{t.status}</span></td>
                <td style={{ fontSize: 14 }}>{new Date(t.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
            {transactions.length === 0 && <tr><td colSpan={7} style={{ padding: 24, textAlign: 'center', color: '#94a3b8' }}>No transactions yet</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
