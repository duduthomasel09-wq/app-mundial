import type { Metadata } from 'next';

import { navigation } from '@/config/navigation';
import { siteConfig } from '@/config/site';
import styles from './dashboard.module.css';

export const metadata: Metadata = {
  title: 'Dashboard',
};

export default function DashboardPage() {
  const futureAreas = navigation.filter((item) => !item.available);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>{siteConfig.panelName}</p>
        <h1 className={styles.title}>{siteConfig.name}</h1>
        <p className={styles.lead}>
          Bem-vindo ao painel administrativo. Aqui você vai gerenciar o conteúdo do app.
        </p>
      </header>

      <section className={styles.card} aria-labelledby="status-title">
        <h2 id="status-title" className={styles.cardTitle}>
          Status do painel
        </h2>
        <p className={styles.muted}>
          Esta é a fundação técnica (Fase 0, etapa 4). Ainda não há dados nem cadastros.
        </p>
      </section>

      <section className={styles.card} aria-labelledby="areas-title">
        <h2 id="areas-title" className={styles.cardTitle}>
          Áreas previstas
        </h2>
        <ul className={styles.areas}>
          {futureAreas.map((item) => (
            <li key={item.key} className={styles.area}>
              <span>{item.label}</span>
              <span className={styles.badge}>Em breve</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
