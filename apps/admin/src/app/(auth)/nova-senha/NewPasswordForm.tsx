'use client';

import type { NewPasswordError, PasswordUpdateError } from '@gfg/core';
import { useActionState } from 'react';

import { Button, Input, Text } from '@/components/ui';
import { updatePasswordAction, type NewPasswordState } from '@/lib/auth/actions';
import styles from '../auth.module.css';

/** Textos já traduzidos no servidor (este componente roda no navegador). */
export interface NewPasswordFormLabels {
  password: string;
  confirmation: string;
  hint: string;
  submit: string;
  submitting: string;
  errors: Record<NewPasswordError | PasswordUpdateError, string>;
}

/** Formulário de nova senha + confirmação. A troca roda numa Server Action. */
export function NewPasswordForm({ labels }: { labels: NewPasswordFormLabels }) {
  const [state, formAction, pending] = useActionState<NewPasswordState, FormData>(
    updatePasswordAction,
    { error: null },
  );

  return (
    <form className={styles.form} action={formAction} noValidate>
      {state.error && (
        <Text tone="danger" role="alert" align="center">
          {labels.errors[state.error]}
        </Text>
      )}
      <Input
        name="password"
        type="password"
        label={labels.password}
        autoComplete="new-password"
        hint={labels.hint}
        required
        minLength={8}
      />
      <Input
        name="confirmation"
        type="password"
        label={labels.confirmation}
        autoComplete="new-password"
        required
        minLength={8}
      />
      <Button type="submit" fullWidth loading={pending}>
        {pending ? labels.submitting : labels.submit}
      </Button>
    </form>
  );
}
