import { describe, expect, it } from 'vitest';

import { createI18n, getTranslator } from './instance';

describe('createI18n', () => {
  it('traduz nos três idiomas', () => {
    expect(getTranslator('pt-BR')('admin.login.title')).toBe('Entrar');
    expect(getTranslator('en')('admin.login.title')).toBe('Sign in');
    expect(getTranslator('es')('admin.login.title')).toBe('Iniciar sesión');
  });

  it('preenche variáveis sem estragar símbolos', () => {
    const t = getTranslator('pt-BR');
    expect(t('mobile.home.language', { language: 'Español' })).toBe('Idioma: Español');
    expect(t('admin.description', { panelName: 'Painel & <admin>', appName: 'App' })).toBe(
      'Painel & <admin> do App',
    );
  });

  it('usa o plural certo', () => {
    const pt = getTranslator('pt-BR');
    expect(pt('common.countryCount', { count: 1 })).toBe('1 país');
    expect(pt('common.countryCount', { count: 5 })).toBe('5 países');
    expect(getTranslator('en')('common.countryCount', { count: 1 })).toBe('1 country');
    expect(getTranslator('es')('common.languageCount', { count: 3 })).toBe('3 idiomas');
  });

  it('já começa no idioma pedido e pode trocar de idioma', async () => {
    const i18n = createI18n('es');
    expect(i18n.language).toBe('es');
    expect(i18n.t('common.comingSoon')).toBe('Próximamente');
    await i18n.changeLanguage('en');
    expect(i18n.t('common.comingSoon')).toBe('Coming soon');
  });

  it('reaproveita a mesma função de tradução por idioma', () => {
    expect(getTranslator('en')).toBe(getTranslator('en'));
  });
});
