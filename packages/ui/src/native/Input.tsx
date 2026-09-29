import { useState } from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { componentRadius, sizes, spacing, typography } from '../tokens';
import { DISABLED_OPACITY, inputColors } from '../variants';
import { Text } from './Text';
import { useTheme } from './theme';

export interface InputProps extends TextInputProps {
  /** Rótulo mostrado acima do campo (também lido por leitores de tela). */
  label: string;
  /** Mensagem de erro: deixa a borda vermelha e aparece abaixo do campo. */
  error?: string;
  /** Dica mostrada abaixo do campo quando não há erro. */
  hint?: string;
  disabled?: boolean;
}

export function Input({
  label,
  error,
  hint,
  disabled = false,
  style,
  onFocus,
  onBlur,
  ...props
}: InputProps) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);
  const c = inputColors(colors, { error: Boolean(error), focused });

  return (
    <View style={[styles.field, disabled && styles.disabled]}>
      <Text variant="label">{label}</Text>
      <TextInput
        accessibilityLabel={label}
        accessibilityState={{ disabled }}
        editable={!disabled}
        placeholderTextColor={colors.textMuted}
        onFocus={(event) => {
          setFocused(true);
          onFocus?.(event);
        }}
        onBlur={(event) => {
          setFocused(false);
          onBlur?.(event);
        }}
        style={[
          styles.input,
          { backgroundColor: c.background, color: c.text, borderColor: c.border },
          style,
        ]}
        {...props}
      />
      {error ? (
        <Text variant="caption" tone="danger" accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : hint ? (
        <Text variant="caption" tone="muted">
          {hint}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: spacing.xs, alignSelf: 'stretch' },
  disabled: { opacity: DISABLED_OPACITY },
  input: {
    ...typography.body,
    minHeight: sizes.controlHeight,
    paddingHorizontal: spacing.md,
    borderRadius: componentRadius.input,
    borderWidth: sizes.borderWidth,
  },
});
