import type { BadgeTone } from '@gfg/ui';
import type { HTMLAttributes } from 'react';

import { cx } from './cx';
import styles from './ui.module.css';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** neutral (padrão), brand, success, warning ou danger. */
  tone?: BadgeTone;
}

/** Selo curto de status (ex.: "Em breve"). */
export function Badge({ tone = 'neutral', className, ...props }: BadgeProps) {
  return <span className={cx(styles.badge, styles[`badge-${tone}`], className)} {...props} />;
}
