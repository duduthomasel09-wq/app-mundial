import { COUNTRY_CODES, LOCALES, type LocaleCode } from '@gfg/core';
import { fontSize, fontWeight, getColors, spacing } from '@gfg/ui';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, useColorScheme, View } from 'react-native';

// Tela provisória da Fase 0 — só confirma que o app abre, usa os pacotes compartilhados
// e mostra os textos no idioma do aparelho.
// As funcionalidades (receitas, produtos etc.) entram nas próximas fases.
export default function HomeScreen() {
  const palette = getColors(useColorScheme());
  const { t, i18n } = useTranslation();
  const locale = i18n.language as LocaleCode;

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      <Text style={styles.emoji}>🌍</Text>
      <Text style={[styles.title, { color: palette.brand }]}>{t('common.appName')}</Text>
      <Text style={[styles.subtitle, { color: palette.textMuted }]}>
        {t('mobile.home.subtitle')}
      </Text>
      <Text style={[styles.details, { color: palette.textMuted }]}>
        {t('mobile.home.language', { language: t(`common.languages.${locale}`) })}
      </Text>
      <Text style={[styles.details, { color: palette.textMuted }]}>
        {t('common.languageCount', { count: LOCALES.length })} ·{' '}
        {t('common.countryCount', { count: COUNTRY_CODES.length })}
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
  details: { fontSize: fontSize.sm, marginTop: spacing.md },
});
