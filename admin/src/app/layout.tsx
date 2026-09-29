import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { siteConfig } from '@/config/site';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.panelName} · ${siteConfig.name}`,
    template: `%s · ${siteConfig.name}`,
  },
  description: `${siteConfig.panelName} do ${siteConfig.name}`,
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
