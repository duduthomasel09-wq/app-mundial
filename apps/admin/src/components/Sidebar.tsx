'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import type { NavItem } from '@/config/navigation';
import styles from './Sidebar.module.css';

export interface SidebarItem extends NavItem {
  label: string;
}

/** Textos já traduzidos no servidor (este componente roda no navegador). */
export interface SidebarLabels {
  appName: string;
  panelName: string;
  menu: string;
  comingSoon: string;
  devMode: string;
}

interface SidebarProps {
  items: readonly SidebarItem[];
  labels: SidebarLabels;
  userName: string;
  isDevelopmentSession: boolean;
}

export function Sidebar({ items, labels, userName, isDevelopmentSession }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <span className={styles.logo} aria-hidden="true">
          GF
        </span>
        <div>
          <p className={styles.brandName}>{labels.appName}</p>
          <p className={styles.brandSub}>{labels.panelName}</p>
        </div>
      </div>

      <nav aria-label={labels.menu}>
        <ul className={styles.menu}>
          {items.map((item) => {
            if (!item.available) {
              return (
                <li key={item.key}>
                  <span className={`${styles.item} ${styles.disabled}`} aria-disabled="true">
                    <span>{item.label}</span>
                    <span className={styles.soon}>{labels.comingSoon}</span>
                  </span>
                </li>
              );
            }

            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <li key={item.key}>
                <Link
                  href={item.href}
                  className={`${styles.item} ${isActive ? styles.active : ''}`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className={styles.footer}>
        <p className={styles.user}>{userName}</p>
        {isDevelopmentSession && <p className={styles.devNote}>{labels.devMode}</p>}
      </div>
    </aside>
  );
}
