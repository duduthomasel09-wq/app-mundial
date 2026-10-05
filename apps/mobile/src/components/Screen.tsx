import { spacing } from '@gfg/ui';
import { useTheme } from '@gfg/ui/native';
import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/**
 * Moldura das telas do app: área segura, rolagem e teclado sem cobrir os campos.
 * `centered` centraliza o conteúdo na vertical (telas curtas, como o login).
 */
export function Screen({
  children,
  centered = false,
}: {
  children: ReactNode;
  centered?: boolean;
}) {
  const { colors } = useTheme();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={[styles.content, centered && styles.centered]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.inner}>{children}</View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  content: { flexGrow: 1, padding: spacing.xl },
  centered: { justifyContent: 'center' },
  inner: { width: '100%', maxWidth: 480, alignSelf: 'center', gap: spacing.md },
});
