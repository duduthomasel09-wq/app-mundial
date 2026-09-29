import type { Metadata } from 'next';
import Link from 'next/link';

import { siteConfig } from '@/config/site';
import { isAuthEnabled } from '@/lib/auth';
import styles from './login.module.css';

// Depende da configuração de autenticação do servidor, lida a cada acesso.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Entrar',
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
          <h1 className={styles.title}>{siteConfig.name}</h1>
          <p className={styles.subtitle}>{siteConfig.panelName}</p>
        </div>

        <form className={styles.form} aria-describedby="login-notice">
          <label className={styles.label}>
            E-mail
            <input
              className={styles.input}
              type="email"
              name="email"
              autoComplete="email"
              placeholder="voce@exemplo.com"
              disabled
            />
          </label>
          <label className={styles.label}>
            Senha
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
            Entrar
          </button>
        </form>

        <p id="login-notice" className={styles.notice}>
          O login com e-mail e senha ainda não está ativo. Ele será ligado ao Supabase numa etapa
          futura.
        </p>

        {!authEnabled && (
          <Link className={styles.devLink} href="/dashboard">
            Entrar no painel (modo desenvolvimento)
          </Link>
        )}
      </div>
    </main>
  );
}
