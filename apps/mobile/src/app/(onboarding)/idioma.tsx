import { LOCALES, type LocaleCode } from '@gfg/core';
import { Button, Text } from '@gfg/ui/native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { OptionList } from '@/components/OptionList';
import { Screen } from '@/components/Screen';
import { useOnboardingDraft } from '@/lib/onboarding-draft';

/** Nome de cada idioma escrito nele mesmo (para quem ainda não entende o idioma atual). */
const NATIVE_NAMES: Record<LocaleCode, string> = {
  'pt-BR': 'Português (Brasil)',
  en: 'English',
  es: 'Español',
};

/** Passo 1 do onboarding: idioma do app. A troca já aparece nas telas seguintes. */
export default function LanguageStep() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { draft, update } = useOnboardingDraft();

  const choose = (locale: LocaleCode) => {
    update({ locale });
    void i18n.changeLanguage(locale);
  };

  return (
    <Screen>
      <Text variant="caption" tone="brand">
        {t('mobile.onboarding.step', { current: 1, total: 3 })}
      </Text>
      <Text variant="title" accessibilityRole="header">
        {t('mobile.onboarding.language.title')}
      </Text>
      <Text tone="muted">{t('mobile.onboarding.language.subtitle')}</Text>
      <OptionList
        label={t('mobile.onboarding.language.title')}
        options={LOCALES.map((code) => ({ value: code, label: NATIVE_NAMES[code] }))}
        value={draft.locale}
        onChange={choose}
      />
      <Button
        label={t('mobile.onboarding.next')}
        fullWidth
        onPress={() => router.push('/pais')}
        testID="onboarding-next"
      />
    </Screen>
  );
}
