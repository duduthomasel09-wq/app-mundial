import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';

import { Sidebar } from '@/components/Sidebar';
import { navigation } from '@/config/navigation';
import { getAdminAccess } from '@/lib/auth';
import { showEnvironmentBadge } from '@/lib/env';
import { t } from '@/lib/i18n';
import styles from './painel.module.css';

// A sessão é verificada a cada acesso (nunca gerar esta área como página estática).
export const dynamic = 'force-dynamic';

/**
 * Layout das áreas internas do painel (menu lateral + conteúdo).
 * Toda página dentro de `(painel)` exige login com papel `editor` ou `admin`,
 * verificado no servidor a cada acesso.
 */
export default async function PainelLayout({ children }: { children: ReactNode }) {
  const access = await getAdminAccess();

  // Login válido, mas sem papel editor/admin: encerra a sessão e avisa (ADR 0016).
  if (access.status === 'forbidden') redirect('/sem-permissao');
  if (access.status !== 'signed_in') redirect('/login');

  const { session } = access;

  return (
    <div className={styles.shell}>
      <Sidebar
        items={navigation.map((item) => ({ ...item, label: t(`admin.nav.${item.key}`) }))}
        labels={{
          appName: t('common.appName'),
          panelName: t('admin.panelName'),
          menu: t('admin.nav.label'),
          comingSoon: t('common.comingSoon'),
          devMode: t('admin.sidebar.devMode'),
          signOut: t('admin.sidebar.signOut'),
          role: t(`admin.roles.${session.user.role}`),
          environment: showEnvironmentBadge ? t('common.environment.development') : undefined,
        }}
        userName={session.user.name}
        userEmail={session.user.email}
        isDevelopmentSession={session.isDevelopmentSession}
      />
      <main className={styles.content}>{children}</main>
    </div>
  );
}
