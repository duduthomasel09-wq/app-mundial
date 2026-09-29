import { createCssVariables } from '@gfg/ui';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { adminLocale, t } from '@/lib/i18n';
import './globals.css';

const appName = t('common.appName');
const panelName = t('admin.panelName');

// Variáveis CSS do design system (cores claro/escuro, espaçamentos, fontes, raios),
// geradas a partir dos tokens de @gfg/ui — a mesma fonte usada pelo app mobile.
const designTokensCss = createCssVariables();

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
      <head>
        {/* Conteúdo gerado só a partir dos tokens do projeto (sem dados de usuário). */}
        <style id="gfg-design-tokens" dangerouslySetInnerHTML={{ __html: designTokensCss }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
