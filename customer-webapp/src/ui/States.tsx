import type { ReactNode } from 'react';
import Icon from './Icon';
import Button from './Button';

export function EmptyState({ icon = 'info', title, body, action, actionLabel }: {
  icon?: string;
  title: string;
  body?: ReactNode;
  action?: () => void;
  actionLabel?: string;
}) {
  return (
    <div className="state">
      <div className="state__icon">
        <Icon name={icon} size={26} />
      </div>
      <div>
        <div className="state__title">{title}</div>
        {body && <div className="state__body">{body}</div>}
      </div>
      {action && actionLabel && (
        <Button variant="secondary" size="sm" onClick={action}>{actionLabel}</Button>
      )}
    </div>
  );
}

export function ErrorState({ title = 'Something went wrong', body, onRetry }: {
  title?: string;
  body?: ReactNode;
  onRetry?: () => void;
}) {
  return (
    <div className="state">
      <div className="state__icon state__icon--error">
        <Icon name="alert" size={26} />
      </div>
      <div>
        <div className="state__title">{title}</div>
        {body && <div className="state__body">{body}</div>}
      </div>
      {onRetry && <Button variant="secondary" size="sm" onClick={onRetry}>Try again</Button>}
    </div>
  );
}
