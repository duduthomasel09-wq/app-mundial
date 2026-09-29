import { describe, expect, it } from 'vitest';

import { COLOR_SCHEMES, colors, getColors } from './tokens';

describe('tokens', () => {
  it('os temas claro e escuro têm as mesmas cores, todas em hexadecimal', () => {
    const lightKeys = Object.keys(colors.light).sort();
    for (const scheme of COLOR_SCHEMES) {
      expect(Object.keys(colors[scheme]).sort()).toEqual(lightKeys);
      for (const value of Object.values(colors[scheme])) {
        expect(value).toMatch(/^#[0-9A-F]{6}$/);
      }
    }
  });

  it('usa o tema claro quando o tema é desconhecido', () => {
    expect(getColors('dark')).toBe(colors.dark);
    expect(getColors('light')).toBe(colors.light);
    expect(getColors(null)).toBe(colors.light);
    expect(getColors('sepia')).toBe(colors.light);
  });
});
