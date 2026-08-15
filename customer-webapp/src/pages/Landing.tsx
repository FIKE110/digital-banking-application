import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../ui/Theme';
import Icon from '../ui/Icon';
import { BANK_NAME, BANK_TAG, BANK_SUPPORT_EMAIL } from '../config';

export default function Landing() {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cardColor, setCardColor] = useState<'obsidian' | 'emerald' | 'platinum'>('obsidian');
  const [cardFrozen, setCardFrozen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [convertAmount, setConvertAmount] = useState<number>(1000);
  const [convertCurrency, setConvertCurrency] = useState<'USD' | 'EUR' | 'GBP'>('USD');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Auto-switch card colors at 3-second interval
  useEffect(() => {
    const colors: Array<'obsidian' | 'emerald' | 'platinum'> = ['obsidian', 'emerald', 'platinum'];
    const timer = setInterval(() => {
      setCardColor((prev) => {
        const nextIndex = (colors.indexOf(prev) + 1) % colors.length;
        return colors[nextIndex];
      });
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  // Smooth scroll handler
  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.querySelector(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // 3D Digital Network Globe Canvas Loop Renderer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    // Global Financial Hubs (Latitude, Longitude in degrees)
    const hubs = [
      { name: 'New York', lat: 40.7128, lon: -74.006 },
      { name: 'London', lat: 51.5074, lon: -0.1278 },
      { name: 'Tokyo', lat: 35.6762, lon: 139.6503 },
      { name: 'Frankfurt', lat: 50.1109, lon: 8.6821 },
      { name: 'Singapore', lat: 1.3521, lon: 103.8198 },
      { name: 'Lagos', lat: 6.5244, lon: 3.3792 },
      { name: 'Sydney', lat: -33.8688, lon: 151.2093 },
      { name: 'Dubai', lat: 25.2048, lon: 55.2708 },
      { name: 'São Paulo', lat: -23.5505, lon: -46.6333 },
      { name: 'Hong Kong', lat: 22.3193, lon: 114.1694 },
    ];

    let rotationY = 0;
    let rotationX = 0.2; // Slight tilt

    // Convert Lat/Lon to 3D Sphere Point
    const project = (lat: number, lon: number, radius: number, rotY: number, rotX: number) => {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lon + 180) * (Math.PI / 180) + rotY;

      let x = -(radius * Math.sin(phi) * Math.cos(theta));
      let z = radius * Math.sin(phi) * Math.sin(theta);
      let y = radius * Math.cos(phi);

      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);
      const y1 = y * cosX - z * sinX;
      const z1 = y * sinX + z * cosX;

      const globeCenterX = width > 992 ? width * 0.75 : width * 0.5;
      const globeCenterY = height * 0.48;
      const scale = 500 / (500 - z1);

      return {
        x: globeCenterX + x * scale,
        y: globeCenterY + y1 * scale,
        z: z1,
        visible: z1 < 30,
      };
    };

    let pulseTime = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      rotationY += 0.005;
      pulseTime += 0.03;

      const globeRadius = Math.min(width, height) * 0.32;
      const globeCenterX = width > 992 ? width * 0.75 : width * 0.5;
      const globeCenterY = height * 0.48;

      // Atmosphere Glow
      const glowGrad = ctx.createRadialGradient(
        globeCenterX,
        globeCenterY,
        globeRadius * 0.6,
        globeCenterX,
        globeCenterY,
        globeRadius * 1.3
      );
      glowGrad.addColorStop(0, 'rgba(0, 200, 83, 0.25)');
      glowGrad.addColorStop(0.5, 'rgba(0, 200, 83, 0.08)');
      glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.beginPath();
      ctx.arc(globeCenterX, globeCenterY, globeRadius * 1.3, 0, Math.PI * 2);
      ctx.fillStyle = glowGrad;
      ctx.fill();

      // Latitude Lines
      for (let lat = -60; lat <= 60; lat += 20) {
        ctx.beginPath();
        let first = true;
        for (let lon = -180; lon <= 180; lon += 5) {
          const pt = project(lat, lon, globeRadius, rotationY, rotationX);
          if (pt.visible) {
            if (first) {
              ctx.moveTo(pt.x, pt.y);
              first = false;
            } else {
              ctx.lineTo(pt.x, pt.y);
            }
          } else {
            first = true;
          }
        }
        ctx.strokeStyle = 'rgba(0, 200, 83, 0.12)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Longitude Lines
      for (let lon = -180; lon < 180; lon += 30) {
        ctx.beginPath();
        let first = true;
        for (let lat = -90; lat <= 90; lat += 5) {
          const pt = project(lat, lon, globeRadius, rotationY, rotationX);
          if (pt.visible) {
            if (first) {
              ctx.moveTo(pt.x, pt.y);
              first = false;
            } else {
              ctx.lineTo(pt.x, pt.y);
            }
          } else {
            first = true;
          }
        }
        ctx.strokeStyle = 'rgba(0, 200, 83, 0.12)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Hub Nodes & Connections
      const projectedHubs = hubs.map((h) => ({
        ...h,
        pt: project(h.lat, h.lon, globeRadius, rotationY, rotationX),
      }));

      for (let i = 0; i < projectedHubs.length; i++) {
        for (let j = i + 1; j < projectedHubs.length; j++) {
          const h1 = projectedHubs[i];
          const h2 = projectedHubs[j];

          if (h1.pt.visible && h2.pt.visible) {
            const midX = (h1.pt.x + h2.pt.x) / 2;
            const midY = (h1.pt.y + h2.pt.y) / 2 - 40;

            ctx.beginPath();
            ctx.moveTo(h1.pt.x, h1.pt.y);
            ctx.quadraticCurveTo(midX, midY, h2.pt.x, h2.pt.y);
            ctx.strokeStyle = 'rgba(0, 200, 83, 0.25)';
            ctx.lineWidth = 1.2;
            ctx.stroke();

            const progress = (pulseTime + i * 0.5 + j * 0.3) % 1;
            const px = Math.pow(1 - progress, 2) * h1.pt.x + 2 * (1 - progress) * progress * midX + Math.pow(progress, 2) * h2.pt.x;
            const py = Math.pow(1 - progress, 2) * h1.pt.y + 2 * (1 - progress) * progress * midY + Math.pow(progress, 2) * h2.pt.y;

            ctx.beginPath();
            ctx.arc(px, py, 3, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = '#00c853';
            ctx.shadowBlur = 8;
            ctx.fill();
            ctx.shadowBlur = 0;
          }
        }
      }

      projectedHubs.forEach((h) => {
        if (h.pt.visible) {
          ctx.beginPath();
          ctx.arc(h.pt.x, h.pt.y, 4, 0, Math.PI * 2);
          ctx.fillStyle = '#00c853';
          ctx.shadowColor = '#00c853';
          ctx.shadowBlur = 10;
          ctx.fill();

          ctx.beginPath();
          ctx.arc(h.pt.x, h.pt.y, 8, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(0, 200, 83, 0.4)';
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.shadowBlur = 0;

          ctx.font = '600 11px -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif';
          ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
          ctx.fillText(h.name, h.pt.x + 8, h.pt.y + 4);
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // FX Conversion Rates
  const fxRates = {
    USD: 1.0,
    EUR: 0.92,
    GBP: 0.79,
  };
  const convertedValue = (convertAmount * fxRates[convertCurrency]).toFixed(2);

  const faqs = [
    {
      q: 'How fast can I open an account with 5ive?',
      a: 'Account opening is instant. You can complete sign-up in under 2 minutes and instantly generate your Checking and Savings accounts with full transfer capabilities.',
    },
    {
      q: 'How are my funds and transactions secured?',
      a: '5ive uses bank-grade 256-bit encryption, mandatory 2FA, biometric authorization, custom Security PINs, and real-time automated risk engine auditing to keep your assets safe.',
    },
    {
      q: 'Can I issue multiple virtual debit cards?',
      a: 'Yes. You can issue unlimited virtual debit cards with instant activation, custom daily and monthly spend limits, and single-tap instant card freezing.',
    },
    {
      q: 'How does the Tiered KYC system work?',
      a: 'You start with basic capabilities and can upgrade to higher daily transfer limits by submitting your identity documents (BVN / NIN) in the KYC Verification portal.',
    },
  ];

  return (
    <div className="landing">
      {/* Fixed Topbar Navigation */}
      <header className="landing-nav">
        {/* Brand Logo & Title */}
        <Link to="/" className="landing-nav__brand">
          <div className="landing-nav__logo">5</div>
          <div>
            <div className="landing-nav__title">{BANK_NAME}</div>
            <div style={{ fontSize: 11, color: 'var(--color-brand)', fontWeight: 600, marginTop: -2 }}>
              {BANK_TAG}
            </div>
          </div>
        </Link>

        {/* Desktop Nav Links (Hidden on Mobile) */}
        <ul className="landing-nav__links">
          <li>
            <button className="landing-nav__link" onClick={() => scrollToSection('#features')}>
              Features
            </button>
          </li>
          <li>
            <button className="landing-nav__link" onClick={() => scrollToSection('#security')}>
              Security & Risk
            </button>
          </li>
          <li>
            <button className="landing-nav__link" onClick={() => scrollToSection('#cards')}>
              Smart Cards
            </button>
          </li>
          <li>
            <button className="landing-nav__link" onClick={() => scrollToSection('#enterprise')}>
              Enterprise Solutions
            </button>
          </li>
          <li>
            <button className="landing-nav__link" onClick={() => scrollToSection('#faq')}>
              FAQ
            </button>
          </li>
        </ul>

        {/* Desktop Header Actions (Hidden on Mobile) */}
        <div className="landing-nav__actions-desktop">
          <button
            className="icon-btn"
            onClick={toggle}
            title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            aria-label="Toggle theme"
          >
            <Icon name={theme === 'light' ? 'moon' : 'sun'} size={18} />
          </button>

          {user ? (
            <div className="row" style={{ gap: 10 }}>
              <button className="btn btn--brand btn--md" onClick={() => navigate('/dashboard')}>
                <Icon name="dashboard" size={16} />
                Go to Dashboard
              </button>
              <button className="btn btn--ghost btn--md" onClick={logout}>
                Sign Out
              </button>
            </div>
          ) : (
            <div className="row" style={{ gap: 10 }}>
              <Link to="/login" className="btn btn--ghost btn--md">
                Sign In
              </Link>
              <Link to="/register" className="btn btn--brand btn--md">
                Open Account
                <Icon name="arrowRight" size={16} />
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Toggle Button (Shown ONLY on Mobile Topbar) */}
        <button
          className="landing-nav__toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle mobile menu"
        >
          <Icon name={mobileMenuOpen ? 'x' : 'menu'} size={24} />
        </button>

        {/* Mobile Dropdown Navigation */}
        {mobileMenuOpen && (
          <div className="landing-nav__links--mobile">
            <button className="landing-nav__link" onClick={() => scrollToSection('#features')}>
              Features
            </button>
            <button className="landing-nav__link" onClick={() => scrollToSection('#security')}>
              Security & Risk
            </button>
            <button className="landing-nav__link" onClick={() => scrollToSection('#cards')}>
              Smart Cards
            </button>
            <button className="landing-nav__link" onClick={() => scrollToSection('#enterprise')}>
              Enterprise Solutions
            </button>
            <button className="landing-nav__link" onClick={() => scrollToSection('#faq')}>
              FAQ
            </button>

            <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 16, marginTop: 8, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button
                className="btn btn--ghost btn--block row"
                style={{ justifyContent: 'space-between' }}
                onClick={toggle}
              >
                <span>Switch Theme ({theme === 'light' ? 'Dark' : 'Light'})</span>
                <Icon name={theme === 'light' ? 'moon' : 'sun'} size={18} />
              </button>

              {user ? (
                <>
                  <button className="btn btn--brand btn--block" onClick={() => { setMobileMenuOpen(false); navigate('/dashboard'); }}>
                    <Icon name="dashboard" size={16} />
                    Go to Dashboard
                  </button>
                  <button className="btn btn--ghost btn--block" onClick={() => { setMobileMenuOpen(false); logout(); }}>
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/register" className="btn btn--brand btn--block" onClick={() => setMobileMenuOpen(false)}>
                    Open Account
                    <Icon name="arrowRight" size={16} />
                  </Link>
                  <Link to="/login" className="btn btn--ghost btn--block" onClick={() => setMobileMenuOpen(false)}>
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="hero">
        {/* Requested Pexels Looping Globe Video Background */}
        <video autoPlay loop muted playsInline preload="auto" className="hero__video-bg">
          <source src="/videos/hero-bg.mp4" type="video/mp4" />
          <source src="https://videos.pexels.com/video-files/3129957/3129957-hd_1280_720_25fps.mp4" type="video/mp4" />
        </video>

        {/* Interactive 3D Spinning Network Globe Canvas */}
        <canvas ref={canvasRef} className="hero__canvas-bg" />

        {/* Hero Overlay Mask */}
        <div className="hero__overlay" />

        <div className="hero__container">
          {/* Hero Text & Call to Action */}
          <div>
            <div className="hero__badge">
              <span className="hero__badge-dot" />
              🌐 GLOBAL FINANCIAL NETWORK OS
            </div>

            <h1 className="hero__title">
              Banking Reimagined for the <span className="hero__title-gradient">Modern World.</span>
            </h1>

            <p className="hero__subtitle">
              Instant multi-currency global accounts, intelligent virtual debit cards, real-time cross-border settlements, and enterprise risk auditing—all connected across financial hubs.
            </p>

            <div className="hero__ctas">
              <Link to="/register" className="hero__cta-primary">
                Open Account in 2 Mins
                <Icon name="arrowRight" size={18} />
              </Link>
              <Link to={user ? "/dashboard" : "/login"} className="hero__cta-secondary">
                <Icon name="play" size={18} />
                Explore Live Demo
              </Link>
            </div>

            {/* Key Statistics Bar */}
            <div className="hero__stats">
              <div>
                <div className="hero__stat-val">$2.4B+</div>
                <div className="hero__stat-lbl">Global Volume</div>
              </div>
              <div>
                <div className="hero__stat-val">&lt;100ms</div>
                <div className="hero__stat-lbl">Settlement Speed</div>
              </div>
              <div>
                <div className="hero__stat-val">99.99%</div>
                <div className="hero__stat-lbl">Platform Uptime</div>
              </div>
              <div>
                <div className="hero__stat-val">256-Bit</div>
                <div className="hero__stat-lbl">Bank Encryption</div>
              </div>
            </div>
          </div>

          {/* Hero Visualizer — Floating 3D Card & Live Activity Feed */}
          <div className="hero__visual">
            <div className="hero__card-3d">
              <div className="hero__card-top">
                <div className="hero__card-logo">
                  <span style={{ color: 'var(--color-brand)' }}>5</span>ive
                </div>
                <Icon name="wifi" size={24} style={{ color: 'rgba(255,255,255,0.7)' }} />
              </div>
              <div>
                <div className="hero__card-chip" />
                <div className="hero__card-num" style={{ marginTop: 14 }}>
                  •••• •••• •••• 5519
                </div>
              </div>
              <div className="hero__card-bottom">
                <div>
                  <div style={{ fontSize: 9, opacity: 0.6, textTransform: 'uppercase' }}>Card Holder</div>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>ALEXANDER MORGAN</div>
                </div>
                <div>
                  <div style={{ fontSize: 9, opacity: 0.6, textTransform: 'uppercase' }}>Expires</div>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>08/29</div>
                </div>
              </div>
            </div>

            {/* Live Activity Stream Preview Widget */}
            <div className="hero__activity-feed">
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <span className="muted text-xs font-mono" style={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Global Financial Stream
                </span>
                <span className="badge badge--success" style={{ fontSize: 10, padding: '2px 8px' }}>
                  Live Hubs
                </span>
              </div>

              <div className="hero__activity-item">
                <div className="row" style={{ gap: 10 }}>
                  <div className="hero__activity-icon">
                    <Icon name="globe" size={16} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: '#fff' }}>New York → London</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>USD Account → EUR Account</div>
                  </div>
                </div>
                <div style={{ fontWeight: 800, color: 'var(--color-brand)', fontSize: 13 }}>
                  +$12,450.00
                </div>
              </div>

              <div className="hero__activity-item">
                <div className="row" style={{ gap: 10 }}>
                  <div className="hero__activity-icon" style={{ background: 'rgba(255, 23, 68, 0.15)', color: '#ff1744' }}>
                    <Icon name="shield" size={16} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: '#fff' }}>Card Security Check</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>2FA PIN Verified</div>
                  </div>
                </div>
                <div className="badge badge--neutral" style={{ fontSize: 11 }}>
                  Secured
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Section */}
      <section id="features" className="section">
        <div className="section-header">
          <span className="section-tag">ENGINEERED FOR EXCELLENCE</span>
          <h2 className="section-title">Complete Digital Financial Infrastructure</h2>
          <p className="section-desc">
            Designed to eliminate friction from payments, transfers, cards, and treasury operations for individuals and modern financial operations.
          </p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-card__icon">
              <Icon name="wallet" size={26} />
            </div>
            <h3 className="feature-card__title">Multi-Currency Accounts</h3>
            <p className="feature-card__text">
              Hold, send, and manage balances in USD, EUR, GBP, and NGN with instant account number creation, individual balances, and real-time activity tracking.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-card__icon">
              <Icon name="send" size={26} />
            </div>
            <h3 className="feature-card__title">Instant Settlement Transfers</h3>
            <p className="feature-card__text">
              Execute peer-to-peer and domestic bank payouts with zero latency, full automated audit reference logs, and instant receipt generation.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-card__icon">
              <Icon name="card" size={26} />
            </div>
            <h3 className="feature-card__title">Smart Virtual & Physical Cards</h3>
            <p className="feature-card__text">
              Issue virtual debit cards in seconds with custom daily & monthly spending caps, single-click card freeze controls, and 3D Secure protection.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-card__icon">
              <Icon name="zap" size={26} />
            </div>
            <h3 className="feature-card__title">Automated Utility & Bill Payments</h3>
            <p className="feature-card__text">
              Settle power, high-speed data, airtime, and TV subscriptions instantly with automatic reference validation and digital receipt tracking.
            </p>
          </div>
        </div>
      </section>

      {/* Security & Risk Architecture Section */}
      <section id="security" className="section" style={{ background: 'var(--color-surface-2)', borderRadius: 'var(--radius-xl)' }}>
        <div className="section-header">
          <span className="section-tag">BANK-GRADE DEFENSE</span>
          <h2 className="section-title">Protected by Multi-Layered Security & Risk Engines</h2>
          <p className="section-desc">
            Safeguarding your funds and data with institutional-grade security protocols, tiered compliance verifications, and real-time monitoring.
          </p>
        </div>

        <div className="security-grid">
          <div className="security-item">
            <div className="security-item__icon">
              <Icon name="fingerprint" size={24} />
            </div>
            <div>
              <h4 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Tiered KYC Identity Verification</h4>
              <p style={{ color: 'var(--color-text-3)', fontSize: 14, lineHeight: 1.6 }}>
                Integrates BVN & NIN verification standards for instant identity validation, automatically unlocking higher daily transfer limits as your account matures.
              </p>
            </div>
          </div>

          <div className="security-item">
            <div className="security-item__icon">
              <Icon name="lock" size={24} />
            </div>
            <div>
              <h4 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Transaction PIN & 2FA Protection</h4>
              <p style={{ color: 'var(--color-text-3)', fontSize: 14, lineHeight: 1.6 }}>
                Every financial transaction requires mandatory 4-digit Security PIN confirmation and secondary authentication, eliminating unauthorized debit risk.
              </p>
            </div>
          </div>

          <div className="security-item">
            <div className="security-item__icon">
              <Icon name="shield" size={24} />
            </div>
            <div>
              <h4 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Automated High-Risk Monitoring</h4>
              <p style={{ color: 'var(--color-text-3)', fontSize: 14, lineHeight: 1.6 }}>
                Continuous algorithmic monitoring evaluates transaction velocity, location anomalies, and high-risk triggers to prevent fraud before it happens.
              </p>
            </div>
          </div>

          <div className="security-item">
            <div className="security-item__icon">
              <Icon name="receipt" size={24} />
            </div>
            <div>
              <h4 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Comprehensive System Audit Log</h4>
              <p style={{ color: 'var(--color-text-3)', fontSize: 14, lineHeight: 1.6 }}>
                Every login, card state modification, balance change, and administrative action is immutably logged with exact timestamps and IP audit signatures.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Card Customizer Showcase */}
      <section id="cards" className="section">
        <div className="section-header">
          <span className="section-tag">CARD INNOVATION</span>
          <h2 className="section-title">Take Full Control of Your Payment Cards</h2>
          <p className="section-desc">
            Watch the card theme automatically cycle live, customize your virtual card aesthetic, and toggle security freezes instantly.
          </p>
        </div>

        <div className="card-showcase">
          <div className="card-preview-stage">
            <div className={`card-demo-visual card-demo-visual--${cardColor}`}>
              <div className="hero__card-top">
                <div className="hero__card-logo">
                  <span>5</span>ive
                </div>
                <span className={`badge ${cardFrozen ? 'badge--danger' : 'badge--success'}`}>
                  {cardFrozen ? 'FROZEN' : 'ACTIVE'}
                </span>
              </div>
              <div>
                <div className="hero__card-chip" />
                <div className="hero__card-num" style={{ marginTop: 12 }}>
                  4532 •••• •••• 9812
                </div>
              </div>
              <div className="hero__card-bottom">
                <div>
                  <div style={{ fontSize: 9, opacity: 0.7 }}>CARD HOLDER</div>
                  <div style={{ fontWeight: 700 }}>5IVE PREMIUM</div>
                </div>
                <div>
                  <div style={{ fontSize: 9, opacity: 0.7 }}>EXPIRES</div>
                  <div style={{ fontWeight: 700 }}>12/30</div>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="row" style={{ gap: 16, alignItems: 'center' }}>
              <div className="card-demo-controls">
                <button
                  className={`color-dot ${cardColor === 'obsidian' ? 'color-dot--active' : ''}`}
                  style={{ background: '#111' }}
                  onClick={() => setCardColor('obsidian')}
                  title="Obsidian Black"
                />
                <button
                  className={`color-dot ${cardColor === 'emerald' ? 'color-dot--active' : ''}`}
                  style={{ background: '#00c853' }}
                  onClick={() => setCardColor('emerald')}
                  title="Neon Emerald"
                />
                <button
                  className={`color-dot ${cardColor === 'platinum' ? 'color-dot--active' : ''}`}
                  style={{ background: '#2c3e50' }}
                  onClick={() => setCardColor('platinum')}
                  title="Platinum Dark"
                />
              </div>

              <button
                className={`btn btn--sm ${cardFrozen ? 'btn--brand' : 'btn--ghost'}`}
                onClick={() => setCardFrozen(!cardFrozen)}
              >
                <Icon name={cardFrozen ? 'unlock' : 'snowflake'} size={15} />
                {cardFrozen ? 'Unfreeze Card' : 'Freeze Card'}
              </button>
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: 24, fontWeight: 800, marginBottom: 16 }}>
              Instant Virtual Cards for Global Subscriptions & Payments
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <li className="row" style={{ gap: 12, alignItems: 'flex-start' }}>
                <span className="badge badge--success" style={{ marginTop: 2 }}><Icon name="check" size={14} /></span>
                <div>
                  <strong>Auto-Cycling Aesthetic Showcase:</strong> Experience live dynamic theme transitions (Obsidian, Emerald, Platinum) or select your personal preference.
                </div>
              </li>
              <li className="row" style={{ gap: 12, alignItems: 'flex-start' }}>
                <span className="badge badge--success" style={{ marginTop: 2 }}><Icon name="check" size={14} /></span>
                <div>
                  <strong>Single-Tap Security Freeze:</strong> Suspicious activity? Freeze your card instantly without waiting on support calls.
                </div>
              </li>
              <li className="row" style={{ gap: 12, alignItems: 'flex-start' }}>
                <span className="badge badge--success" style={{ marginTop: 2 }}><Icon name="check" size={14} /></span>
                <div>
                  <strong>Custom Spend Limits:</strong> Set strict daily and monthly caps per card to prevent runaway recurring charges.
                </div>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Multi-Currency FX Converter Preview */}
      <section className="section">
        <div className="section-header">
          <span className="section-tag">TRANSPARENT FX</span>
          <h2 className="section-title">Instant Cross-Border Rates</h2>
          <p className="section-desc">
            Calculate instant conversion rates across major foreign currencies with zero hidden fees.
          </p>
        </div>

        <div className="converter-box">
          <div className="converter-input-group">
            <input
              type="number"
              className="converter-input"
              value={convertAmount}
              onChange={(e) => setConvertAmount(Math.max(1, Number(e.target.value)))}
            />
            <div className="converter-badge">
              <Icon name="globe" size={16} />
              USD
            </div>
          </div>

          <div className="row" style={{ justifyContent: 'center', margin: '12px 0' }}>
            <span className="badge badge--neutral" style={{ padding: '6px 12px' }}>
              <Icon name="arrowDownLeft" size={16} />
              Real-time Exchange Rate (1 USD = {fxRates[convertCurrency]} {convertCurrency})
            </span>
          </div>

          <div className="converter-input-group">
            <div className="converter-input" style={{ opacity: 0.9 }}>
              {convertedValue}
            </div>
            <select
              value={convertCurrency}
              onChange={(e) => setConvertCurrency(e.target.value as any)}
              style={{ background: 'transparent', border: 'none', fontWeight: 700, cursor: 'pointer', outline: 'none' }}
            >
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="USD">USD ($)</option>
            </select>
          </div>

          <div style={{ marginTop: 20, textAlign: 'center' }}>
            <Link to="/register" className="btn btn--brand btn--block btn--lg">
              Get This Rate & Open Account
            </Link>
          </div>
        </div>
      </section>

      {/* Enterprise & Admin Portal Solutions */}
      <section id="enterprise" className="section" style={{ background: 'var(--color-surface-2)', borderRadius: 'var(--radius-xl)' }}>
        <div className="section-header">
          <span className="section-tag">ENTERPRISE GOVERNANCE</span>
          <h2 className="section-title">Built-In Portal for Risk & Operations Management</h2>
          <p className="section-desc">
            Empower operations teams with granular role-based permissions, transaction limit controls, and automated approval workflows.
          </p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-card__icon">
              <Icon name="shield" size={24} />
            </div>
            <h4 className="feature-card__title">Approval Queues & Dual Control</h4>
            <p className="feature-card__text">
              High-value transactions and administrative overrides automatically enter an approval queue requiring secondary operational review.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-card__icon">
              <Icon name="users" size={24} />
            </div>
            <h4 className="feature-card__title">Customer & KYC Management</h4>
            <p className="feature-card__text">
              Review verification documents, inspect customer accounts, manage status flags, and adjust daily limits in real time.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-card__icon">
              <Icon name="receipt" size={24} />
            </div>
            <h4 className="feature-card__title">Real-Time Risk Auditing</h4>
            <p className="feature-card__text">
              Monitor system events, high-risk flags, security log alerts, and administrative actions with deep audit trail filtering.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="section">
        <div className="section-header">
          <span className="section-tag">FREQUENTLY ASKED QUESTIONS</span>
          <h2 className="section-title">Everything You Need to Know</h2>
        </div>

        <div className="faq-list">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={`faq-item ${openFaq === index ? 'faq-item--open' : ''}`}
            >
              <button
                className="faq-question"
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
              >
                <span>{faq.q}</span>
                <Icon name={openFaq === index ? 'chevronDown' : 'chevronRight'} size={18} />
              </button>
              {openFaq === index && <div className="faq-answer">{faq.a}</div>}
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="cta-banner">
          <h2 className="cta-banner__title">Ready to Experience Next-Gen Banking?</h2>
          <p className="cta-banner__text">
            Join thousands of users who trust 5ive for multi-currency accounts, instant global transfers, and intelligent payment cards.
          </p>
          <div className="row" style={{ justifyContent: 'center', gap: 16 }}>
            <Link to="/register" className="hero__cta-primary">
              Create Free Account
              <Icon name="arrowRight" size={18} />
            </Link>
            <Link to="/admin/login" className="hero__cta-secondary">
              Admin Portal
            </Link>
          </div>
        </div>
      </section>

      {/* Landing Footer */}
      <footer className="landing-footer">
        <div className="footer-container">
          <div>
            <div className="landing-nav__brand" style={{ marginBottom: 12 }}>
              <div className="landing-nav__logo">5</div>
              <div className="footer-brand__name">{BANK_NAME}</div>
            </div>
            <p className="footer-brand__tag">
              The next-generation digital banking operating system built for modern finance, instant settlement, and institutional security.
            </p>
          </div>

          <div>
            <div className="footer-title">Product</div>
            <ul className="footer-links">
              <li>
                <button className="footer-link" onClick={() => scrollToSection('#features')}>
                  Multi-Currency Accounts
                </button>
              </li>
              <li>
                <button className="footer-link" onClick={() => scrollToSection('#cards')}>
                  Virtual & Physical Cards
                </button>
              </li>
              <li>
                <button className="footer-link" onClick={() => scrollToSection('#features')}>
                  Global Transfers
                </button>
              </li>
              <li>
                <button className="footer-link" onClick={() => scrollToSection('#features')}>
                  Bill Payments
                </button>
              </li>
            </ul>
          </div>

          <div>
            <div className="footer-title">Security</div>
            <ul className="footer-links">
              <li>
                <button className="footer-link" onClick={() => scrollToSection('#security')}>
                  Tiered KYC Verification
                </button>
              </li>
              <li>
                <button className="footer-link" onClick={() => scrollToSection('#security')}>
                  2FA & PIN Protection
                </button>
              </li>
              <li>
                <button className="footer-link" onClick={() => scrollToSection('#security')}>
                  System Audit Logs
                </button>
              </li>
            </ul>
          </div>

          <div>
            <div className="footer-title">Access</div>
            <ul className="footer-links">
              <li>
                <Link to="/login" className="footer-link">
                  Customer Login
                </Link>
              </li>
              <li>
                <Link to="/register" className="footer-link">
                  Register Account
                </Link>
              </li>
              <li>
                <Link to="/admin/login" className="footer-link">
                  Admin Portal Login
                </Link>
              </li>
              <li>
                <a href={`mailto:${BANK_SUPPORT_EMAIL}`} className="footer-link">
                  {BANK_SUPPORT_EMAIL}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <div>© {new Date().getFullYear()} {BANK_NAME} Digital Banking Inc. All rights reserved.</div>
          <div className="row" style={{ gap: 20 }}>
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Security Compliance</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
