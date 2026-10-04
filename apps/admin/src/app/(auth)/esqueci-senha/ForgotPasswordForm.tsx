'use client';

import type { PasswordResetRequestError } from '@gfg/core';
import { useActionState } from 'react';

import { Button, Input, Text } from '@/components/ui';
import { requestPasswordResetAction, type PasswordResetRequestState } from '@/lib/auth/actions';
import styles from '../auth.module.css';

/** Textos já traduzidos no servidor (este componente roda no navegador). */
export interface ForgotPasswordFormLabels {
  email: string;
  emailPlaceholder: string;
  submit: string;
  submitting: string;
  sent: string;
  errors: Record<PasswordResetRequestError, string>;
}

/** Formulário "esqueci minha senha": só o e-mail. O envio roda numa Server Action. */
export function ForgotPasswordForm({ labels }: { labels: ForgotPasswordFormLabels }) {
  const [state, formAction, pending] = useActionState<PasswordResetRequestState, FormData>(
    requestPasswordResetAction,
    { sent: false, error: null },
  );

  if (state.sent) {
    return (
      <Text tone="success" role="status" align="center">
        {labels.sent}
      </Text>
    );
  }

  return (
    <form className={styles.form} action={formAction} noValidate>
      {state.error && (
        <Text tone="danger" role="alert" align="center">
          {labels.errors[state.error]}
        </Text>
      )}
      <Input
        name="email"
        type="email"
        label={labels.email}
        autoComplete="email"
        placeholder={labels.emailPlaceholder}
        required
        maxLength={254}
      />
      <Button type="submit" fullWidth loading={pending}>
        {pending ? labels.submitting : labels.submit}
      </Button>
    </form>
  );
}
