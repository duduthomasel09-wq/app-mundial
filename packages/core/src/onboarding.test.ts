import { describe, expect, it } from 'vitest';

import {
  decideAppRoute,
  defaultsForCountry,
  initialOnboardingValues,
  parseOnboardingPreferences,
  preferencesFromProfile,
  signUpMetadata,
  toProfileUpdate,
  type OnboardingPreferences,
} from './onboarding';

const BR: OnboardingPreferences = {
  locale: 'pt-BR',
  countryCode: 'BR',
  currencyCode: 'BRL',
  unitSystem: 'metric',
};

describe('padrões por país', () => {
  it('moeda e unidades de cada país inicial', () => {
    expect(defaultsForCountry('BR')).toEqual({ currencyCode: 'BRL', unitSystem: 'metric' });
    expect(defaultsForCountry('US')).toEqual({ currencyCode: 'USD', unitSystem: 'us' });
    expect(defaultsForCountry('PT')).toEqual({ currencyCode: 'EUR', unitSystem: 'metric' });
    expect(defaultsForCountry('ES')).toEqual({ currencyCode: 'EUR', unitSystem: 'metric' });
    expect(defaultsForCountry('GB')).toEqual({ currencyCode: 'GBP', unitSystem: 'uk' });
  });
});

describe('validação das preferências', () => {
  it('aceita preferências válidas (inclusive moeda diferente da do país)', () => {
    expect(parseOnboardingPreferences(BR)).toEqual(BR);
    expect(parseOnboardingPreferences({ ...BR, currencyCode: 'USD', unitSystem: 'us' })).toEqual({
      ...BR,
      currencyCode: 'USD',
      unitSystem: 'us',
    });
  });

  it('recusa qualquer campo desconhecido ou ausente', () => {
    expect(parseOnboardingPreferences({ ...BR, locale: 'fr' })).toBeNull();
    expect(parseOnboardingPreferences({ ...BR, countryCode: 'FR' })).toBeNull();
    expect(parseOnboardingPreferences({ ...BR, currencyCode: 'JPY' })).toBeNull();
    expect(parseOnboardingPreferences({ ...BR, unitSystem: 'imperial' })).toBeNull();
    expect(parseOnboardingPreferences({ locale: 'pt-BR' })).toBeNull();
    expect(parseOnboardingPreferences(null)).toBeNull();
    expect(parseOnboardingPreferences('{"locale":"pt-BR"}')).toBeNull();
  });
});

describe('perfil do Supabase', () => {
  const row = {
    locale: 'es',
    country_code: 'ES',
    currency_code: 'EUR',
    unit_system: 'metric',
    onboarding_completed_at: '2026-10-05T10:00:00.000Z',
  };

  it('perfil concluído vira preferências', () => {
    expect(preferencesFromProfile(row)).toEqual({
      locale: 'es',
      countryCode: 'ES',
      currencyCode: 'EUR',
      unitSystem: 'metric',
    });
  });

  it('perfil sem onboarding concluído não vale', () => {
    expect(preferencesFromProfile({ ...row, onboarding_completed_at: null })).toBeNull();
    expect(preferencesFromProfile(null)).toBeNull();
  });

  it('gera o update só com as colunas editáveis', () => {
    expect(toProfileUpdate(BR, new Date('2026-10-05T12:00:00Z'))).toEqual({
      locale: 'pt-BR',
      country_code: 'BR',
      currency_code: 'BRL',
      unit_system: 'metric',
      onboarding_completed_at: '2026-10-05T12:00:00.000Z',
    });
  });

  it('metadados do cadastro: só idioma e país', () => {
    expect(signUpMetadata(BR)).toEqual({ locale: 'pt-BR', country_code: 'BR' });
    expect(signUpMetadata(null)).toEqual({});
  });
});

describe('valores iniciais do onboarding', () => {
  it('sem nada salvo: idioma do celular', () => {
    expect(initialOnboardingValues('en', null, null)).toEqual({
      locale: 'en',
      countryCode: undefined,
      currencyCode: undefined,
      unitSystem: undefined,
    });
  });

  it('escolhas do aparelho preenchem o formulário', () => {
    expect(initialOnboardingValues('en', BR, null)).toEqual(BR);
  });

  it('o perfil (mesmo incompleto) vence o aparelho; valores inválidos são ignorados', () => {
    expect(
      initialOnboardingValues('en', BR, {
        locale: 'es',
        country_code: 'ES',
        currency_code: null,
        unit_system: 'xx',
        onboarding_completed_at: null,
      }),
    ).toEqual({ locale: 'es', countryCode: 'ES', currencyCode: 'BRL', unitSystem: 'metric' });
  });
});

describe('para onde o app vai (conta opcional)', () => {
  it('sem conta: onboarding até haver escolhas no aparelho', () => {
    expect(decideAppRoute({ signedIn: false, profileComplete: false, localComplete: false })).toBe(
      'onboarding',
    );
    expect(decideAppRoute({ signedIn: false, profileComplete: false, localComplete: true })).toBe(
      'home',
    );
  });

  it('com conta: onboarding enquanto o perfil não estiver concluído', () => {
    expect(decideAppRoute({ signedIn: true, profileComplete: false, localComplete: true })).toBe(
      'onboarding',
    );
    expect(decideAppRoute({ signedIn: true, profileComplete: true, localComplete: false })).toBe(
      'home',
    );
  });
});
