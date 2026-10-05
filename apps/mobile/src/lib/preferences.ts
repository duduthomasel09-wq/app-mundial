import { parseOnboardingPreferences, type OnboardingPreferences } from '@gfg/core';

import { kv } from './storage/kv';

/**
 * Preferências do onboarding salvas **no aparelho** (ADR 0018). Valem para quem usa o app
 * sem conta e servem de ponto de partida para quem cria conta. Não são dados sensíveis.
 */
const KEY = 'gfg.preferences';

export async function loadLocalPreferences(): Promise<OnboardingPreferences | null> {
  try {
    const raw = await kv.getItem(KEY);
    return raw ? parseOnboardingPreferences(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

export async function saveLocalPreferences(preferences: OnboardingPreferences): Promise<void> {
  await kv.setItem(KEY, JSON.stringify(preferences));
}
