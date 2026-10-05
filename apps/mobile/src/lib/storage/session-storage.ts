import { decodeUtf8, encodeUtf8 } from '@gfg/core';
import { AESEncryptionKey, AESSealedData, aesDecryptAsync, aesEncryptAsync } from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';

import { kv } from './kv';

/**
 * Onde a sessão do Supabase fica no celular (ADR 0018).
 *
 * A sessão (tokens) é grande demais para o SecureStore (limite de ~2 KB por item). Por isso:
 * - uma **chave AES-256** é gerada uma vez e guardada no SecureStore (Keychain/Keystore),
 *   só neste aparelho e só com ele desbloqueado;
 * - a sessão é **criptografada com AES-GCM** (`expo-crypto`) e o resultado fica no
 *   AsyncStorage. O GCM também detecta adulteração.
 * Se a chave sumir ou o dado não puder ser lido, a sessão é descartada (a pessoa entra de
 * novo). Nada aqui é registrado em log. Na web, o Metro usa `session-storage.web.ts`.
 */
const KEY_NAME = 'gfg.session.key';
const PREFIX = 'gfg.session.';

const secureOptions: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

async function getKey(create: boolean): Promise<AESEncryptionKey | null> {
  const stored = await SecureStore.getItemAsync(KEY_NAME, secureOptions);
  if (stored) return AESEncryptionKey.import(stored, 'base64');
  if (!create) return null;
  const key = await AESEncryptionKey.generate(256);
  await SecureStore.setItemAsync(KEY_NAME, await key.encoded('base64'), secureOptions);
  return key;
}

export const sessionStorage = {
  async getItem(name: string): Promise<string | null> {
    const sealed = await kv.getItem(PREFIX + name);
    if (!sealed) return null;
    try {
      const key = await getKey(false);
      if (!key) throw new Error('sem chave');
      const bytes = await aesDecryptAsync(AESSealedData.fromCombined(sealed), key);
      return decodeUtf8(bytes);
    } catch {
      await kv.removeItem(PREFIX + name);
      return null;
    }
  },

  async setItem(name: string, value: string): Promise<void> {
    const key = await getKey(true);
    if (!key) return;
    const sealed = await aesEncryptAsync(encodeUtf8(value), key);
    await kv.setItem(PREFIX + name, await sealed.combined('base64'));
  },

  async removeItem(name: string): Promise<void> {
    await kv.removeItem(PREFIX + name);
  },
};
