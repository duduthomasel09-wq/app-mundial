/**
 * Armazenamento simples de texto na versão web: `localStorage` do navegador.
 *
 * O app web é gerado como páginas estáticas (`web.output: "static"`), e essa geração roda
 * fora do navegador, sem `window`. Nesse momento tudo devolve vazio e nada é gravado.
 */
function storage(): Storage | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage;
  } catch {
    return null;
  }
}

export const kv = {
  async getItem(key: string): Promise<string | null> {
    return storage()?.getItem(key) ?? null;
  },
  async setItem(key: string, value: string): Promise<void> {
    storage()?.setItem(key, value);
  },
  async removeItem(key: string): Promise<void> {
    storage()?.removeItem(key);
  },
};
