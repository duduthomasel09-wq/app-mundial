import { kv } from './kv';

/**
 * Sessão na versão web: `localStorage` do navegador (padrão do Supabase na web). O
 * SecureStore não existe no navegador. Ver `session-storage.ts` para o celular.
 */
const PREFIX = 'gfg.session.';

export const sessionStorage = {
  getItem: (name: string) => kv.getItem(PREFIX + name),
  setItem: (name: string, value: string) => kv.setItem(PREFIX + name, value),
  removeItem: (name: string) => kv.removeItem(PREFIX + name),
};
