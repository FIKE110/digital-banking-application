import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import Icon from './Icon';

type ToastKind = 'success' | 'error' | 'info';

interface ToastItem {
  id: number;
  kind: ToastKind;
  message: string;
}

interface ToastContextValue {
  toast: (kind: ToastKind, message: string) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue>(null!);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = useCallback((kind: ToastKind, message: string) => {
    const id = ++idRef.current;
    setToasts(prev => [...prev.slice(-3), { id, kind, message }]);
    window.setTimeout(() => dismiss(id), 4200);
  }, [dismiss]);

  const value: ToastContextValue = {
    toast,
    success: useCallback((m: string) => toast('success', m), [toast]),
    error: useCallback((m: string) => toast('error', m), [toast]),
    info: useCallback((m: string) => toast('info', m), [toast]),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-viewport" aria-live="polite">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast--${t.kind}`} role="status">
            <span className="toast__icon">
              <Icon name={t.kind === 'success' ? 'checkCircle' : t.kind === 'error' ? 'alert' : 'info'} size={18} />
            </span>
            {t.message}
            <button
              className="dialog__close"
              style={{ marginLeft: 'auto', width: 24, height: 24 }}
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss notification"
            >
              <Icon name="x" size={13} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
