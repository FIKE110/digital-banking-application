import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../ui/Theme';
import Icon from '../ui/Icon';
import { BANK_NAME, BANK_SUPPORT_EMAIL } from '../config';

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

      const globeCenterX = width * 0.72;
      const globeCenterY = height * 0.5;
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
      const globeCenterX = width * 0.72;
      const globeCenterY = height * 0.5;

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

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.querySelector(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const fxRates = {
    USD: 1.0,
    EUR: 0.92,
    GBP: 0.79,
  };
  const convertedValue = (convertAmount * fxRates[convertCurrency]).toFixed(2);

  const faqs = [
    {
      q: 'How do I open an account?',
      a: 'Right here in the app. Sign up with your email, pick a savings or checking account, and you are done. Your account number is generated instantly and you can start receiving money immediately.',
    },
    {
      q: 'Is my money safe?',
      a: 'Your money stays in your account and only you can move it. Every transfer requires your 4-digit security PIN, logins are protected, and automated checks flag anything that looks unusual.',
    },
    {
      q: 'Can I freeze my card?',
      a: 'Yes. Open any card in the app and tap Freeze. It stops all spending instantly, and you can unfreeze it whenever you like. No phone calls, no waiting.',
    },
    {
      q: 'What are the KYC tiers?',
      a: 'You start on a basic tier that covers everyday transfers. As you verify your identity with your BVN or NIN in the app, your daily limits increase automatically.',
    },
  ];

  return (
    <div className="landing">
      {/* Fixed Topbar Navigation */}
      <header className="landing-nav">
        <Link to="/" className="landing-nav__brand">
          <div className="landing-nav__logo">5</div>
          <div className="landing-nav__title">{BANK_NAME}</div>
        </Link>

        <ul className="landing-nav__links">
          <li>
            <button className="landing-nav__link" onClick={() => scrollToSection('#features')}>
              Features
            </button>
          </li>
          <li>
            <button className="landing-nav__link" onClick={() => scrollToSection('#security')}>
              Security
            </button>
          </li>
          <li>
            <button className="landing-nav__link" onClick={() => scrollToSection('#cards')}>
              Cards
            </button>
          </li>
          <li>
            <button className="landing-nav__link" onClick={() => scrollToSection('#business')}>
              Business
            </button>
          </li>
          <li>
            <button className="landing-nav__link" onClick={() => scrollToSection('#faq')}>
              FAQ
            </button>
          </li>
        </ul>

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

        <button
          className="landing-nav__toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle mobile menu"
        >
          <Icon name={mobileMenuOpen ? 'x' : 'menu'} size={24} />
        </button>

        {mobileMenuOpen && (
          <div className="landing-nav__links--mobile">
            <button className="landing-nav__link" onClick={() => scrollToSection('#features')}>
              Features
            </button>
            <button className="landing-nav__link" onClick={() => scrollToSection('#security')}>
              Security
            </button>
            <button className="landing-nav__link" onClick={() => scrollToSection('#cards')}>
              Cards
            </button>
            <button className="landing-nav__link" onClick={() => scrollToSection('#business')}>
              Business
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
        <canvas ref={canvasRef} className="hero__canvas-bg" />
        <div className="hero__container">
          <div>
            <h1 className="hero__title">
              Banking that keeps up <span className="hero__title-accent">with your life.</span>
            </h1>

            <p className="hero__subtitle">
              Open a savings or checking account in minutes. Send money instantly, pay your bills,
              and manage virtual cards. All from one app, without stepping into a branch.
            </p>

            <div className="hero__ctas">
              <Link to="/register" className="hero__cta-primary">
                Open a free account
                <Icon name="arrowRight" size={18} />
              </Link>
              <Link to={user ? '/dashboard' : '/login'} className="hero__cta-secondary">
                Sign in
              </Link>
            </div>

            <div className="hero__trust">
              <span className="hero__trust-item">
                <Icon name="check" size={15} />
                Accounts in minutes
              </span>
              <span className="hero__trust-item">
                <Icon name="check" size={15} />
                Instant transfers
              </span>
              <span className="hero__trust-item">
                <Icon name="check" size={15} />
                24/7 support
              </span>
            </div>
          </div>

          {/* Product Mockup */}
          <div className="hero__visual">
            <div className="phone-mock">
              <div className="phone-mock__bar">
                <span className="phone-mock__brand">
                  <span className="phone-mock__logo">5</span>
                  {BANK_NAME}
                </span>
                <span className="phone-mock__avatar">AM</span>
              </div>

              <div className="balance-card">
                <div className="balance-card__label">Available balance</div>
                <div className="balance-card__amount">₦1,284,500.00</div>
                <div className="balance-card__row">
                  <span>•••• 4412</span>
                  <span className="balance-card__tag">Active</span>
                </div>
              </div>

              <div className="tx-list">
                <div className="tx-row">
                  <span className="tx-row__icon tx-row__icon--in">
                    <Icon name="arrowDownLeft" size={15} />
                  </span>
                  <div className="tx-row__main">
                    <div className="tx-row__name">Salary deposit</div>
                    <div className="tx-row__time">Today · 09:14</div>
                  </div>
                  <div className="tx-row__amt tx-row__amt--in">+₦850,000</div>
                </div>

                <div className="tx-row">
                  <span className="tx-row__icon tx-row__icon--out">
                    <Icon name="arrowUpRight" size={15} />
                  </span>
                  <div className="tx-row__main">
                    <div className="tx-row__name">Transfer to Chidi</div>
                    <div className="tx-row__time">Yesterday · 18:02</div>
                  </div>
                  <div className="tx-row__amt tx-row__amt--out">−₦25,000</div>
                </div>

                <div className="tx-row">
                  <span className="tx-row__icon tx-row__icon--out">
                    <Icon name="zap" size={15} />
                  </span>
                  <div className="tx-row__main">
                    <div className="tx-row__name">Electricity bill</div>
                    <div className="tx-row__time">Mon · 08:30</div>
                  </div>
                  <div className="tx-row__amt tx-row__amt--out">−₦12,500</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Section */}
      <section id="features" className="section">
        <div className="section-header">
          <span className="section-tag">Everything in one app</span>
          <h2 className="section-title">The basics, done properly</h2>
          <p className="section-desc">
            No branches, no queues, no paperwork. Just the everyday banking tools you actually use,
            built to work the way you expect.
          </p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-card__icon">
              <Icon name="wallet" size={22} />
            </div>
            <h3 className="feature-card__title">Bank accounts</h3>
            <p className="feature-card__text">
              Open savings and checking accounts in minutes. Your account number is generated
              instantly. Share it and start receiving money right away.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-card__icon">
              <Icon name="send" size={22} />
            </div>
            <h3 className="feature-card__title">Transfers</h3>
            <p className="feature-card__text">
              Send money to any 5ive account in seconds, confirmed with your security PIN. Every
              transfer gets a receipt you can download.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-card__icon">
              <Icon name="card" size={22} />
            </div>
            <h3 className="feature-card__title">Cards</h3>
            <p className="feature-card__text">
              Virtual cards, ready the moment you create them. Set your own daily and monthly
              limits, and freeze a card in a single tap.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-card__icon">
              <Icon name="zap" size={22} />
            </div>
            <h3 className="feature-card__title">Bills</h3>
            <p className="feature-card__text">
              Pay electricity, data, airtime, and TV subscriptions without leaving the app. Digital
              receipts land in your transaction history automatically.
            </p>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section id="security" className="section">
        <div className="section-header">
          <span className="section-tag">How we keep your money safe</span>
          <h2 className="section-title">Security you can feel, not just read about</h2>
          <p className="section-desc">
            Four simple measures that protect every account, every login, and every payment.
          </p>
        </div>

        <div className="security-grid">
          <div className="security-item">
            <div className="security-item__icon">
              <Icon name="fingerprint" size={20} />
            </div>
            <div>
              <h4>Verify once, move freely</h4>
              <p>
                Start with a basic tier and unlock higher limits as you complete your KYC. BVN and
                NIN verification happen right in the app.
              </p>
            </div>
          </div>

          <div className="security-item">
            <div className="security-item__icon">
              <Icon name="lock" size={20} />
            </div>
            <div>
              <h4>A PIN for every payment</h4>
              <p>
                Every transfer and payment needs your 4-digit security PIN. Nobody moves your money
                without your say-so.
              </p>
            </div>
          </div>

          <div className="security-item">
            <div className="security-item__icon">
              <Icon name="shield" size={20} />
            </div>
            <div>
              <h4>Unusual activity gets flagged</h4>
              <p>
                Automated checks watch for odd amounts, new devices, and strange locations before
                anything goes through.
              </p>
            </div>
          </div>

          <div className="security-item">
            <div className="security-item__icon">
              <Icon name="receipt" size={20} />
            </div>
            <div>
              <h4>Everything is recorded</h4>
              <p>
                Logins, card changes, balance updates, admin actions. All logged with timestamps, so
                there is always an audit trail.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Card Showcase */}
      <section id="cards" className="section">
        <div className="section-header">
          <span className="section-tag">Cards you control</span>
          <h2 className="section-title">A card that works the way you want</h2>
          <p className="section-desc">
            Pick a style, set your own limits, and freeze the card the moment something feels off.
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
                  title="Emerald"
                />
                <button
                  className={`color-dot ${cardColor === 'platinum' ? 'color-dot--active' : ''}`}
                  style={{ background: '#2c3e50' }}
                  onClick={() => setCardColor('platinum')}
                  title="Platinum"
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
            <h3 style={{ fontSize: 21, fontWeight: 800, marginBottom: 16 }}>
              Virtual cards for subscriptions, shopping, and everyday spend
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <li className="row" style={{ gap: 12, alignItems: 'flex-start' }}>
                <span className="badge badge--success" style={{ marginTop: 2 }}><Icon name="check" size={14} /></span>
                <div>
                  <strong>Pick your look.</strong> Obsidian, emerald, or platinum. Choose a style
                  that feels like yours.
                </div>
              </li>
              <li className="row" style={{ gap: 12, alignItems: 'flex-start' }}>
                <span className="badge badge--success" style={{ marginTop: 2 }}><Icon name="check" size={14} /></span>
                <div>
                  <strong>Freeze in a tap.</strong> See something suspicious? Freeze the card
                  instantly. Nothing goes through until you unfreeze it.
                </div>
              </li>
              <li className="row" style={{ gap: 12, alignItems: 'flex-start' }}>
                <span className="badge badge--success" style={{ marginTop: 2 }}><Icon name="check" size={14} /></span>
                <div>
                  <strong>Set your own limits.</strong> Daily and monthly spend caps per card,
                  changed any time you like.
                </div>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* FX Converter */}
      <section className="section">
        <div className="section-header">
          <span className="section-tag">Rates without surprises</span>
          <h2 className="section-title">See what your money converts to</h2>
          <p className="section-desc">
            Estimate a conversion across major currencies. Live rates are always shown in the app
            before you confirm anything.
          </p>
        </div>

        <div className="converter-box">
          <div className="converter-note">Indicative rate · 1 USD = {fxRates[convertCurrency]} {convertCurrency}</div>

          <div className="converter-input-group">
            <input
              type="number"
              className="converter-input"
              value={convertAmount}
              onChange={(e) => setConvertAmount(Math.max(1, Number(e.target.value)))}
            />
            <div className="converter-badge">
              <Icon name="globe" size={15} />
              USD
            </div>
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

          <div style={{ marginTop: 20 }}>
            <Link to="/register" className="btn btn--brand btn--block btn--lg">
              Open an account
              <Icon name="arrowRight" size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Business / Admin Section */}
      <section id="business" className="section">
        <div className="section-header">
          <span className="section-tag">For teams and admins</span>
          <h2 className="section-title">Built for operations teams too</h2>
          <p className="section-desc">
            A dedicated portal for day-to-day risk and operations management, without bolt-on tools.
          </p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-card__icon">
              <Icon name="shield" size={20} />
            </div>
            <h3 className="feature-card__title">Double-entry ledger</h3>
            <p className="feature-card__text">
              Every deposit, interest credit, transfer and admin adjustment posts balanced debit and
              credit entries, with an immutable audit trail.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-card__icon">
              <Icon name="users" size={20} />
            </div>
            <h3 className="feature-card__title">Customer & KYC management</h3>
            <p className="feature-card__text">
              Review verification documents, inspect customer accounts, manage status flags, and
              adjust daily limits in real time.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-card__icon">
              <Icon name="receipt" size={20} />
            </div>
            <h3 className="feature-card__title">Audit trail</h3>
            <p className="feature-card__text">
              Monitor system events, security alerts, and admin actions with a deep, filterable
              audit trail.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="section">
        <div className="section-header">
          <span className="section-tag">Questions, answered</span>
          <h2 className="section-title">Before you ask</h2>
        </div>

        <div className="faq-list">
          {faqs.map((faq, index) => (
            <div key={index} className={`faq-item ${openFaq === index ? 'faq-item--open' : ''}`}>
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
          <h2 className="cta-banner__title">Ready when you are</h2>
          <p className="cta-banner__text">
            Open your {BANK_NAME} account today. It takes a couple of minutes, and you can start
            sending money right away.
          </p>
          <div className="row" style={{ justifyContent: 'center', gap: 16 }}>
            <Link to="/register" className="hero__cta-primary">
              Create free account
              <Icon name="arrowRight" size={18} />
            </Link>
            <Link to="/admin/login" className="hero__cta-secondary">
              Admin portal
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
              Digital banking for everyday life. Accounts, transfers, cards, and bills, all in one
              app.
            </p>
          </div>

          <div>
            <div className="footer-title">Product</div>
            <ul className="footer-links">
              <li>
                <button className="footer-link" onClick={() => scrollToSection('#features')}>
                  Bank accounts
                </button>
              </li>
              <li>
                <button className="footer-link" onClick={() => scrollToSection('#cards')}>
                  Cards
                </button>
              </li>
              <li>
                <button className="footer-link" onClick={() => scrollToSection('#features')}>
                  Transfers
                </button>
              </li>
              <li>
                <button className="footer-link" onClick={() => scrollToSection('#features')}>
                  Bill payments
                </button>
              </li>
            </ul>
          </div>

          <div>
            <div className="footer-title">Security</div>
            <ul className="footer-links">
              <li>
                <button className="footer-link" onClick={() => scrollToSection('#security')}>
                  KYC verification
                </button>
              </li>
              <li>
                <button className="footer-link" onClick={() => scrollToSection('#security')}>
                  PIN protection
                </button>
              </li>
              <li>
                <button className="footer-link" onClick={() => scrollToSection('#security')}>
                  Audit logs
                </button>
              </li>
            </ul>
          </div>

          <div>
            <div className="footer-title">Access</div>
            <ul className="footer-links">
              <li>
                <Link to="/login" className="footer-link">
                  Customer login
                </Link>
              </li>
              <li>
                <Link to="/register" className="footer-link">
                  Register account
                </Link>
              </li>
              <li>
                <Link to="/admin/login" className="footer-link">
                  Admin portal
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
          <div>© {new Date().getFullYear()} {BANK_NAME} Digital Banking. All rights reserved.</div>
          <div className="row" style={{ gap: 20 }}>
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Security</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
