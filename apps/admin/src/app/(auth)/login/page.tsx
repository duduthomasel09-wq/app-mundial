import type { Metadata } from 'next';
import Link from 'next/link';

import { Badge, Button, buttonClassName, Card, Input, Text } from '@/components/ui';
import { canUseDevelopmentSession } from '@/lib/auth';
import { showEnvironmentBadge } from '@/lib/env';
import { t } from '@/lib/i18n';
import styles from './login.module.css';

// Depende da configuração de autenticação do servidor, lida a cada acesso.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: t('admin.login.title'),
};

/**
 * Tela de login — apenas a estrutura visual.
 * O envio do formulário será ligado ao Supabase Auth numa etapa futura.
 */
export default function LoginPage() {
  // O atalho sem login nunca aparece em produção (ADR 0006/0013).
  const showDevelopmentShortcut = canUseDevelopmentSession();

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
          {t('admin.login.notice')}
        </Text>

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
