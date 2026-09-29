import { describe, expect, it } from 'vitest';

import { resolveLocale } from './locale';

describe('resolveLocale', () => {
  it('usa o idioma exato quando existe', () => {
    expect(resolveLocale('pt-BR')).toBe('pt-BR');
    expect(resolveLocale('ES')).toBe('es');
    expect(resolveLocale('pt_br')).toBe('pt-BR');
  });

  it('usa a mesma língua base', () => {
    expect(resolveLocale('pt-PT')).toBe('pt-BR');
    expect(resolveLocale('pt')).toBe('pt-BR');
    expect(resolveLocale('en-GB')).toBe('en');
    expect(resolveLocale('es-MX')).toBe('es');
  });

  it('respeita a ordem de preferência', () => {
    expect(resolveLocale(['fr-FR', 'es-AR', 'en'])).toBe('es');
  });

  it('cai no inglês quando nada combina', () => {
    expect(resolveLocale('fr-FR')).toBe('en');
    expect(resolveLocale([])).toBe('en');
    expect(resolveLocale(undefined)).toBe('en');
    expect(resolveLocale('')).toBe('en');
  });
});
