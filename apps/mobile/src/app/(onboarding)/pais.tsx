import { COUNTRY_CODES, defaultsForCountry, type CountryCode } from '@gfg/core';
import { Button, Text } from '@gfg/ui/native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { OptionList } from '@/components/OptionList';
import { Screen } from '@/components/Screen';
import { useOnboardingDraft } from '@/lib/onboarding-draft';

/** Passo 2: país. Moeda e unidades já vêm com o padrão do país (podem mudar no passo 3). */
export default function CountryStep() {
  const { t } = useTranslation();
  const router = useRouter();
  const { draft, update } = useOnboardingDraft();

  const choose = (countryCode: CountryCode) => {
    update({ countryCode, ...defaultsForCountry(countryCode) });
  };

  return (
    <Screen>
      <Text variant="caption" tone="brand">
        {t('mobile.onboarding.step', { current: 2, total: 3 })}
      </Text>
      <Text variant="title" accessibilityRole="header">
        {t('mobile.onboarding.country.title')}
      </Text>
      <Text tone="muted">{t('mobile.onboarding.country.subtitle')}</Text>
      <OptionList
        label={t('mobile.onboarding.country.title')}
        options={COUNTRY_CODES.map((code) => ({
          value: code,
          label: t(`common.countries.${code}`),
        }))}
        value={draft.countryCode}
        onChange={choose}
      />
      <Button
        label={t('mobile.onboarding.next')}
        fullWidth
        disabled={!draft.countryCode}
        onPress={() => router.push('/moeda-unidades')}
        testID="onboarding-next"
      />
      <Button label={t('mobile.onboarding.back')} variant="ghost" onPress={() => router.back()} />
    </Screen>
  );
}
