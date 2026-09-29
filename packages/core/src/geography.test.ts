import { describe, expect, it } from 'vitest';

import {
  COUNTRIES,
  COUNTRY_CODES,
  CURRENCIES,
  FALLBACK_LOCALE,
  LOCALES,
  isCountryCode,
  isCurrencyCode,
  isLocaleCode,
} from './geography';

describe('geografia', () => {
  it('todo país aponta para idioma e moeda suportados', () => {
    for (const code of COUNTRY_CODES) {
      const country = COUNTRIES[code];
      expect(country.code).toBe(code);
      expect(isLocaleCode(country.defaultLocale)).toBe(true);
      expect(CURRENCIES[country.defaultCurrency].code).toBe(country.defaultCurrency);
    }
  });

  it('o idioma de fallback é suportado', () => {
    expect(LOCALES).toContain(FALLBACK_LOCALE);
  });

  it('valida códigos', () => {
    expect(isCountryCode('BR')).toBe(true);
    expect(isCountryCode('UK')).toBe(false);
    expect(isCurrencyCode('EUR')).toBe(true);
    expect(isCurrencyCode('JPY')).toBe(false);
    expect(isLocaleCode('pt-BR')).toBe(true);
    expect(isLocaleCode('pt')).toBe(false);
  });
});
