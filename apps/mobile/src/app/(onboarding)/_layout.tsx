import { Stack } from 'expo-router';

import { OnboardingDraftProvider } from '@/lib/onboarding-draft';

/** Onboarding (ADR 0018): idioma → país → moeda e unidades. */
export default function OnboardingLayout() {
  return (
    <OnboardingDraftProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="idioma" />
        <Stack.Screen name="pais" />
        <Stack.Screen name="moeda-unidades" />
      </Stack>
    </OnboardingDraftProvider>
  );
}
