import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';

import { Sidebar } from '@/components/Sidebar';
import { getAdminSession } from '@/lib/auth';
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
      <Sidebar userName={session.user.name} isDevelopmentSession={session.isDevelopmentSession} />
      <main className={styles.content}>{children}</main>
    </div>
  );
}
