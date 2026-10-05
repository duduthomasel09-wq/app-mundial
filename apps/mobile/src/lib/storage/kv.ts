import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Armazenamento simples de texto no aparelho (iOS/Android): AsyncStorage.
 * Não use para segredos sem criptografia — a sessão usa `session-storage.ts`.
 * Na web, o Metro usa `kv.web.ts`.
 */
export const kv = {
  getItem: (key: string): Promise<string | null> => AsyncStorage.getItem(key),
  setItem: (key: string, value: string): Promise<void> => AsyncStorage.setItem(key, value),
  removeItem: (key: string): Promise<void> => AsyncStorage.removeItem(key),
};
