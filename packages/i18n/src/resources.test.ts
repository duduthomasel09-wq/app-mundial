import { LOCALES } from '@gfg/core';
import { describe, expect, it } from 'vitest';

import { resources } from './resources';

type Tree = { [key: string]: string | Tree };

const PLURAL_SUFFIX = /_(zero|one|two|few|many|other)$/;

/** Transforma `{ a: { b: 'x' } }` em `{ 'a.b': 'x' }`. */
function flatten(tree: Tree, prefix = ''): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(tree)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'string') result[path] = value;
    else Object.assign(result, flatten(value, path));
  }
  return result;
}

const placeholders = (text: string) =>
  [...text.matchAll(/{{\s*(\w+)\s*}}/g)].map((m) => m[1]).sort();

const flat = Object.fromEntries(
  LOCALES.map((locale) => [locale, flatten(resources[locale].translation as Tree)]),
) as Record<(typeof LOCALES)[number], Record<string, string>>;

/** Chaves sem o sufixo de plural (`countryCount_one` → `countryCount`). */
const baseKeys = (locale: (typeof LOCALES)[number]) =>
  [...new Set(Object.keys(flat[locale]).map((key) => key.replace(PLURAL_SUFFIX, '')))].sort();

describe('arquivos de tradução', () => {
  it('todos os idiomas têm as mesmas chaves do pt-BR', () => {
    for (const locale of LOCALES) {
      expect(baseKeys(locale), locale).toEqual(baseKeys('pt-BR'));
    }
  });

  it('nenhum texto está vazio', () => {
    for (const locale of LOCALES) {
      for (const [key, text] of Object.entries(flat[locale])) {
        expect(text.trim(), `${locale}: ${key}`).not.toBe('');
      }
    }
  });

  it('as variáveis {{...}} são as mesmas em todos os idiomas', () => {
    for (const locale of LOCALES) {
      for (const [key, text] of Object.entries(flat[locale])) {
        const base = key.replace(PLURAL_SUFFIX, '');
        const reference = Object.entries(flat['pt-BR']).find(
          ([refKey]) => refKey.replace(PLURAL_SUFFIX, '') === base,
        );
        expect(placeholders(text), `${locale}: ${key}`).toEqual(placeholders(reference![1]));
      }
    }
  });

  it('cada plural tem todas as formas que o idioma usa', () => {
    for (const locale of LOCALES) {
      const categories = new Intl.PluralRules(locale).resolvedOptions().pluralCategories;
      const pluralBases = new Set(
        Object.keys(flat[locale])
          .filter((key) => PLURAL_SUFFIX.test(key))
          .map((key) => key.replace(PLURAL_SUFFIX, '')),
      );
      for (const base of pluralBases) {
        for (const category of categories) {
          expect(flat[locale], `${locale}: ${base}_${category}`).toHaveProperty([
            `${base}_${category}`,
          ]);
        }
      }
    }
  });
});
