/**
 * Países, moedas, idiomas e sistemas de unidades suportados (ADR 0004).
 *
 * Esta é a lista **inicial** usada pelo app antes do banco existir. Quando o Supabase
 * estiver pronto (etapa 6), estes dados passam a vir das tabelas `Country`, `Currency`
 * e `Locale`; os tipos daqui continuam valendo.
 */

/** Idiomas da interface (BCP 47). */
export const LOCALES = ['pt-BR', 'en', 'es'] as const;
export type LocaleCode = (typeof LOCALES)[number];

/** Idioma usado quando falta tradução. */
export const FALLBACK_LOCALE: LocaleCode = 'en';

/** Moedas (ISO 4217). */
export const CURRENCY_CODES = ['BRL', 'USD', 'EUR', 'GBP'] as const;
export type CurrencyCode = (typeof CURRENCY_CODES)[number];

/** Países (ISO 3166-1 alfa-2). O Reino Unido usa o código oficial `GB`. */
export const COUNTRY_CODES = ['BR', 'US', 'PT', 'ES', 'GB'] as const;
export type CountryCode = (typeof COUNTRY_CODES)[number];

/**
 * Sistema de unidades padrão de cada país:
 * - `metric`: gramas, mililitros, °C;
 * - `us`: onças, xícaras americanas, °F;
 * - `uk`: misto — pesos e volumes métricos, mas receitas antigas usam onças/libras.
 */
export const UNIT_SYSTEMS = ['metric', 'us', 'uk'] as const;
export type UnitSystem = (typeof UNIT_SYSTEMS)[number];

export interface Currency {
  code: CurrencyCode;
  symbol: string;
  /** Casas decimais usadas nos preços. */
  decimals: number;
}

export interface Country {
  code: CountryCode;
  defaultLocale: LocaleCode;
  defaultCurrency: CurrencyCode;
  unitSystem: UnitSystem;
}

export const CURRENCIES: Readonly<Record<CurrencyCode, Currency>> = {
  BRL: { code: 'BRL', symbol: 'R$', decimals: 2 },
  USD: { code: 'USD', symbol: '$', decimals: 2 },
  EUR: { code: 'EUR', symbol: '€', decimals: 2 },
  GBP: { code: 'GBP', symbol: '£', decimals: 2 },
};

// Portugal usa `pt-BR` até existir uma tradução `pt-PT` (é o português mais próximo disponível).
export const COUNTRIES: Readonly<Record<CountryCode, Country>> = {
  BR: { code: 'BR', defaultLocale: 'pt-BR', defaultCurrency: 'BRL', unitSystem: 'metric' },
  US: { code: 'US', defaultLocale: 'en', defaultCurrency: 'USD', unitSystem: 'us' },
  PT: { code: 'PT', defaultLocale: 'pt-BR', defaultCurrency: 'EUR', unitSystem: 'metric' },
  ES: { code: 'ES', defaultLocale: 'es', defaultCurrency: 'EUR', unitSystem: 'metric' },
  GB: { code: 'GB', defaultLocale: 'en', defaultCurrency: 'GBP', unitSystem: 'uk' },
};

export function isLocaleCode(value: unknown): value is LocaleCode {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}

export function isCurrencyCode(value: unknown): value is CurrencyCode {
  return typeof value === 'string' && (CURRENCY_CODES as readonly string[]).includes(value);
}

export function isCountryCode(value: unknown): value is CountryCode {
  return typeof value === 'string' && (COUNTRY_CODES as readonly string[]).includes(value);
}
