import { FALLBACK_LOCALE, LOCALES, type LocaleCode } from '@gfg/core';
import i18next, { type i18n, type TFunction } from 'i18next';

import { DEFAULT_NAMESPACE, resources } from './resources';

/**
 * Cria uma instância do i18next já pronta para uso (sem carregamento assíncrono:
 * as traduções vêm junto no código).
 *
 * Use uma instância por app/usuário quando o idioma puder mudar (ex.: app mobile).
 * Se faltar um texto no idioma escolhido, aparece o texto em inglês (fallback).
 */
export function createI18n(locale: LocaleCode): i18n {
  const instance = i18next.createInstance();

  void instance.init({
    lng: locale,
    fallbackLng: FALLBACK_LOCALE,
    supportedLngs: [...LOCALES],
    load: 'currentOnly',
    resources,
    defaultNS: DEFAULT_NAMESPACE,
    initAsync: false,
    // O React já protege contra HTML injetado; escapar aqui estragaria acentos e símbolos.
    interpolation: { escapeValue: false },
  });

  return instance;
}

const translators = new Map<LocaleCode, TFunction>();

/**
 * Função de tradução fixa em um idioma (reaproveitada entre chamadas).
 * Ideal para o servidor (painel admin), onde o idioma não muda durante a renderização.
 */
export function getTranslator(locale: LocaleCode): TFunction {
  let t = translators.get(locale);
  if (!t) {
    t = createI18n(locale).t;
    translators.set(locale, t);
  }
  return t;
}
