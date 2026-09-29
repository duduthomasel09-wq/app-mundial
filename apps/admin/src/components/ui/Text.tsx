import type { TextTone, TypographyVariant } from '@gfg/ui';
import type { HTMLAttributes } from 'react';

import { cx } from './cx';
import styles from './ui.module.css';

type TextElement = 'p' | 'span' | 'h1' | 'h2' | 'h3' | 'div';

export interface TextProps extends HTMLAttributes<HTMLElement> {
  /** Elemento HTML (padrão: `p`). Use h1/h2/h3 para títulos. */
  as?: TextElement;
  /** Estilo tipográfico: title, subtitle, body (padrão), label ou caption. */
  variant?: TypographyVariant;
  /** Cor: default, muted, brand, success, warning ou danger. */
  tone?: TextTone;
  align?: 'left' | 'center' | 'right';
}

export function Text({
  as: Element = 'p',
  variant = 'body',
  tone = 'default',
  align,
  className,
  ...props
}: TextProps) {
  return (
    <Element
      className={cx(
        styles[variant],
        styles[`tone-${tone}`],
        align && styles[`align-${align}`],
        className,
      )}
      {...props}
    />
  );
}
