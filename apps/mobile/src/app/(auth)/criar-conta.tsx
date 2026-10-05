import type { AppAuthError } from '@gfg/core';
import { Button, Input, Text } from '@gfg/ui/native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Screen } from '@/components/Screen';
import { useAppSession } from '@/lib/auth/AppSessionProvider';

/**
 * Criar conta com e-mail e senha (ADR 0018). O idioma e o país escolhidos no onboarding vão
 * junto no cadastro. Depois, a pessoa digita o código de 6 dígitos enviado por e-mail.
 */
export default function SignUpScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { signUp, isConfigured } = useAppSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<AppAuthError | null>(null);

  const submit = async () => {
    if (busy) return;
    setBusy(true);
    setError(null);
    const result = await signUp(email, password, confirmation);
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setPassword('');
    setConfirmation('');
    router.replace(result.needsCode ? '/confirmar-email' : '/');
  };

  return (
    <Screen centered>
      <Text variant="title" accessibilityRole="header">
        {t('mobile.auth.signUp.title')}
      </Text>
      <Text tone="muted">{t('mobile.auth.signUp.subtitle')}</Text>
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
        hint={t('mobile.auth.signUp.passwordHint')}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize="none"
        autoComplete="new-password"
        textContentType="newPassword"
        testID="password"
      />
      <Input
        label={t('mobile.auth.signUp.confirmation')}
        value={confirmation}
        onChangeText={setConfirmation}
        secureTextEntry
        autoCapitalize="none"
        autoComplete="new-password"
        textContentType="newPassword"
        onSubmitEditing={submit}
        testID="confirmation"
      />
      <Button
        label={busy ? t('mobile.auth.signUp.submitting') : t('mobile.auth.signUp.submit')}
        fullWidth
        loading={busy}
        disabled={!isConfigured}
        onPress={submit}
        testID="submit"
      />
      <Button
        label={t('mobile.auth.signUp.toSignIn')}
        variant="ghost"
        onPress={() => router.replace('/entrar')}
      />
      <Button
        label={t('mobile.auth.backHome')}
        variant="ghost"
        onPress={() => router.replace('/')}
      />
    </Screen>
  );
}
