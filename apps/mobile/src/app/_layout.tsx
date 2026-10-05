import { spacing } from '@gfg/ui';
import { Button, Text, useTheme } from '@gfg/ui/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { I18nextProvider, useTranslation } from 'react-i18next';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

// Lê e valida as variáveis de ambiente ao abrir o app (avisos aparecem no terminal).
import '@/lib/env';
import { AppSessionProvider, useAppSession } from '@/lib/auth/AppSessionProvider';
import { i18n } from '@/lib/i18n';

// A tela de abertura fica visível até a sessão e as preferências carregarem.
void SplashScreen.preventAutoHideAsync().catch(() => null);

export default function RootLayout() {
  return (
    <I18nextProvider i18n={i18n}>
      <AppSessionProvider>
        <AppNavigator />
      </AppSessionProvider>
      <StatusBar style="auto" />
    </I18nextProvider>
  );
}

/**
 * Navegação baseada na sessão (ADR 0018), com rotas protegidas do Expo Router:
 * - onboarding não concluído (no aparelho ou no perfil) → só as telas do onboarding;
 * - pronto → início; entrar/criar conta só sem conta; "alterar preferências" reabre o
 *   onboarding a qualquer momento.
 */
function AppNavigator() {
  const { status, route, signedIn } = useAppSession();

  useEffect(() => {
    if (status !== 'loading') void SplashScreen.hideAsync().catch(() => null);
  }, [status]);

  if (status === 'loading') return <LoadingView />;
  if (status === 'error') return <ErrorView />;

  const home = route === 'home';

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={home}>
        <Stack.Screen name="index" />
        <Stack.Screen name="design-system" />
      </Stack.Protected>
      <Stack.Protected guard={home && !signedIn}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
      <Stack.Screen name="(onboarding)" />
    </Stack>
  );
}

function LoadingView() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  return (
    <View style={[styles.center, { backgroundColor: colors.background }]}>
      <ActivityIndicator color={colors.brand} accessibilityLabel={t('mobile.loading')} />
    </View>
  );
}

function ErrorView() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { retry } = useAppSession();
  return (
    <View style={[styles.center, { backgroundColor: colors.background }]}>
      <Text variant="subtitle" align="center">
        {t('mobile.error.title')}
      </Text>
      <Text tone="muted" align="center">
        {t('mobile.error.text')}
      </Text>
      <Button label={t('mobile.error.retry')} onPress={retry} />
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.xl,
  },
});
