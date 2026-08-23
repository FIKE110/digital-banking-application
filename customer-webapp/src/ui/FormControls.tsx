import { forwardRef, useId, type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes, type ReactNode } from 'react';
import Icon from './Icon';

function FieldError({ error }: { error?: string }) {
  if (!error) return null;
  return (
    <span className="field__error" role="alert">
      <Icon name="alert" size={13} />
      {error}
    </span>
  );
}

function FieldHint({ hint }: { hint?: string }) {
  if (!hint) return null;
  return <span className="field__hint">{hint}</span>;
}

export interface FieldProps {
  label?: string;
  error?: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}

export function Field({ label, error, hint, children, className }: FieldProps) {
  const id = useId();
  return (
    <div className={`field ${className ?? ''}`}>
      {label && <label className="field__label" htmlFor={id}>{label}</label>}
      {children}
      {hint && <FieldHint hint={hint} />}
      <FieldError error={error} />
    </div>
  );
}

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  icon?: string;
  suffix?: string;
  action?: ReactNode;
  inputRef?: React.Ref<HTMLInputElement>;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error, icon, suffix, action, className, inputRef, ...rest }, ref) => (
    <div className={`input-group ${action ? 'input-group--action' : ''}`} style={{ width: '100%' }}>
      {icon && (
        <span className="input-group__icon">
          <Icon name={icon} size={17} />
        </span>
      )}
      <input
        ref={inputRef ?? ref}
        className={`input ${error ? 'input--invalid' : ''} ${icon ? '' : ''} ${className ?? ''}`}
        {...rest}
      />
      {suffix && <span className="input-suffix">{suffix}</span>}
      {action && <span className="input-group__action">{action}</span>}
    </div>
  )
);
Input.displayName = 'Input';

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement> & { error?: boolean }>(
  ({ error, className, ...rest }, ref) => (
    <select ref={ref} className={`select ${error ? 'select--invalid' : ''} ${className ?? ''}`} {...rest} />
  )
);
Select.displayName = 'Select';

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: boolean }>(
  ({ error, className, ...rest }, ref) => (
    <textarea ref={ref} className={`textarea ${error ? 'textarea--invalid' : ''} ${className ?? ''}`} {...rest} />
  )
);
Textarea.displayName = 'Textarea';
