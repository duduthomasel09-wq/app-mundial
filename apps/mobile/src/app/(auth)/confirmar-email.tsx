import { EMAIL_OTP_LENGTH, RESEND_COOLDOWN_SECONDS, type AppAuthError } from '@gfg/core';
import { Button, Input, Text } from '@gfg/ui/native';
import { Redirect, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Screen } from '@/components/Screen';
import { useAppSession } from '@/lib/auth/AppSessionProvider';

/**
 * Confirmar o e-mail com o **código de 6 dígitos** (ADR 0018) — sem links que abrem o app.
 * O e-mail fica só na memória do app (nunca na URL). A mensagem é a mesma para conta nova
 * ou já existente.
 */
export default function ConfirmEmailScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { pendingEmail, verifyCode, resendCode, clearPendingEmail } = useAppSession();
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<AppAuthError | null>(null);
  const [notice, setNotice] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  if (!pendingEmail) return <Redirect href="/criar-conta" />;

  const submit = async () => {
    if (busy) return;
    setBusy(true);
    setError(null);
    setNotice(false);
    const result = await verifyCode(code);
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.replace('/');
  };

  const resend = async () => {
    setError(null);
    setNotice(false);
    const result = await resendCode();
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setNotice(true);
    setCooldown(RESEND_COOLDOWN_SECONDS);
  };

  const changeEmail = () => {
    clearPendingEmail();
    router.replace('/criar-conta');
  };

  return (
    <Screen centered>
      <Text variant="title" accessibilityRole="header">
        {t('mobile.auth.confirm.title')}
      </Text>
      <Text tone="muted" testID="confirm-subtitle">
        {t('mobile.auth.confirm.subtitle', { email: pendingEmail, length: EMAIL_OTP_LENGTH })}
      </Text>
      {error && (
        <Text tone="danger" accessibilityRole="alert" testID="auth-error">
          {t(`mobile.auth.errors.${error}`)}
        </Text>
      )}
      {notice && (
        <Text tone="success" accessibilityRole="alert" testID="auth-notice">
          {t('mobile.auth.confirm.resent')}
        </Text>
      )}
      <Input
        label={t('mobile.auth.confirm.code', { length: EMAIL_OTP_LENGTH })}
        value={code}
        onChangeText={(text) => setCode(text.replace(/[^0-9\s-]/g, ''))}
        keyboardType="number-pad"
        autoComplete="one-time-code"
        textContentType="oneTimeCode"
        maxLength={EMAIL_OTP_LENGTH + 2}
        onSubmitEditing={submit}
        testID="code"
      />
      <Button
        label={busy ? t('mobile.auth.confirm.submitting') : t('mobile.auth.confirm.submit')}
        fullWidth
        loading={busy}
        onPress={submit}
        testID="submit"
      />
      <Button
        label={
          cooldown > 0
            ? t('mobile.auth.confirm.resendIn', { seconds: cooldown })
            : t('mobile.auth.confirm.resend')
        }
        variant="secondary"
        fullWidth
        disabled={cooldown > 0}
        onPress={resend}
        testID="resend"
      />
      <Button label={t('mobile.auth.confirm.changeEmail')} variant="ghost" onPress={changeEmail} />
    </Screen>
  );
}
