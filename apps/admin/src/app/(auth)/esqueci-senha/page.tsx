import {
  isRecoveryLinkError,
  PASSWORD_RESET_REQUEST_ERRORS,
  type PasswordResetRequestError,
} from '@gfg/core';
import type { Metadata } from 'next';
import Link from 'next/link';

import { Text } from '@/components/ui';
import { isPasswordRecoveryEnabled } from '@/lib/env';
import { t } from '@/lib/i18n';
import { AuthCard } from '../AuthCard';
import styles from '../auth.module.css';
import { ForgotPasswordForm } from './ForgotPasswordForm';

// Depende da configuração do servidor: lida a cada acesso.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: t('admin.forgotPassword.title'),
};

interface ForgotPasswordPageProps {
  searchParams: Promise<{ erro?: string | string[] }>;
}

/**
 * "Esqueci minha senha" (ADR 0017). Pede o e-mail e envia o link de recuperação.
 * Com `?erro=link_invalid` (link vencido, usado ou adulterado), explica o problema e
 * oferece pedir outro link no mesmo formulário.
 */
export default async function ForgotPasswordPage({ searchParams }: ForgotPasswordPageProps) {
  const { erro } = await searchParams;
  const linkInvalid = isRecoveryLinkError(erro);

  const errors = Object.fromEntries(
    PASSWORD_RESET_REQUEST_ERRORS.map((code) => [code, t(`admin.forgotPassword.errors.${code}`)]),
  ) as Record<PasswordResetRequestError, string>;

  return (
    <AuthCard title={t('admin.forgotPassword.title')}>
      {isPasswordRecoveryEnabled ? (
        <>
          {linkInvalid ? (
            <Text tone="danger" role="alert" align="center">
              {t('admin.forgotPassword.linkInvalid')}
            </Text>
          ) : (
            <Text tone="muted" align="center">
              {t('admin.forgotPassword.intro')}
            </Text>
          )}
          <ForgotPasswordForm
            labels={{
              email: t('admin.login.email'),
              emailPlaceholder: t('admin.login.emailPlaceholder'),
              submit: t('admin.forgotPassword.submit'),
              submitting: t('admin.forgotPassword.submitting'),
              sent: t('admin.forgotPassword.sent'),
              errors,
            }}
          />
        </>
      ) : (
        <Text tone="muted" align="center">
          {t('admin.forgotPassword.unavailable')}
        </Text>
      )}

      <div className={styles.links}>
        <Link className={styles.link} href="/login">
          {t('admin.forgotPassword.backToLogin')}
        </Link>
      </div>
    </AuthCard>
  );
}
