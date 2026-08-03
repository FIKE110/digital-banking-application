import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../ui/Theme';
import Icon from '../ui/Icon';
import { BANK_NAME, BANK_TAG } from '../config';
import { useEffect, useState } from 'react';

interface NavItem {
  to: string;
  label: string;
  icon: string;
}

const customerGroups: Array<{ label: string; items: NavItem[] }> = [
  {
    label: 'Overview',
    items: [{ to: '/dashboard', label: 'Dashboard', icon: 'dashboard' }],
  },
  {
    label: 'Banking',
    items: [
      { to: '/accounts', label: 'Accounts', icon: 'wallet' },
      { to: '/transfers', label: 'Transfers', icon: 'send' },
      { to: '/payments', label: 'Payments', icon: 'zap' },
      { to: '/cards', label: 'Cards', icon: 'card' },
      { to: '/transactions', label: 'Transactions', icon: 'receipt' },
    ],
  },
  {
    label: 'Manage',
    items: [
      { to: '/beneficiaries', label: 'Beneficiaries', icon: 'users' },
      { to: '/notifications', label: 'Notifications', icon: 'bell' },
      { to: '/settings', label: 'Settings', icon: 'settings' },
    ],
  },
];

const adminGroups: Array<{ label: string; items: NavItem[] }> = [
  {
    label: 'Overview',
    items: [{ to: '/admin', label: 'Dashboard', icon: 'shield' }],
  },
  {
    label: 'Customers',
    items: [
      { to: '/admin/customers', label: 'Customers', icon: 'users' },
      { to: '/admin/accounts', label: 'Accounts', icon: 'bank' },
      { to: '/admin/kyc', label: 'KYC Verifications', icon: 'fingerprint' },
    ],
  },
  {
    label: 'Banking',
    items: [
      { to: '/admin/transactions', label: 'Transactions', icon: 'receipt' },
      { to: '/admin/cards', label: 'Cards', icon: 'card' },
      { to: '/admin/payments', label: 'Payments', icon: 'zap' },
      { to: '/admin/beneficiaries', label: 'Beneficiaries', icon: 'users' },
    ],
  },
  {
    label: 'Security & Admin',
    items: [
      { to: '/admin/approvals', label: 'Approvals', icon: 'check' },
      { to: '/admin/adjustments', label: 'Adjustments', icon: 'wallet' },
      { to: '/admin/admins', label: 'Administrators', icon: 'shield' },
      { to: '/admin/roles', label: 'Roles & Permissions', icon: 'lock' },
      { to: '/admin/audit', label: 'Audit Trail', icon: 'search' },
      { to: '/admin/limits', label: 'Limits', icon: 'wallet' },
    ],
  },
];

const customerMobileTabs: NavItem[] = [
  { to: '/dashboard', label: 'Home', icon: 'home' },
  { to: '/accounts', label: 'Accounts', icon: 'wallet' },
  { to: '/transfers', label: 'Transfers', icon: 'send' },
  { to: '/cards', label: 'Cards', icon: 'card' },
  { to: '/more', label: 'More', icon: 'menu' },
];

const adminMobileTabs: NavItem[] = [
  { to: '/admin', label: 'Dashboard', icon: 'shield' },
  { to: '/admin/customers', label: 'Customers', icon: 'users' },
  { to: '/admin/transactions', label: 'Transactions', icon: 'receipt' },
  { to: '/admin/approvals', label: 'Approvals', icon: 'check' },
];

const TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/accounts': 'Accounts',
  '/transfers': 'Transfers',
  '/payments': 'Payments',
  '/cards': 'Cards',
  '/transactions': 'Transactions',
  '/beneficiaries': 'Beneficiaries',
  '/notifications': 'Notifications',
  '/settings': 'Settings',
  '/profile': 'Profile',
  '/admin': 'Dashboard',
  '/admin/login': 'Admin Login',
  '/admin/accounts': 'Accounts',
  '/admin/audit': 'Audit Trail',
  '/admin/limits': 'Limits',
  '/admin/transactions': 'Transactions',
  '/admin/customers': 'Customers',
  '/admin/kyc': 'KYC Verifications',
  '/admin/cards': 'Cards',
  '/admin/payments': 'Payments',
  '/admin/beneficiaries': 'Beneficiaries',
  '/admin/roles': 'Roles & Permissions',
  '/admin/admins': 'Administrators',
  '/admin/approvals': 'Approval Queue',
  '/admin/adjustments': 'Adjustments',
};

function isActiveMatch(path: string, to: string) {
  if (to === '/more') return false;
  return path === to || path.startsWith(to + '/');
}

