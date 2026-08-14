import type { ReactNode } from 'react';
import Icon from './Icon';
import { useTheme } from './Theme';
import { BANK_NAME, BANK_TAG } from '../config';

const FEATURES = [
  { icon: 'shield', title: 'Secure by default', body: 'Your sign-ins and sessions are encrypted and monitored.' },
  { icon: 'send', title: 'Fast transfers', body: 'Send money to accounts and saved beneficiaries in seconds.' },
  { icon: 'card', title: 'Cards with control', body: 'Virtual and physical cards, with limits and PIN you control.' },
];

export default function AuthLayout({ children }: { children: ReactNode }) {
  const { theme, toggle } = useTheme();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--color-bg)' }}>
      <div
        className="hidden-mobile-flex"
        style={{
          flex: '1 1 45%',
          maxWidth: 560,
          background: 'var(--hero-bg)',
          borderRight: '1px solid var(--color-nav-hairline)',
          color: 'var(--hero-text)',
          padding: 'var(--space-8)',
          flexDirection: 'column',
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', border: '1px solid var(--color-nav-hairline)', top: -120, right: -120 }} />
        <div style={{ position: 'absolute', width: 220, height: 220, borderRadius: '50%', border: '1px solid var(--color-nav-3)', bottom: -100, left: -60 }} />

        <div className="row" style={{ gap: 12, position: 'relative', zIndex: 1 }}>
          <div className="brand__logo" style={{ width: 42, height: 42, fontSize: 18 }}>5</div>
          <div>
            <div className="brand__name" style={{ color: 'var(--hero-text)' }}>{BANK_NAME}</div>
            <div style={{ fontSize: 12, color: 'var(--hero-text-2)' }}>{BANK_TAG}</div>
          </div>
        </div>

        <div style={{ margin: 'auto 0', position: 'relative', zIndex: 1, maxWidth: 400 }}>
          <h1 style={{ fontSize: 34, fontWeight: 500, fontFamily: 'var(--font-display)', letterSpacing: '-0.01em', lineHeight: 1.2, margin: '0 0 12px' }}>
            Simple banking.
          </h1>
          <p style={{ fontSize: 15, color: 'var(--hero-text-2)', margin: 0, lineHeight: 1.6 }}>
            Accounts, cards, transfers and payments in one place.
          </p>

          <div className="stack" style={{ gap: 18, marginTop: 36 }}>
            {FEATURES.map(f => (
              <div key={f.title} className="row" style={{ gap: 14, alignItems: 'flex-start' }}>
                <span style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--hero-chip)', border: '1px solid var(--color-nav-hairline)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon name={f.icon} size={19} />
                </span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{f.title}</div>
                  <div style={{ fontSize: 13, color: 'var(--hero-text-2)', marginTop: 2 }}>{f.body}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ position: 'relative', zIndex: 1, fontSize: 12, color: 'var(--hero-text-2)' }}>
          © {new Date().getFullYear()} {BANK_NAME}
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-6)', position: 'relative' }}>
        <button
          type="button"
          className="icon-btn"
          onClick={toggle}
          aria-label="Toggle theme"
          style={{ position: 'absolute', top: 20, right: 20 }}
        >
          <Icon name={theme === 'light' ? 'moon' : 'sun'} size={17} />
        </button>
        <div style={{ width: '100%', maxWidth: 420 }} className="anim-rise">
          {children}
        </div>
      </div>
    </div>
  );
}
