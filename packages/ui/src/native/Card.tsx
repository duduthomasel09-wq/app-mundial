import { StyleSheet, View, type ViewProps } from 'react-native';

import { componentRadius, sizes, spacing } from '../tokens';
import { useTheme } from './theme';

/** Superfície com borda e cantos arredondados para agrupar conteúdo. */
export function Card({ style, ...props }: ViewProps) {
  const { colors } = useTheme();

  return (
    <View
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }, style]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.lg,
    gap: spacing.sm,
    borderRadius: componentRadius.card,
    borderWidth: sizes.borderWidth,
  },
});
