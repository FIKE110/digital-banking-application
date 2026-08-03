import { useEffect, useRef, type ReactNode } from 'react';
import Icon from './Icon';

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  subtitle?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
}

export default function Dialog({ open, onClose, title, subtitle, children, footer }: DialogProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);

  useEffect(() => {
    if (open && !wasOpen.current) {
      closeRef.current?.focus();
    }
    wasOpen.current = open;
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="dialog-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label={typeof title === 'string' ? title : undefined}
    >
      <div className="dialog">
        <div className="dialog__header">
          <div>
            <div className="dialog__title">{title}</div>
            {subtitle && <div className="dialog__subtitle">{subtitle}</div>}
          </div>
          <button ref={closeRef} className="dialog__close" onClick={onClose} aria-label="Close dialog">
            <Icon name="x" size={16} />
          </button>
        </div>
        {children && <div className="dialog__body">{children}</div>}
        {footer && <div className="dialog__footer">{footer}</div>}
      </div>
    </div>
  );
}
