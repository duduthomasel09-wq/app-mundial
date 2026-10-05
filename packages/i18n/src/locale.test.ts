import { describe, expect, it } from 'vitest';

import { resolveAppLocale, resolveLocale } from './locale';

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

describe('resolveAppLocale (prioridade do idioma no app)', () => {
  it('o idioma do perfil vence o do aparelho e o do celular', () => {
    expect(resolveAppLocale('es', 'en', ['pt-BR'])).toBe('es');
  });

  it('sem perfil, vale o idioma salvo no aparelho', () => {
    expect(resolveAppLocale(null, 'en', ['pt-BR'])).toBe('en');
  });

  it('sem perfil nem escolha salva, vale o idioma do celular', () => {
    expect(resolveAppLocale(null, null, ['pt-PT', 'en'])).toBe('pt-BR');
    expect(resolveAppLocale(undefined, undefined, ['fr-FR'])).toBe('en');
  });

  it('ignora valores desconhecidos', () => {
    expect(resolveAppLocale('fr', 'xx', ['es-MX'])).toBe('es');
    expect(resolveAppLocale('PT-BR', null, ['en'])).toBe('en');
  });
});
