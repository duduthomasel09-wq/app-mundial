import { CURRENCIES, type CurrencyCode, type LocaleCode } from '@gfg/core';

/**
 * Formatos que mudam por idioma/país (nível 3 da seção 3.3 do PROJECT_SPEC).
 * Usam a API `Intl`, que já vem no navegador, no Node e no app (Hermes).
 */

/** Ex.: `formatNumber(1234.5, 'pt-BR')` → `"1.234,5"`. */
export function formatNumber(
  value: number,
  locale: LocaleCode,
  options?: Intl.NumberFormatOptions,
): string {
  return new Intl.NumberFormat(locale, options).format(value);
}

/** Ex.: `formatCurrency(9.9, 'BRL', 'pt-BR')` → `"R$ 9,90"`. */
export function formatCurrency(amount: number, currency: CurrencyCode, locale: LocaleCode): string {
  const { decimals } = CURRENCIES[currency];
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
}

/** Ex.: `formatDate(new Date(2026, 8, 29), 'pt-BR')` → `"29/09/2026"`. */
export function formatDate(
  date: Date,
  locale: LocaleCode,
  options: Intl.DateTimeFormatOptions = { dateStyle: 'short' },
): string {
  return new Intl.DateTimeFormat(locale, options).format(date);
}
