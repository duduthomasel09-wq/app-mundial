'use client';

import type { SignInError } from '@gfg/core';
import { useActionState } from 'react';

import { Button, Input, Text } from '@/components/ui';
import { signInAction, type SignInState } from '@/lib/auth/actions';
import styles from './login.module.css';

/** Textos já traduzidos no servidor (este componente roda no navegador). */
export interface LoginFormLabels {
  email: string;
  emailPlaceholder: string;
  password: string;
  submit: string;
  submitting: string;
  errors: Record<SignInError, string>;
}

interface LoginFormProps {
  labels: LoginFormLabels;
  /** Erro vindo de um redirecionamento (ex.: sessão encerrada por falta de permissão). */
  initialError: SignInError | null;
}

/** Formulário de login (e-mail + senha). O envio roda numa Server Action. */
export function LoginForm({ labels, initialError }: LoginFormProps) {
  const [state, formAction, pending] = useActionState<SignInState, FormData>(signInAction, {
    error: initialError,
  });

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
      <Input
        name="password"
        type="password"
        label={labels.password}
        autoComplete="current-password"
        placeholder="••••••••"
        required
        maxLength={72}
      />
      <Button type="submit" fullWidth loading={pending}>
        {pending ? labels.submitting : labels.submit}
      </Button>
    </form>
  );
}
