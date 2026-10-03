import { isSignInError, SIGN_IN_ERRORS, type SignInError } from '@gfg/core';
import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { Badge, Button, buttonClassName, Card, Input, Text } from '@/components/ui';
import { canUseDevelopmentSession, getAdminAccess } from '@/lib/auth';
import { isSupabaseAuthEnabled, serverEnv, showEnvironmentBadge } from '@/lib/env';
import { t } from '@/lib/i18n';
import { LoginForm } from './LoginForm';
import styles from './login.module.css';

// Depende da configuração de autenticação e da sessão, lidas a cada acesso.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: t('admin.login.title'),
};

interface LoginPageProps {
  searchParams: Promise<{ erro?: string | string[] }>;
}

/**
 * Tela de login do painel (ADR 0016).
 *
 * - `ADMIN_AUTH_MODE=supabase` (com URL e chave): formulário de e-mail e senha ativo.
 * - `ADMIN_AUTH_MODE=disabled`: formulário desativado + atalho de desenvolvimento
 *   (o atalho nunca aparece em produção — ADR 0006/0013).
 * Não há cadastro no painel; "esqueci minha senha" fica para a Etapa 1.3.
 */
export default async function LoginPage({ searchParams }: LoginPageProps) {
  // Quem já entrou com login real não precisa ver esta tela. (A sessão simulada de
  // desenvolvimento continua vendo a tela, com o atalho.)
  const access = await getAdminAccess();
  if (access.status === 'signed_in' && !access.session.isDevelopmentSession) {
    redirect('/dashboard');
  }

  const { erro } = await searchParams;
  const initialError: SignInError | null = isSignInError(erro) ? erro : null;

  const showDevelopmentShortcut = canUseDevelopmentSession();
  const authMisconfigured = serverEnv.authMode === 'supabase' && !isSupabaseAuthEnabled;

  const errors = Object.fromEntries(
    SIGN_IN_ERRORS.map((code) => [code, t(`admin.login.errors.${code}`)]),
  ) as Record<SignInError, string>;

  return (
    <main className={styles.page}>
      <Card className={styles.card}>
        <div className={styles.header}>
          <span className={styles.logo} aria-hidden="true">
            GF
          </span>
          <Text as="h1" variant="subtitle" align="center">
            {t('common.appName')}
          </Text>
          <Text tone="muted" align="center">
            {t('admin.panelName')}
          </Text>
          {showEnvironmentBadge && (
            <Badge tone="warning">{t('common.environment.development')}</Badge>
          )}
        </div>

        {isSupabaseAuthEnabled ? (
          <LoginForm
            initialError={initialError}
            labels={{
              email: t('admin.login.email'),
              emailPlaceholder: t('admin.login.emailPlaceholder'),
              password: t('admin.login.password'),
              submit: t('admin.login.submit'),
              submitting: t('admin.login.submitting'),
              errors,
            }}
          />
        ) : (
          <>
            <form className={styles.form} aria-describedby="login-notice">
              <Input
                name="email"
                type="email"
                label={t('admin.login.email')}
                autoComplete="email"
                placeholder={t('admin.login.emailPlaceholder')}
                disabled
              />
              <Input
                name="password"
                type="password"
                label={t('admin.login.password')}
                autoComplete="current-password"
                placeholder="••••••••"
                disabled
              />
              <Button type="submit" fullWidth disabled>
                {t('admin.login.submit')}
              </Button>
            </form>

            <Text id="login-notice" variant="caption" tone="muted" align="center">
              {authMisconfigured ? t('admin.login.noticeNotConfigured') : t('admin.login.notice')}
            </Text>
          </>
        )}

        {showDevelopmentShortcut && (
          <Link
            className={buttonClassName({
              variant: 'secondary',
              fullWidth: true,
              className: styles.devLink,
            })}
            href="/dashboard"
          >
            {t('admin.login.devLink')}
          </Link>
        )}
      </Card>
    </main>
  );
}
