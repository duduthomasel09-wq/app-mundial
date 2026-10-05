import type { AppAuthError } from '@gfg/core';
import { Button, Input, Text } from '@gfg/ui/native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Screen } from '@/components/Screen';
import { useAppSession } from '@/lib/auth/AppSessionProvider';

/** Entrar com e-mail e senha (ADR 0018). */
export default function SignInScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { signIn, isConfigured } = useAppSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<AppAuthError | null>(null);

  const submit = async () => {
    if (busy) return;
    setBusy(true);
    setError(null);
    const result = await signIn(email, password);
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setPassword('');
    router.replace(result.needsCode ? '/confirmar-email' : '/');
  };

  return (
    <Screen centered>
      <Text variant="title" accessibilityRole="header">
        {t('mobile.auth.signIn.title')}
      </Text>
      <Text tone="muted">{t('mobile.auth.signIn.subtitle')}</Text>
      {!isConfigured && (
        <Text tone="warning" accessibilityRole="alert">
          {t('mobile.auth.errors.not_configured')}
        </Text>
      )}
      {error && (
        <Text tone="danger" accessibilityRole="alert" testID="auth-error">
          {t(`mobile.auth.errors.${error}`)}
        </Text>
      )}
      <Input
        label={t('mobile.auth.email')}
        placeholder={t('mobile.auth.emailPlaceholder')}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="email"
        keyboardType="email-address"
        textContentType="emailAddress"
        maxLength={254}
        testID="email"
      />
      <Input
        label={t('mobile.auth.password')}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize="none"
        autoComplete="current-password"
        textContentType="password"
        onSubmitEditing={submit}
        testID="password"
      />
      <Button
        label={busy ? t('mobile.auth.signIn.submitting') : t('mobile.auth.signIn.submit')}
        fullWidth
        loading={busy}
        disabled={!isConfigured}
        onPress={submit}
        testID="submit"
      />
      <Button
        label={t('mobile.auth.signIn.toSignUp')}
        variant="ghost"
        onPress={() => router.replace('/criar-conta')}
      />
      <Button
        label={t('mobile.auth.backHome')}
        variant="ghost"
        onPress={() => router.replace('/')}
      />
    </Screen>
  );
}
