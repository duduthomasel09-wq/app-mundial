import { describe, expect, it } from 'vitest';

import { contrastRatio } from './contrast';
import {
  COLOR_SCHEMES,
  colors,
  componentRadius,
  getColors,
  sizes,
  spacing,
  typography,
} from './tokens';
import { BADGE_TONES, badgeColors, BUTTON_VARIANTS, buttonColors } from './variants';

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

  it('espaçamentos seguem a escala de 2/4 px e crescem em ordem', () => {
    const values = Object.values(spacing);
    expect(values).toEqual([...values].sort((a, b) => a - b));
    for (const value of values) expect(value % 2).toBe(0);
  });

  it('tipografia tem altura de linha maior que a fonte', () => {
    for (const style of Object.values(typography)) {
      expect(style.lineHeight).toBeGreaterThan(style.fontSize);
    }
  });

  it('controles têm área de toque mínima de 44 px e raios definidos', () => {
    expect(sizes.controlHeight).toBeGreaterThanOrEqual(44);
    for (const value of Object.values(componentRadius)) expect(value).toBeGreaterThan(0);
  });
});

describe('contraste (WCAG AA: mínimo 4,5)', () => {
  it('calcula os extremos corretamente', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21);
    expect(contrastRatio('#777777', '#777777')).toBeCloseTo(1);
    expect(() => contrastRatio('red', '#FFFFFF')).toThrow();
  });

  for (const scheme of COLOR_SCHEMES) {
    const p = colors[scheme];

    it(`texto é legível no tema ${scheme}`, () => {
      for (const bg of [p.background, p.surface]) {
        expect(contrastRatio(p.text, bg)).toBeGreaterThanOrEqual(4.5);
        expect(contrastRatio(p.textMuted, bg)).toBeGreaterThanOrEqual(4.5);
      }
      for (const tone of [p.brand, p.success, p.warning, p.danger]) {
        expect(contrastRatio(tone, p.surface)).toBeGreaterThanOrEqual(4.5);
      }
    });

    it(`botões e selos são legíveis no tema ${scheme}`, () => {
      for (const variant of BUTTON_VARIANTS) {
        for (const pressed of [false, true]) {
          const c = buttonColors(p, variant, { pressed });
          const bg = c.background === 'transparent' ? p.surface : c.background;
          expect(contrastRatio(c.text, bg), `${variant} pressed=${pressed}`).toBeGreaterThanOrEqual(
            4.5,
          );
        }
      }
      for (const tone of BADGE_TONES) {
        const c = badgeColors(p, tone);
        expect(contrastRatio(c.text, c.background), tone).toBeGreaterThanOrEqual(4.5);
      }
    });
  }
});
