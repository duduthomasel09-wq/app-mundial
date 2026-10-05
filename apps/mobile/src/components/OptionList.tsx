import { radius, sizes, spacing } from '@gfg/ui';
import { Text, useTheme } from '@gfg/ui/native';
import { Pressable, StyleSheet, View } from 'react-native';

export interface Option<T extends string> {
  value: T;
  label: string;
  description?: string;
}

interface OptionListProps<T extends string> {
  /** Nome do grupo, lido pelos leitores de tela. */
  label: string;
  options: readonly Option<T>[];
  value: T | undefined;
  onChange: (value: T) => void;
}

/** Lista de opções em que só uma pode ser escolhida (como botões de rádio). */
export function OptionList<T extends string>({
  label,
  options,
  value,
  onChange,
}: OptionListProps<T>) {
  const { colors } = useTheme();

  return (
    <View accessibilityRole="radiogroup" accessibilityLabel={label} style={styles.list}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="radio"
            aria-checked={selected}
            accessibilityLabel={option.label}
            testID={`option-${option.value}`}
            onPress={() => onChange(option.value)}
            style={({ pressed }) => [
              styles.option,
              {
                backgroundColor: selected ? colors.brandSoft : colors.surface,
                borderColor: selected ? colors.brand : colors.border,
                opacity: pressed ? 0.85 : 1,
              },
            ]}
          >
            <View
              style={[styles.radio, { borderColor: selected ? colors.brand : colors.textMuted }]}
            >
              {selected && <View style={[styles.dot, { backgroundColor: colors.brand }]} />}
            </View>
            <View style={styles.texts}>
              <Text variant="label">{option.label}</Text>
              {option.description ? (
                <Text variant="caption" tone="muted">
                  {option.description}
                </Text>
              ) : null}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const RADIO_SIZE = 20;

const styles = StyleSheet.create({
  list: { gap: spacing.sm },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: sizes.controlHeight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: sizes.borderWidth,
  },
  radio: {
    width: RADIO_SIZE,
    height: RADIO_SIZE,
    borderRadius: RADIO_SIZE / 2,
    borderWidth: sizes.focusRingWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: { width: RADIO_SIZE / 2, height: RADIO_SIZE / 2, borderRadius: RADIO_SIZE / 4 },
  texts: { flex: 1, gap: spacing.xxs },
});
