import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';

const pages = [
  { to: '/dashboard', label: 'Dashboard', icon: 'D' },
  { to: '/accounts', label: 'Accounts', icon: 'A' },
  { to: '/transfers', label: 'Transfers', icon: 'T' },
  { to: '/transactions', label: 'Transactions', icon: 'H' },
  { to: '/profile', label: 'Profile', icon: 'P' },
  // { to: '/admin/accounts', label: 'Admin', icon: 'M' },
];

export default function Layout() {
  const { logout } = useAuth();
  const location = useLocation();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <nav style={{
        width: 260,
        background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        zIndex: 50,
        boxShadow: '4px 0 20px rgba(0,0,0,0.1)',
      }}>
        <div style={{
          padding: '32px 20px 24px',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 12,
              background: 'linear-gradient(135deg, #2563eb, #7c3aed, #db2777)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, fontWeight: 700, color: '#fff', flexShrink: 0,
              boxShadow: '0 4px 12px rgba(37,99,235,0.4)',
            }}>B</div>
            <div>
              <div style={{ fontSize: 17, fontWeight: 700, color: '#fff', lineHeight: 1.2, marginBottom: 2 }}>Digital</div>
              <div style={{ fontSize: 12, color: '#60a5fa', fontWeight: 500, marginBottom: 1 }}>Banking</div>
              <div style={{ fontSize: 10, color: '#94a3b8', opacity: 0.7 }}>Secure Banking</div>
            </div>
          </div>
        </div>

        <div style={{ flex: 1, padding: '24px 12px', display: 'flex', flexDirection: 'column', gap: 4, overflowY: 'auto' }}>
          <div style={{ padding: '0 8px', marginBottom: 8, fontSize: 11, color: '#94a3b8', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Main Menu
          </div>
          {pages.map(p => {
            const isActive = location.pathname === p.to || location.pathname.startsWith(p.to + '/');
            const isHovered = hoveredItem === p.to;
            return (
              <NavLink
                key={p.to}
                to={p.to}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 16px',
                  borderRadius: 12,
                  textDecoration: 'none',
                  fontSize: 15,
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? '#fff' : '#94a3b8',
                  background: isActive 
                    ? 'linear-gradient(90deg, rgba(37,99,235,0.25), rgba(124,58,234,0.15))'
                    : isHovered 
                    ? 'rgba(255,255,255,0.06)'
                    : 'transparent',
                  boxShadow: isActive ? '0 4px 12px rgba(37,99,235,0.2)' : 'none',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: isActive || isHovered ? 'translateX(4px)' : 'none',
                }}
                onMouseEnter={() => setHoveredItem(p.to)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <span style={{
                  width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, fontWeight: 600,
                  background: isActive 
                    ? 'linear-gradient(135deg, #2563eb, #7c3aed)'
                    : isHovered
                    ? 'linear-gradient(135deg, #2563eb, #7c3aed)'
                    : 'rgba(255,255,255,0.06)',
                  color: '#fff',
                  boxShadow: isActive ? '0 2px 8px rgba(37,99,235,0.4)' : 'none',
                }}>{p.icon}</span>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <span>{p.label}</span>
                  {isActive && (
                    <div style={{ fontSize: 10, color: '#93c5fd', marginTop: 2 }}>Active</div>
                  )}
                </div>
                {isActive && (
                  <div style={{ width: 3, height: '60%', background: '#60a5fa', borderRadius: 3, opacity: 0.8 }} />
                )}
              </NavLink>
            );
          })}
        </div>

        <div style={{ padding: '20px 16px 32px' }}>
        {/*  <div style={{ padding: '0 8px', marginBottom: 8, fontSize: 11, color: '#94a3b8', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>*/}
        {/*    Account*/}
        {/*  </div>*/}
        {/*  <div style={{*/}
        {/*    background: 'rgba(239,68,68,0.08)',*/}
        {/*    border: '1px solid rgba(239,68,68,0.2)',*/}
        {/*    borderRadius: 12,*/}
        {/*    padding: '12px 16px',*/}
        {/*    marginBottom: 12,*/}
        {/*    backdropFilter: 'blur(10px)',*/}
        {/*  }}>*/}
        {/*    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>*/}
        {/*      <div style={{*/}
        {/*        width: 32, height: 32, borderRadius: 8, flexShrink: 0,*/}
        {/*        display: 'flex', alignItems: 'center', justifyContent: 'center',*/}
        {/*        fontSize: 12, fontWeight: 600,*/}
        {/*        background: 'rgba(239,68,68,0.2)', color: '#ef4444',*/}
        {/*      }}>U</div>*/}
        {/*      <div style={{ flex: 1 }}>*/}
        {/*        <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 2 }}>Admin User</div>*/}
        {/*        <div style={{ fontSize: 11, color: '#94a3b8' }}>admin@example.com</div>*/}
        {/*      </div>*/}
        {/*    </div>*/}
        {/*    <div style={{ paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.05)' }}>*/}
        {/*      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: '#fbbf24', marginBottom: 4 }}>*/}
        {/*        <span>🔒</span> <span>Role: Super Admin</span>*/}
        {/*      </div>*/}
        {/*      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: '#60a5fa' }}>*/}
        {/*        <span>📅</span> <span>Joined: Jan 2024</span>*/}
        {/*      </div>*/}
        {/*    </div>*/}
        {/*  </div>*/}

          <button
            onClick={logout}
            style={{
              width: '100%',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: 12,
              color: '#fca5a5',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(239,68,68,0.25)';
              e.currentTarget.style.borderColor = '#ef4444';
              e.currentTarget.style.color = '#fff';
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(239,68,68,0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(239,68,68,0.1)';
              e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)';
              e.currentTarget.style.color = '#fca5a5';
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <span style={{ width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🚪</span>
            Sign Out
          </button>
        </div>
      </nav>

      <main style={{
        flex: 1,
        marginLeft: 260,
        padding: '40px 32px',
        background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
        minHeight: '100vh',
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
        }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
