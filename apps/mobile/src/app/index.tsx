import { preferencesFromProfile } from '@gfg/core';
import { fontSize, spacing } from '@gfg/ui';
import { Badge, Button, Card, Divider, Text } from '@gfg/ui/native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text as RNText, View } from 'react-native';

import { Screen } from '@/components/Screen';
import { useAppSession } from '@/lib/auth/AppSessionProvider';
import { showEnvironmentBadge } from '@/lib/env';

/**
 * Início (Fase 1). Mostra as preferências atuais e a conta: a conta é opcional (ADR 0018).
 * As funcionalidades (receitas, produtos etc.) entram nas próximas etapas.
 */
export default function HomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { signedIn, email, profile, localPreferences, isConfigured, signOut } = useAppSession();
  const [leaving, setLeaving] = useState(false);

  // Com conta, vale o perfil; sem conta, as escolhas do aparelho.
  const preferences = (signedIn ? preferencesFromProfile(profile) : null) ?? localPreferences;

  const leave = async () => {
    setLeaving(true);
    await signOut();
    setLeaving(false);
  };

  return (
    <Screen centered>
      <RNText style={styles.emoji} accessibilityElementsHidden importantForAccessibility="no">
        🌍
      </RNText>
      <Text variant="title" tone="brand" align="center" accessibilityRole="header">
        {t('common.appName')}
      </Text>
      <View style={styles.badges}>
        <Badge label={t('mobile.home.phase')} tone="brand" />
        {showEnvironmentBadge && (
          <Badge label={t('common.environment.development')} tone="warning" />
        )}
      </View>

      <Card>
        <Text variant="subtitle">{t('mobile.home.preferencesTitle')}</Text>
        {preferences && (
          <View testID="preferences">
            <Text>
              {t('mobile.home.language', { language: t(`common.languages.${preferences.locale}`) })}
            </Text>
            <Text>
              {t('mobile.home.country', {
                country: t(`common.countries.${preferences.countryCode}`),
              })}
            </Text>
            <Text>
              {t('mobile.home.currency', {
                currency: t(`common.currencies.${preferences.currencyCode}`),
              })}
            </Text>
            <Text>
              {t('mobile.home.units', {
                units: t(`mobile.onboarding.unitSystems.${preferences.unitSystem}.name`),
              })}
            </Text>
          </View>
        )}
        <Button
          label={t('mobile.home.editPreferences')}
          variant="secondary"
          onPress={() => router.push('/idioma')}
          testID="edit-preferences"
        />
      </Card>

      <Card>
        {signedIn ? (
          <>
            <Text testID="account-status">
              {t('mobile.home.signedInAs', { email: email ?? '' })}
            </Text>
            <Divider space="xs" />
            <Button
              label={t('mobile.home.signOut')}
              variant="secondary"
              loading={leaving}
              onPress={leave}
              testID="sign-out"
            />
          </>
        ) : (
          <>
            <Text tone="muted" testID="account-status">
              {t('mobile.home.guest')}
            </Text>
            {isConfigured ? (
              <>
                <Button
                  label={t('mobile.home.createAccount')}
                  onPress={() => router.push('/criar-conta')}
                  testID="create-account"
                />
                <Button
                  label={t('mobile.home.signIn')}
                  variant="secondary"
                  onPress={() => router.push('/entrar')}
                  testID="sign-in"
                />
              </>
            ) : (
              <Text variant="caption" tone="muted">
                {t('mobile.auth.errors.not_configured')}
              </Text>
            )}
          </>
        )}
      </Card>

      {__DEV__ && (
        <Button
          variant="ghost"
          label={t('mobile.home.openDesignSystem')}
          onPress={() => router.push('/design-system')}
          style={styles.centered}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  emoji: { fontSize: fontSize.display, textAlign: 'center' },
  centered: { alignSelf: 'center' },
  badges: { flexDirection: 'row', justifyContent: 'center', gap: spacing.sm },
});
