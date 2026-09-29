import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

import { typography, type TypographyVariant } from '../tokens';
import { textColor, type TextTone } from '../variants';
import { useTheme } from './theme';

export interface TextProps extends RNTextProps {
  /** Estilo tipográfico: title, subtitle, body (padrão), label ou caption. */
  variant?: TypographyVariant;
  /** Cor: default, muted, brand, success, warning ou danger. */
  tone?: TextTone;
  align?: 'left' | 'center' | 'right';
}

export function Text({ variant = 'body', tone = 'default', align, style, ...props }: TextProps) {
  const { colors } = useTheme();
  const isHeading = variant === 'title' || variant === 'subtitle';

  return (
    <RNText
      accessibilityRole={isHeading ? 'header' : undefined}
      style={[typography[variant], { color: textColor(colors, tone), textAlign: align }, style]}
      {...props}
    />
  );
}
