import { Stack } from 'expo-router';

/** Entrar, criar conta e confirmar e-mail (ADR 0018). Só aparecem sem conta. */
export default function AuthLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
