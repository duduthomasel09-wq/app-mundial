import { StyleSheet, View, type ViewProps } from 'react-native';

import { spacing, type SpacingToken } from '../tokens';
import { useTheme } from './theme';

export interface DividerProps extends ViewProps {
  /** Espaço acima e abaixo da linha (padrão: md). */
  space?: SpacingToken;
}

/** Linha fina para separar blocos de conteúdo. */
export function Divider({ space = 'md', style, ...props }: DividerProps) {
  const { colors } = useTheme();

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no"
      style={[
        styles.line,
        { backgroundColor: colors.border, marginVertical: spacing[space] },
        style,
      ]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  line: { height: StyleSheet.hairlineWidth, alignSelf: 'stretch' },
});
