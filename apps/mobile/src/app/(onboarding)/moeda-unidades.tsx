import { CURRENCIES, CURRENCY_CODES, parseOnboardingPreferences, UNIT_SYSTEMS } from '@gfg/core';
import { Button, Text } from '@gfg/ui/native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { OptionList } from '@/components/OptionList';
import { Screen } from '@/components/Screen';
import { useAppSession } from '@/lib/auth/AppSessionProvider';
import { useOnboardingDraft } from '@/lib/onboarding-draft';

/**
 * Passo 3: moeda e unidades, com o padrão do país já marcado. "Concluir" salva no
 * aparelho e, com conta, também no perfil do Supabase.
 */
export default function CurrencyUnitsStep() {
  const { t } = useTranslation();
  const router = useRouter();
  const { draft, update } = useOnboardingDraft();
  const { saveOnboarding, signedIn } = useAppSession();
  const [saving, setSaving] = useState(false);
  const [failed, setFailed] = useState(false);

  const finish = async () => {
    const preferences = parseOnboardingPreferences(draft);
    if (!preferences) {
      router.replace('/pais');
      return;
    }
    setSaving(true);
    setFailed(false);
    const result = await saveOnboarding(preferences);
    setSaving(false);
    if (!result.ok) {
      setFailed(true);
      return;
    }
    router.replace('/');
  };

  return (
    <Screen>
      <Text variant="caption" tone="brand">
        {t('mobile.onboarding.step', { current: 3, total: 3 })}
      </Text>
      <Text variant="title" accessibilityRole="header">
        {t('mobile.onboarding.currencyUnits.title')}
      </Text>
      <Text tone="muted">{t('mobile.onboarding.currencyUnits.subtitle')}</Text>

      <Text variant="subtitle">{t('mobile.onboarding.currencyUnits.currency')}</Text>
      <OptionList
        label={t('mobile.onboarding.currencyUnits.currency')}
        options={CURRENCY_CODES.map((code) => ({
          value: code,
          label: `${t(`common.currencies.${code}`)} (${CURRENCIES[code].symbol})`,
        }))}
        value={draft.currencyCode}
        onChange={(currencyCode) => update({ currencyCode })}
      />

      <Text variant="subtitle">{t('mobile.onboarding.currencyUnits.units')}</Text>
      <OptionList
        label={t('mobile.onboarding.currencyUnits.units')}
        options={UNIT_SYSTEMS.map((system) => ({
          value: system,
          label: t(`mobile.onboarding.unitSystems.${system}.name`),
          description: t(`mobile.onboarding.unitSystems.${system}.description`),
        }))}
        value={draft.unitSystem}
        onChange={(unitSystem) => update({ unitSystem })}
      />

      {failed && (
        <Text tone="danger" accessibilityRole="alert" align="center">
          {t('mobile.onboarding.saveError')}
        </Text>
      )}
      {signedIn && (
        <Text variant="caption" tone="muted" align="center">
          {t('mobile.onboarding.savedToAccount')}
        </Text>
      )}
      <Button
        label={saving ? t('mobile.onboarding.saving') : t('mobile.onboarding.finish')}
        fullWidth
        loading={saving}
        disabled={!draft.currencyCode || !draft.unitSystem}
        onPress={finish}
        testID="onboarding-finish"
      />
      <Button label={t('mobile.onboarding.back')} variant="ghost" onPress={() => router.back()} />
    </Screen>
  );
}
