import type { ButtonVariant } from '@gfg/ui';
import type { ButtonHTMLAttributes } from 'react';

import { cx } from './cx';
import styles from './ui.module.css';

interface ButtonStyleOptions {
  variant?: ButtonVariant;
  fullWidth?: boolean;
  className?: string;
}

/** Classes do botão — também servem para deixar um link com aparência de botão. */
export function buttonClassName({
  variant = 'primary',
  fullWidth = false,
  className,
}: ButtonStyleOptions = {}): string {
  return cx(styles.button, styles[`variant-${variant}`], fullWidth && styles.fullWidth, className);
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, ButtonStyleOptions {
  /** Mostra um indicador de carregamento e bloqueia novos cliques. */
  loading?: boolean;
}

export function Button({
  variant,
  fullWidth,
  loading = false,
  disabled,
  className,
  type = 'button',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClassName({ variant, fullWidth, className })}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && <span className={styles.spinner} aria-hidden="true" />}
      {children}
    </button>
  );
}
