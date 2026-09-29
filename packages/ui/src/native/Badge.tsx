import { StyleSheet, Text as RNText, View, type ViewProps } from 'react-native';

import { componentRadius, spacing, typography } from '../tokens';
import { badgeColors, type BadgeTone } from '../variants';
import { useTheme } from './theme';

export interface BadgeProps extends ViewProps {
  label: string;
  /** neutral (padrão), brand, success, warning ou danger. */
  tone?: BadgeTone;
}

/** Selo curto de status (ex.: "Em breve"). */
export function Badge({ label, tone = 'neutral', style, ...props }: BadgeProps) {
  const { colors } = useTheme();
  const c = badgeColors(colors, tone);

  return (
    <View style={[styles.badge, { backgroundColor: c.background }, style]} {...props}>
      <RNText style={[styles.text, { color: c.text }]}>{label}</RNText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: componentRadius.badge,
  },
  text: { ...typography.caption, fontWeight: typography.label.fontWeight },
});
