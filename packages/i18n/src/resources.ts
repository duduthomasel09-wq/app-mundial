import type { LocaleCode } from '@gfg/core';

import en from '../locales/en.json';
import es from '../locales/es.json';
import ptBR from '../locales/pt-BR.json';

/**
 * Textos da interface por idioma. O arquivo `pt-BR.json` é a referência:
 * toda chave nova entra primeiro nele e depois em `en.json` e `es.json`
 * (o teste `resources.test.ts` avisa se faltar alguma).
 */
export const resources = {
  'pt-BR': { translation: ptBR },
  en: { translation: en },
  es: { translation: es },
} as const satisfies Record<LocaleCode, { translation: object }>;

export const DEFAULT_NAMESPACE = 'translation';

// Faz o TypeScript conhecer as chaves: `t('admin.login.title')` é verificado,
// e uma chave digitada errado vira erro de compilação.
declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: typeof DEFAULT_NAMESPACE;
    resources: { translation: typeof ptBR };
  }
}
