import type { InputHTMLAttributes } from 'react';

import { cx } from './cx';
import { Text } from './Text';
import styles from './ui.module.css';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Nome do campo — obrigatório (liga a mensagem de erro/dica ao campo). */
  name: string;
  /** Rótulo mostrado acima do campo. */
  label: string;
  /** Mensagem de erro: deixa a borda vermelha e aparece abaixo do campo. */
  error?: string;
  /** Dica mostrada abaixo do campo quando não há erro. */
  hint?: string;
}

export function Input({ name, label, error, hint, disabled, className, ...props }: InputProps) {
  const message = error ?? hint;
  const messageId = message ? `${name}-message` : undefined;

  return (
    <div className={styles.field} data-disabled={disabled || undefined}>
      <label className={styles.field}>
        <Text as="span" variant="label">
          {label}
        </Text>
        <input
          name={name}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={messageId}
          className={cx(styles.input, error && styles.inputError, className)}
          {...props}
        />
      </label>
      {message && (
        <Text
          as="span"
          id={messageId}
          variant="caption"
          tone={error ? 'danger' : 'muted'}
          role={error ? 'alert' : undefined}
        >
          {message}
        </Text>
      )}
    </div>
  );
}
