import { forwardRef, type ButtonHTMLAttributes } from 'react';
import Icon from './Icon';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'danger-ghost' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  block?: boolean;
  icon?: string;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, block, icon, className, children, disabled, ...rest }, ref) => {
    const classes = [
      'btn',
      `btn--${variant}`,
      size !== 'md' && `btn--${size}`,
      block && 'btn--block',
      className,
    ].filter(Boolean).join(' ');

    return (
      <button ref={ref} className={classes} disabled={disabled || loading} {...rest}>
        {loading ? (
          <span className="btn__spinner" aria-hidden="true" />
        ) : icon ? (
          <Icon name={icon} size={17} />
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
export default Button;
