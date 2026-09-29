import type { Metadata } from 'next';
import Link from 'next/link';

import { isAuthEnabled } from '@/lib/auth';
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
  const authEnabled = isAuthEnabled();

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <span className={styles.logo} aria-hidden="true">
            GF
          </span>
          <h1 className={styles.title}>{t('common.appName')}</h1>
          <p className={styles.subtitle}>{t('admin.panelName')}</p>
        </div>

        <form className={styles.form} aria-describedby="login-notice">
          <label className={styles.label}>
            {t('admin.login.email')}
            <input
              className={styles.input}
              type="email"
              name="email"
              autoComplete="email"
              placeholder={t('admin.login.emailPlaceholder')}
              disabled
            />
          </label>
          <label className={styles.label}>
            {t('admin.login.password')}
            <input
              className={styles.input}
              type="password"
              name="password"
              autoComplete="current-password"
              placeholder="••••••••"
              disabled
            />
          </label>
          <button className={styles.button} type="submit" disabled>
            {t('admin.login.submit')}
          </button>
        </form>

        <p id="login-notice" className={styles.notice}>
          {t('admin.login.notice')}
        </p>

        {!authEnabled && (
          <Link className={styles.devLink} href="/dashboard">
            {t('admin.login.devLink')}
          </Link>
        )}
      </div>
    </main>
  );
}
