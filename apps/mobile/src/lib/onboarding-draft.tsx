import { initialOnboardingValues, type OnboardingPreferences } from '@gfg/core';
import { createContext, useContext, useState, type ReactNode } from 'react';

import { useAppSession } from '@/lib/auth/AppSessionProvider';
import { deviceLocale } from '@/lib/i18n';

type Draft = Partial<OnboardingPreferences> & Pick<OnboardingPreferences, 'locale'>;

interface OnboardingDraft {
  draft: Draft;
  update: (changes: Partial<OnboardingPreferences>) => void;
}

const DraftContext = createContext<OnboardingDraft | null>(null);

/**
 * Rascunho das escolhas entre os passos do onboarding (só na memória). Começa com o perfil
 * (mesmo incompleto) → escolhas do aparelho → idioma do celular (ADR 0018).
 */
export function OnboardingDraftProvider({ children }: { children: ReactNode }) {
  const { localPreferences, profile } = useAppSession();
  const [draft, setDraft] = useState<Draft>(() =>
    initialOnboardingValues(deviceLocale(), localPreferences, profile),
  );
  const update = (changes: Partial<OnboardingPreferences>) =>
    setDraft((current) => ({ ...current, ...changes }));
  return <DraftContext.Provider value={{ draft, update }}>{children}</DraftContext.Provider>;
}

export function useOnboardingDraft(): OnboardingDraft {
  const value = useContext(DraftContext);
  if (!value) throw new Error('useOnboardingDraft precisa estar dentro do onboarding.');
  return value;
}
