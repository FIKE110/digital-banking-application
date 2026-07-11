import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getAccount, getBalance, updateBalance } from '../api/accounts';
import { getAccountEntries } from '../api/ledger';

export default function AccountDetail() {
  const { id } = useParams();
  const [account, setAccount] = useState<any>(null);
  const [balance, setBalanceData] = useState<any>(null);
  const [entries, setEntries] = useState<any[]>([]);
  const [showDepositForm, setShowDepositForm] = useState(false);
  const [depositAmount, setDepositAmount] = useState(0);
  const [depositDescription, setDepositDescription] = useState('');
  const [depositLoading, setDepositLoading] = useState(false);
  const [depositError, setDepositError] = useState('');
  const [depositSuccess, setDepositSuccess] = useState('');

  useEffect(() => {
    if (!id) return;
    getAccount(id).then(r => setAccount(r.data)).catch(() => {});
    getBalance(id).then(r => setBalanceData(r.data)).catch(() => {});
    // entries need accountNumber - will be available after account loads
  }, [id]);

  useEffect(() => {
    if (!account?.accountNumber) return;
    getAccountEntries(account.accountNumber).then(r => setEntries(r.data || [])).catch(() => {});
  }, [account]);

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDepositError('');
    setDepositSuccess('');
    
    if (depositAmount < 1) {
      setDepositError('Deposit amount must be at least $1.00');
      return;
    }
    
    setDepositLoading(true);
    try {
      const newBalance = (balance?.balance || account.balance) + depositAmount;
      await updateBalance(id!, newBalance);
      
      setDepositSuccess(`Successfully deposited $${depositAmount.toFixed(2)}`);
      setDepositAmount(0);
      setDepositDescription('');
      setShowDepositForm(false);
      
      // Refresh account and balance data
      Promise.all([
        getAccount(id!).then(r => setAccount(r.data)),
        getBalance(id!).then(r => setBalanceData(r.data))
      ]);
    } catch (err: any) {
      setDepositError(err.response?.data?.message || 'Deposit failed. Please try again.');
    } finally {
      setDepositLoading(false);
    }
  };

  if (!account) return <p>Loading...</p>;

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>{account.accountName}</h1>
      <p style={{ color: '#64748b', marginBottom: 24 }}>{account.accountNumber} · {account.accountType} · {account.status}</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        <div style={{ background: '#fff', padding: 20, borderRadius: 8 }}>
          <p style={{ color: '#64748b', fontSize: 14, margin: 0 }}>Balance</p>
          <p style={{ fontSize: 28, fontWeight: 700, margin: '4px 0 0' }}>${(balance?.balance ?? account.balance)?.toFixed(2)}</p>
        </div>
        <div style={{ background: '#fff', padding: 20, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ color: '#64748b', fontSize: 14, margin: 0 }}>Currency</p>
            <p style={{ fontSize: 20, fontWeight: 600, margin: '4px 0 0' }}>{account.currency}</p>
          </div>
          <button
            onClick={() => setShowDepositForm(!showDepositForm)}
            style={{
              padding: '8px 16px',
              background: '#16a34a',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#15803d';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = '#16a34a';
              e.currentTarget.style.transform = 'none';
            }}
          >
            Deposit Funds
          </button>
        </div>
      </div>

      {showDepositForm && (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: 20, marginBottom: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: '#166534', marginBottom: 16 }}>Add Funds to Account</h3>
          <form onSubmit={handleDeposit} style={{ display: 'flex', gap: 12, alignItems: 'end' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#166534', marginBottom: 6 }}>Amount ($)</label>
              <input
                type="number"
                step="0.01"
                min="1"
                placeholder="Enter amount (min $1.00)"
                value={depositAmount}
                onChange={(e) => setDepositAmount(Number(e.target.value))}
                required
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  border: '1px solid #86efac',
                  borderRadius: 6,
                  fontSize: 14,
                  background: '#fff',
                }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#166534', marginBottom: 6 }}>Description (Optional)</label>
              <input
                type="text"
                placeholder="e.g., Payday deposit, Gift, etc."
                value={depositDescription}
                onChange={(e) => setDepositDescription(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  border: '1px solid #86efac',
                  borderRadius: 6,
                  fontSize: 14,
                  background: '#fff',
                }}
              />
            </div>
            <button
              type="submit"
              disabled={depositLoading || depositAmount < 1}
              style={{
                padding: '10px 20px',
                background: depositLoading || depositAmount < 1 ? '#93c5fd' : '#16a34a',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                fontSize: 14,
                fontWeight: 600,
                cursor: depositLoading || depositAmount < 1 ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
              onMouseEnter={(e) => {
                if (!depositLoading && depositAmount >= 1) {
                  e.currentTarget.style.background = '#15803d';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#16a34a';
                e.currentTarget.style.transform = 'none';
              }}
            >
              {depositLoading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    width: 14, height: 14,
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: '#fff',
                    borderRadius: '50%',
                    animation: 'spin 0.6s linear infinite',
                    display: 'inline-block',
                  }} /> Depositing...
                </span>
              ) : 'Deposit'}
            </button>
          </form>
          {depositError && (
            <div style={{ marginTop: 12, padding: '8px 12px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 6, color: '#dc2626', fontSize: 13 }}>
              {depositError}
            </div>
          )}
          {depositSuccess && (
            <div style={{ marginTop: 12, padding: '8px 12px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 6, color: '#16a34a', fontSize: 13 }}>
              {depositSuccess}
            </div>
          )}
        </div>
      )}

      <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>Transaction History</h2>
      <div style={{ background: '#fff', borderRadius: 8, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr style={{ textAlign: 'left', background: '#f8fafc', fontSize: 13, color: '#64748b' }}>
            <th style={{ padding: 12 }}>Type</th><th>Counterparty</th><th>Amount</th><th>Description</th><th>Date</th>
          </tr></thead>
          <tbody>
            {entries.map((t: any) => (
              <tr key={t.id} style={{ borderTop: '1px solid #f1f5f9' }}>
                <td style={{ padding: 12, color: t.type === 'CREDIT' ? '#16a34a' : '#dc2626', fontWeight: 600 }}>{t.type}</td>
                <td>{t.counterpartyAccountNumber}</td>
                <td>${t.amount?.toFixed(2)}</td>
                <td style={{ color: '#64748b', fontSize: 14 }}>{t.description || '-'}</td>
                <td style={{ fontSize: 14 }}>{new Date(t.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
            {entries.length === 0 && <tr><td colSpan={5} style={{ padding: 24, textAlign: 'center', color: '#94a3b8' }}>No transactions yet</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
