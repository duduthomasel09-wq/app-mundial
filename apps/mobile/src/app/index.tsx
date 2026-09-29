import { COUNTRY_CODES, LOCALES } from '@gfg/core';
import { resolveLocale } from '@gfg/i18n';
import { fontSize, fontWeight, getColors, spacing } from '@gfg/ui';
import { StyleSheet, Text, useColorScheme, View } from 'react-native';

// Tela provisória da Fase 0 — só confirma que o app abre e usa os pacotes compartilhados.
// As funcionalidades (receitas, produtos etc.) entram nas próximas fases.
export default function HomeScreen() {
  const palette = getColors(useColorScheme());
  const locale = resolveLocale(Intl.DateTimeFormat().resolvedOptions().locale);

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      <Text style={styles.emoji}>🌍</Text>
      <Text style={[styles.title, { color: palette.brand }]}>Global Food Guide</Text>
      <Text style={[styles.subtitle, { color: palette.textMuted }]}>Em construção — Fase 0</Text>
      <Text style={[styles.details, { color: palette.textMuted }]}>
        Idioma: {locale} · {LOCALES.length} idiomas · {COUNTRY_CODES.length} países
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  emoji: { fontSize: fontSize.display, marginBottom: spacing.md },
  title: { fontSize: fontSize.xl, fontWeight: fontWeight.bold },
  subtitle: { fontSize: fontSize.md, marginTop: spacing.sm },
  details: { fontSize: fontSize.sm, marginTop: spacing.lg },
});
