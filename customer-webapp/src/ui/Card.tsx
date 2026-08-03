import type { HTMLAttributes, ReactNode } from 'react';

export function Surface({ className, children, ...rest }: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return (
    <div className={`surface ${className ?? ''}`} {...rest}>
      {children}
    </div>
  );
}

export function SurfaceHeader({ title, subtitle, actions }: { title: ReactNode; subtitle?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="page-header" style={{ marginBottom: 16 }}>
      <div>
        <h2 style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.01em' }}>{title}</h2>
        {subtitle && <p className="muted text-sm" style={{ marginTop: 2 }}>{subtitle}</p>}
      </div>
      {actions && <div className="row">{actions}</div>}
    </div>
  );
}

export function PageHeader({ title, subtitle, actions }: { title: ReactNode; subtitle?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="page-header">
      <div>
        <h1 className="page-header__title">{title}</h1>
        {subtitle && <p className="page-header__subtitle">{subtitle}</p>}
      </div>
      {actions && <div className="row row--wrap">{actions}</div>}
    </div>
  );
}
