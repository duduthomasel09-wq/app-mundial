import type { HTMLAttributes } from 'react';

import { cx } from './cx';
import styles from './ui.module.css';

/** Linha fina para separar blocos de conteúdo. */
export function Divider({ className, ...props }: HTMLAttributes<HTMLHRElement>) {
  return <hr className={cx(styles.divider, className)} {...props} />;
}
