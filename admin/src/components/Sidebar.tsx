'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { navigation } from '@/config/navigation';
import { siteConfig } from '@/config/site';
import styles from './Sidebar.module.css';

interface SidebarProps {
  userName: string;
  isDevelopmentSession: boolean;
}

export function Sidebar({ userName, isDevelopmentSession }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <span className={styles.logo} aria-hidden="true">
          GF
        </span>
        <div>
          <p className={styles.brandName}>{siteConfig.name}</p>
          <p className={styles.brandSub}>{siteConfig.panelName}</p>
        </div>
      </div>

      <nav aria-label="Menu principal">
        <ul className={styles.menu}>
          {navigation.map((item) => {
            if (!item.available) {
              return (
                <li key={item.key}>
                  <span className={`${styles.item} ${styles.disabled}`} aria-disabled="true">
                    <span>{item.label}</span>
                    <span className={styles.soon}>Em breve</span>
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
        {isDevelopmentSession && <p className={styles.devNote}>Modo desenvolvimento — sem login</p>}
      </div>
    </aside>
  );
}
