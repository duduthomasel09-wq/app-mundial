import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { adminLocale, t } from '@/lib/i18n';
import './globals.css';

const appName = t('common.appName');
const panelName = t('admin.panelName');

export const metadata: Metadata = {
  title: {
    default: `${panelName} · ${appName}`,
    template: `%s · ${appName}`,
  },
  description: t('admin.description', { panelName, appName }),
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang={adminLocale}>
      <body>{children}</body>
    </html>
  );
}
