import { describe, expect, it } from 'vitest';

import { formatCurrency, formatDate, formatNumber } from './format';

// O Intl usa espaços especiais (sem quebra) em alguns formatos; normalizamos para comparar.
const normalize = (text: string) => text.replace(/\s/g, ' ');

describe('formatos', () => {
  it('formata números por idioma', () => {
    expect(formatNumber(1234.5, 'pt-BR')).toBe('1.234,5');
    expect(formatNumber(1234.5, 'en')).toBe('1,234.5');
  });

  it('formata moedas com as casas decimais da moeda', () => {
    expect(normalize(formatCurrency(9.9, 'BRL', 'pt-BR'))).toBe('R$ 9,90');
    expect(formatCurrency(9.9, 'USD', 'en')).toBe('$9.90');
    expect(normalize(formatCurrency(3, 'EUR', 'es'))).toBe('3,00 €');
  });

  it('formata datas', () => {
    const date = new Date(2026, 8, 29);
    expect(formatDate(date, 'pt-BR')).toBe('29/09/2026');
    expect(formatDate(date, 'en')).toBe('9/29/26');
  });
});
