import Icon from './Icon';
import { Surface } from './Card';

export interface ChartDatum {
  label: string;
  value: number;
  pct?: number;
  positive?: boolean;
}

export function BarList({ items, title, subtitle }: { items: ChartDatum[]; title: string; subtitle?: string }) {
  const max = Math.max(...items.map(i => i.value), 1);
  return (
    <Surface className="chart-card">
      <div className="page-header" style={{ marginBottom: 16 }}>
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 700 }}>{title}</h3>
          {subtitle && <p className="muted text-sm">{subtitle}</p>}
        </div>
      </div>
      <div className="chart-bars">
        {items.map(i => (
          <div key={i.label} className="chart-bar-row">
            <span className="chart-bar-row__label" title={i.label}>{i.label}</span>
            <div className="chart-bar-track" role="img" aria-label={`${i.label}: ${i.value}`}>
              <div className="chart-bar-fill" style={{ width: `${Math.max(((i.value || 0) / max) * 100, 3)}%` }} />
            </div>
            <span className="chart-bar-row__value">{i.value}</span>
          </div>
        ))}
      </div>
    </Surface>
  );
}

export interface StatProps {
  label: string;
  value: string;
  icon: string;
  tone?: 'default' | 'success' | 'danger' | 'warning' | 'brand';
  hint?: string;
}

export function StatCard({ label, value, icon, tone = 'default', hint }: StatProps) {
  return (
    <Surface className="stat-card">
      <div className={`stat-card__icon stat-card__icon--${tone}`}>
        <Icon name={icon} size={18} />
      </div>
      <div className="stat-card__body">
        <div className="stat-card__label">{label}</div>
        <div className="stat-card__value">{value}</div>
        {hint && <div className="stat-card__hint">{hint}</div>}
      </div>
    </Surface>
  );
}

export function SpendingDonut({ data, totalLabel }: {
  data: Array<{ label: string; value: number; color: string }>;
  totalLabel: string;
}) {
  const total = Math.max(data.reduce((s, d) => s + d.value, 0), 1);
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <Surface style={{ minWidth: 0 }}>
      <div className="page-header" style={{ marginBottom: 16 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700 }}>Spending</h3>
      </div>
      <div className="row row--wrap" style={{ gap: 24, alignItems: 'center' }}>
        <div className="donut-wrap" style={{ position: 'relative', flexShrink: 0 }}>
          <svg width={128} height={128} viewBox="0 0 128 128" role="img" aria-label="Spending breakdown">
            <circle cx={64} cy={64} r={radius} fill="none" stroke="var(--color-surface-2)" strokeWidth={16} />
            {data.map(d => {
              const len = (d.value / total) * circumference;
              const el = (
                <circle
                  key={d.label}
                  cx={64}
                  cy={64}
                  r={radius}
                  fill="none"
                  stroke={d.color}
                  strokeWidth={16}
                  strokeLinecap="round"
                  strokeDasharray={`${len} ${circumference - len}`}
                  strokeDashoffset={-offset}
                />
              );
              offset += len;
              return el;
            })}
          </svg>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span className="stat-card__value" style={{ fontSize: 18 }}>{totalLabel}</span>
            <span className="muted" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em' }}>total</span>
          </div>
        </div>
        <div className="stack stack--2" style={{ minWidth: 0, flex: 1 }}>
          {data.map(d => (
            <div key={d.label} className="row" style={{ gap: 8 }}>
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 3,
                  background: d.color,
                  flexShrink: 0,
                  display: 'inline-block',
                }}
              />
              <span className="muted text-sm flex-1">{d.label}</span>
              <span className="text-sm font-semibold tabular">
                {Math.round((d.value / total) * 100)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </Surface>
  );
}
