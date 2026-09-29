import { COUNTRIES, COUNTRY_CODES } from '@gfg/core';
import { formatCurrency } from '@gfg/i18n';
import type { Metadata } from 'next';

import { navigation } from '@/config/navigation';
import { adminLocale, t } from '@/lib/i18n';
import styles from './dashboard.module.css';

export const metadata: Metadata = {
  title: t('admin.dashboard.title'),
};

export default function DashboardPage() {
  const futureAreas = navigation.filter((item) => !item.available);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>{t('admin.panelName')}</p>
        <h1 className={styles.title}>{t('common.appName')}</h1>
        <p className={styles.lead}>{t('admin.dashboard.welcome')}</p>
      </header>

      <section className={styles.card} aria-labelledby="status-title">
        <h2 id="status-title" className={styles.cardTitle}>
          {t('admin.dashboard.statusTitle')}
        </h2>
        <p className={styles.muted}>{t('admin.dashboard.statusText')}</p>
      </section>

      <section className={styles.card} aria-labelledby="countries-title">
        <h2 id="countries-title" className={styles.cardTitle}>
          {t('admin.dashboard.countriesTitle')}
        </h2>
        <p className={styles.muted}>{t('admin.dashboard.countriesText')}</p>
        <ul className={styles.areas}>
          {COUNTRY_CODES.map((code) => {
            const country = COUNTRIES[code];
            return (
              <li key={code} className={styles.area}>
                <span>
                  {t(`common.countries.${code}`)} · {t(`common.languages.${country.defaultLocale}`)}
                </span>
                <span className={styles.badge}>
                  {formatCurrency(9.9, country.defaultCurrency, adminLocale)}
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      <section className={styles.card} aria-labelledby="areas-title">
        <h2 id="areas-title" className={styles.cardTitle}>
          {t('admin.dashboard.areasTitle')}
        </h2>
        <ul className={styles.areas}>
          {futureAreas.map((item) => (
            <li key={item.key} className={styles.area}>
              <span>{t(`admin.nav.${item.key}`)}</span>
              <span className={styles.badge}>{t('common.comingSoon')}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
