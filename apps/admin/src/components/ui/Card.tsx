import type { HTMLAttributes } from 'react';

import { cx } from './cx';
import styles from './ui.module.css';

export interface CardProps extends HTMLAttributes<HTMLElement> {
  /** Elemento HTML (padrão: `section`). */
  as?: 'section' | 'div' | 'article';
}

/** Superfície com borda e cantos arredondados para agrupar conteúdo. */
export function Card({ as: Element = 'section', className, ...props }: CardProps) {
  return <Element className={cx(styles.card, className)} {...props} />;
}
