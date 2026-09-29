import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text as RNText,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { componentRadius, sizes, spacing, typography } from '../tokens';
import { buttonColors, DISABLED_OPACITY, type ButtonVariant } from '../variants';
import { useTheme } from './theme';

export interface ButtonProps extends Omit<PressableProps, 'children' | 'style'> {
  /** Texto do botão. */
  label: string;
  /** primary (padrão), secondary, ghost ou danger. */
  variant?: ButtonVariant;
  /** Mostra um indicador de carregamento e bloqueia novos toques. */
  loading?: boolean;
  /** Ocupa toda a largura disponível. */
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Button({
  label,
  variant = 'primary',
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
  ...props
}: ButtonProps) {
  const { colors } = useTheme();
  const inactive = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: inactive, busy: loading }}
      disabled={inactive}
      style={({ pressed }) => {
        const c = buttonColors(colors, variant, { pressed });
        return [
          styles.base,
          { backgroundColor: c.background, borderColor: c.border },
          fullWidth && styles.fullWidth,
          inactive && styles.inactive,
          style,
        ];
      }}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={buttonColors(colors, variant).text} />
      ) : (
        <RNText style={[typography.label, { color: buttonColors(colors, variant).text }]}>
          {label}
        </RNText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: sizes.controlHeight,
    paddingHorizontal: spacing.lg,
    borderRadius: componentRadius.button,
    borderWidth: sizes.borderWidth,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  fullWidth: { alignSelf: 'stretch' },
  inactive: { opacity: DISABLED_OPACITY },
});