export default function Layout() {
  const { logout, user } = useAuth();
  const { theme, toggle } = useTheme();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    setDrawerOpen(false);
    window.scrollTo({ top: 0 });
  }, [location.pathname]);

  const isAdmin = user?.permissions?.includes('manage-admin') ?? false;
  const groups = isAdmin ? adminGroups : customerGroups;
  const mobileTabs = isAdmin ? adminMobileTabs : customerMobileTabs;
  const path = location.pathname;
  const title = Object.entries(TITLES).find(([k]) => isActiveMatch(path, k))?.[1] ?? BANK_NAME;
  const initials = user?.username?.charAt(0)?.toUpperCase() || 'U';

  const sidebarContent = (includeBrand: boolean) => (
    <>
      {includeBrand && (
        <div className="brand">
          <div className="brand__logo">A</div>
          <div>
            <div className="brand__name">{BANK_NAME}</div>
            <div className="brand__tag">{isAdmin ? 'Admin Portal' : BANK_TAG}</div>
          </div>
        </div>
      )}

      <nav className="sidebar__nav" aria-label="Main navigation">
        {groups.map(g => (
          <div key={g.label}>
            <div className="sidebar__group-label">{g.label}</div>
            {g.items.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                className={isActiveMatch(path, item.to) ? 'nav-item nav-item--active' : 'nav-item'}
              >
                <span className="nav-item__icon">
                  <Icon name={item.icon} size={17} />
                </span>
                {item.label}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar__user">
        <div className="user-card">
          <div className="avatar">{initials}</div>
          <div className="flex-1" style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.username}
            </div>
            <div className="muted text-xs" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {isAdmin ? 'Administrator' : user?.email}
            </div>
          </div>
        </div>
        <div className="row" style={{ gap: 8 }}>
          {!isAdmin && (
            <NavLink to="/settings" className="icon-btn" title="Settings" aria-label="Settings">
              <Icon name="settings" size={17} />
            </NavLink>
          )}
          <button className="icon-btn" onClick={toggle} title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'} aria-label="Toggle theme">
            <Icon name={theme === 'light' ? 'moon' : 'sun'} size={17} />
          </button>
          <button
            className="btn btn--ghost btn--sm"
            onClick={logout}
            style={{ marginLeft: 'auto' }}
          >
            <Icon name="logout" size={15} />
            Sign out
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className="app">
      <aside className="sidebar">{sidebarContent(true)}</aside>

      <div className="app__main">
        <header className="topbar">
          <button className="icon-btn hidden-desktop" onClick={() => setDrawerOpen(true)} aria-label="Open menu">
            <Icon name="menu" size={18} />
          </button>
          <div className="topbar__title">{title}</div>
          <div className="topbar__actions">
            {!isAdmin && (
              <NavLink to="/notifications" className="icon-btn" aria-label="Notifications">
                <Icon name="bell" size={17} />
                <span className="icon-btn__dot" />
              </NavLink>
            )}
            <button className="icon-btn hidden-mobile" onClick={toggle} aria-label="Toggle theme">
              <Icon name={theme === 'light' ? 'moon' : 'sun'} size={17} />
            </button>
            <NavLink to={isAdmin ? '/admin' : '/profile'} className="icon-btn" aria-label="Profile">
              <span className="avatar avatar--sm" style={{ width: 30, height: 30, fontSize: 12, margin: -4 }}>{initials}</span>
            </NavLink>
          </div>
        </header>

        <main className="app__content">
          <div className="app__content-inner anim-rise">
            <Outlet />
          </div>
        </main>
      </div>

      {drawerOpen && (
        <>
          <div className="drawer-overlay" onClick={() => setDrawerOpen(false)} />
          <div className="drawer">
            <div className="drawer__header">
              <div className="row" style={{ gap: 10 }}>
                <div className="brand__logo">A</div>
                <div>
                  <div className="brand__name">{BANK_NAME}</div>
                  <div className="brand__tag">{isAdmin ? 'Admin Portal' : BANK_TAG}</div>
                </div>
              </div>
              <button className="icon-btn" onClick={() => setDrawerOpen(false)} aria-label="Close menu">
                <Icon name="x" size={16} />
              </button>
            </div>
            {sidebarContent(false)}
          </div>
        </>
      )}

      <nav className="bottom-nav" aria-label="Bottom navigation">
        {mobileTabs.map(tab => {
          const active = tab.to !== '/more' && isActiveMatch(path, tab.to);
          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={active ? 'bottom-nav__item bottom-nav__item--active' : 'bottom-nav__item'}
              onClick={tab.to === '/more' ? (e) => { e.preventDefault(); setDrawerOpen(true); } : undefined}
            >
              <span className="bottom-nav__icon" style={{ display: 'flex', padding: '3px 12px', borderRadius: 'var(--radius-full)' }}>
                <Icon name={tab.icon} size={19} />
              </span>
              {tab.label}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
