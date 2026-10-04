import type { ReactNode } from 'react';

import { Badge, Card, Text } from '@/components/ui';
import { showEnvironmentBadge } from '@/lib/env';
import { t } from '@/lib/i18n';
import styles from './auth.module.css';

/**
 * Moldura comum das telas sem login: entrar, esqueci minha senha e nova senha.
 * Mostra o logo, o nome do app e do painel e o selo de ambiente.
 */
export function AuthCard({ title, children }: { title?: string; children: ReactNode }) {
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
            {title ?? t('admin.panelName')}
          </Text>
          {showEnvironmentBadge && (
            <Badge tone="warning">{t('common.environment.development')}</Badge>
          )}
        </div>
        {children}
      </Card>
    </main>
  );
}
