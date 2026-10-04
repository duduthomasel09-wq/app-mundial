import {
  isSignInError,
  isSignInNotice,
  SIGN_IN_ERRORS,
  type SignInError,
  type SignInNotice,
} from '@gfg/core';
import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { Button, buttonClassName, Input, Text } from '@/components/ui';
import { canUseDevelopmentSession, getAdminAccess } from '@/lib/auth';
import { isPasswordRecoveryEnabled, isSupabaseAuthEnabled, serverEnv } from '@/lib/env';
import { t } from '@/lib/i18n';
import { AuthCard } from '../AuthCard';
import styles from '../auth.module.css';
import { LoginForm } from './LoginForm';

// Depende da configuração de autenticação e da sessão, lidas a cada acesso.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: t('admin.login.title'),
};

interface LoginPageProps {
  searchParams: Promise<{ erro?: string | string[]; aviso?: string | string[] }>;
}

/**
 * Tela de login do painel (ADR 0016 e ADR 0017).
 *
 * - `ADMIN_AUTH_MODE=supabase` (com URL e chave): formulário de e-mail e senha ativo e
 *   link "Esqueci minha senha".
 * - `ADMIN_AUTH_MODE=disabled`: formulário desativado + atalho de desenvolvimento
 *   (o atalho só aparece em development — ADR 0017).
 * Não há cadastro no painel. Erros e avisos da URL só aceitam códigos de listas fixas.
 */
export default async function LoginPage({ searchParams }: LoginPageProps) {
  // Quem já entrou com login real não precisa ver esta tela. (A sessão simulada de
  // desenvolvimento continua vendo a tela, com o atalho.)
  const access = await getAdminAccess();
  if (access.status === 'signed_in' && !access.session.isDevelopmentSession) {
    redirect('/dashboard');
  }

  const { erro, aviso } = await searchParams;
  const initialError: SignInError | null = isSignInError(erro) ? erro : null;
  const notice: SignInNotice | null = isSignInNotice(aviso) ? aviso : null;

  const showDevelopmentShortcut = canUseDevelopmentSession();
  const authMisconfigured = serverEnv.authMode === 'supabase' && !isSupabaseAuthEnabled;

  const errors = Object.fromEntries(
    SIGN_IN_ERRORS.map((code) => [code, t(`admin.login.errors.${code}`)]),
  ) as Record<SignInError, string>;

  return (
    <AuthCard>
      {isSupabaseAuthEnabled ? (
        <>
          <LoginForm
            initialError={initialError}
            notice={notice ? t(`admin.login.notices.${notice}`) : null}
            labels={{
              email: t('admin.login.email'),
              emailPlaceholder: t('admin.login.emailPlaceholder'),
              password: t('admin.login.password'),
              submit: t('admin.login.submit'),
              submitting: t('admin.login.submitting'),
              errors,
            }}
          />
          {isPasswordRecoveryEnabled && (
            <div className={styles.links}>
              <Link className={styles.link} href="/esqueci-senha">
                {t('admin.login.forgotPassword')}
              </Link>
            </div>
          )}
        </>
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
    </AuthCard>
  );
}
