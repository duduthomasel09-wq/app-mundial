import { describe, expect, it } from 'vitest';

import { convertTemperature, convertUnit, roundTo } from './units';

describe('conversão de unidades', () => {
  it('converte pesos', () => {
    expect(convertUnit(1, 'kg', 'g')).toBe(1000);
    expect(roundTo(convertUnit(1, 'lb', 'g'), 2)).toBe(453.59);
    expect(convertUnit(16, 'oz', 'lb')).toBeCloseTo(1);
  });

  it('converte volumes (medidas americanas)', () => {
    expect(roundTo(convertUnit(1, 'cup', 'ml'))).toBe(237);
    expect(convertUnit(3, 'tsp', 'tbsp')).toBeCloseTo(1);
    expect(convertUnit(1, 'cup', 'tbsp')).toBeCloseTo(16);
    expect(convertUnit(1.5, 'l', 'ml')).toBe(1500);
  });

  it('não converte peso em volume', () => {
    expect(() => convertUnit(100, 'g', 'ml')).toThrow();
  });

  it('converte temperatura', () => {
    expect(convertTemperature(180, 'c', 'f')).toBe(356);
    expect(convertTemperature(212, 'f', 'c')).toBe(100);
    expect(convertTemperature(20, 'c', 'c')).toBe(20);
  });

  it('arredonda', () => {
    expect(roundTo(1.2345, 2)).toBe(1.23);
    expect(roundTo(2.5)).toBe(3);
  });
});
