import { COUNTRIES, COUNTRY_CODES } from '@gfg/core';
import { formatCurrency } from '@gfg/i18n';
import type { Metadata } from 'next';

import { Badge, Card, Divider, Text } from '@/components/ui';
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
        <Text variant="caption" tone="brand" className={styles.eyebrow}>
          {t('admin.panelName')}
        </Text>
        <Text as="h1" variant="title">
          {t('common.appName')}
        </Text>
        <Text tone="muted">{t('admin.dashboard.welcome')}</Text>
      </header>

      <Card aria-labelledby="status-title">
        <Text as="h2" id="status-title" variant="subtitle">
          {t('admin.dashboard.statusTitle')}
        </Text>
        <Text tone="muted">{t('admin.dashboard.statusText')}</Text>
      </Card>

      <Card aria-labelledby="countries-title">
        <Text as="h2" id="countries-title" variant="subtitle">
          {t('admin.dashboard.countriesTitle')}
        </Text>
        <Text tone="muted">{t('admin.dashboard.countriesText')}</Text>
        <Divider />
        <ul className={styles.areas}>
          {COUNTRY_CODES.map((code) => {
            const country = COUNTRIES[code];
            return (
              <li key={code} className={styles.area}>
                <span>
                  {t(`common.countries.${code}`)} · {t(`common.languages.${country.defaultLocale}`)}
                </span>
                <Badge tone="brand">
                  {formatCurrency(9.9, country.defaultCurrency, adminLocale)}
                </Badge>
              </li>
            );
          })}
        </ul>
      </Card>

      <Card aria-labelledby="areas-title">
        <Text as="h2" id="areas-title" variant="subtitle">
          {t('admin.dashboard.areasTitle')}
        </Text>
        <ul className={styles.areas}>
          {futureAreas.map((item) => (
            <li key={item.key} className={styles.area}>
              <span>{t(`admin.nav.${item.key}`)}</span>
              <Badge>{t('common.comingSoon')}</Badge>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
