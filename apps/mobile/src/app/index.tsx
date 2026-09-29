import { COUNTRY_CODES, LOCALES, type LocaleCode } from '@gfg/core';
import { fontSize, spacing } from '@gfg/ui';
import { Badge, Button, Card, Divider, Text, useTheme } from '@gfg/ui/native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text as RNText, View } from 'react-native';

import { showEnvironmentBadge } from '@/lib/env';

// Tela provisória da Fase 0 — só confirma que o app abre, usa os pacotes compartilhados,
// mostra os textos no idioma do aparelho e aplica o design system.
// As funcionalidades (receitas, produtos etc.) entram nas próximas fases.
export default function HomeScreen() {
  const { colors } = useTheme();
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const locale = i18n.language as LocaleCode;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <RNText style={styles.emoji} accessibilityElementsHidden importantForAccessibility="no">
        🌍
      </RNText>
      <Text variant="title" tone="brand" align="center">
        {t('common.appName')}
      </Text>
      <View style={styles.badges}>
        <Badge label={t('mobile.home.phase')} tone="brand" />
        {showEnvironmentBadge && (
          <Badge label={t('common.environment.development')} tone="warning" />
        )}
      </View>

      <Card style={styles.card}>
        <Text tone="muted" align="center">
          {t('mobile.home.subtitle')}
        </Text>
        <Divider space="xs" />
        <Text variant="caption" tone="muted" align="center">
          {t('mobile.home.language', { language: t(`common.languages.${locale}`) })}
        </Text>
        <Text variant="caption" tone="muted" align="center">
          {t('common.languageCount', { count: LOCALES.length })} ·{' '}
          {t('common.countryCount', { count: COUNTRY_CODES.length })}
        </Text>
      </Card>

      {__DEV__ && (
        <Button
          variant="ghost"
          label={t('mobile.home.openDesignSystem')}
          onPress={() => router.push('/design-system')}
          style={styles.centered}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'stretch',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.xl,
  },
  emoji: { fontSize: fontSize.display, textAlign: 'center' },
  centered: { alignSelf: 'center' },
  badges: { flexDirection: 'row', justifyContent: 'center', gap: spacing.sm },
  card: { marginTop: spacing.sm },
});
