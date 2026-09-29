import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';

import { Sidebar } from '@/components/Sidebar';
import { navigation } from '@/config/navigation';
import { getAdminSession } from '@/lib/auth';
import { showEnvironmentBadge } from '@/lib/env';
import { t } from '@/lib/i18n';
import styles from './painel.module.css';

// A sessão é verificada a cada acesso (nunca gerar esta área como página estática).
export const dynamic = 'force-dynamic';

/**
 * Layout das áreas internas do painel (menu lateral + conteúdo).
 * Toda página dentro de `(painel)` exige uma sessão de administrador.
 */
export default async function PainelLayout({ children }: { children: ReactNode }) {
  const session = await getAdminSession();

  if (!session) {
    redirect('/login');
  }

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
          environment: showEnvironmentBadge ? t('common.environment.development') : undefined,
        }}
        userName={session.user.name}
        isDevelopmentSession={session.isDevelopmentSession}
      />
      <main className={styles.content}>{children}</main>
    </div>
  );
}
