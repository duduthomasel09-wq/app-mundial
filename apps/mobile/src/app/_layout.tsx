import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { I18nextProvider } from 'react-i18next';

import { i18n } from '@/lib/i18n';

export default function RootLayout() {
  return (
    <I18nextProvider i18n={i18n}>
      <Stack screenOptions={{ headerShown: false }} />
      <StatusBar style="auto" />
    </I18nextProvider>
  );
}
