import type { ReactNode } from 'react';
import Icon from './Icon';

export type BadgeTone = 'success' | 'danger' | 'warning' | 'info' | 'neutral' | 'brand';

const STATUS_TONE: Record<string, BadgeTone> = {
  ACTIVE: 'success',
  COMPLETED: 'success',
  VERIFIED: 'success',
  FROZEN: 'warning',
  REVERSED: 'warning',
  PENDING: 'warning',
  FAILED: 'danger',
  CLOSED: 'neutral',
  REVERSAL: 'neutral',
  EXPIRED: 'danger',
};

const STATUS_LABEL: Record<string, string> = {
  REVERSAL: 'REVERSED',
  PENDING: 'PENDING',
};

export default function Badge({ tone = 'neutral', children }: { tone?: BadgeTone; children: ReactNode }) {
  return <span className={`badge badge--${tone}`}>{children}</span>;
}

export function StatusBadge({ status }: { status: string }) {
  const normalized = (status || '').toUpperCase();
  return (
    <Badge tone={STATUS_TONE[normalized] ?? 'neutral'}>
      {STATUS_LABEL[normalized] ?? normalized}
    </Badge>
  );
}

export function TypeBadge({ type }: { type: string }) {
  const isCredit = type.toUpperCase() === 'CREDIT';
  return (
    <Badge tone={isCredit ? 'success' : 'danger'}>
      <Icon name={isCredit ? 'arrowDownLeft' : 'arrowUpRight'} size={11} />
      {type.toUpperCase()}
    </Badge>
  );
}
