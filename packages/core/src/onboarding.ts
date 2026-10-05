/**
 * Onboarding do app (ADR 0018): idioma, país, moeda e unidades.
 *
 * - Acontece primeiro, para todos — com ou sem conta.
 * - Sem conta: as escolhas ficam no aparelho.
 * - Com conta: ficam no perfil (`public.profiles`), que passa a valer em qualquer aparelho.
 */
import {
  COUNTRIES,
  isCountryCode,
  isCurrencyCode,
  isLocaleCode,
  UNIT_SYSTEMS,
  type CountryCode,
  type CurrencyCode,
  type LocaleCode,
  type UnitSystem,
} from './geography';

export interface OnboardingPreferences {
  locale: LocaleCode;
  countryCode: CountryCode;
  currencyCode: CurrencyCode;
  unitSystem: UnitSystem;
}

export function isUnitSystem(value: unknown): value is UnitSystem {
  return typeof value === 'string' && (UNIT_SYSTEMS as readonly string[]).includes(value);
}

/** Moeda e unidades padrão de um país (a pessoa pode trocar depois). */
export function defaultsForCountry(country: CountryCode): {
  currencyCode: CurrencyCode;
  unitSystem: UnitSystem;
} {
  const { defaultCurrency, unitSystem } = COUNTRIES[country];
  return { currencyCode: defaultCurrency, unitSystem };
}

/**
 * Valida preferências vindas de fora (aparelho ou formulário). Qualquer campo inválido →
 * `null` (o app trata como "onboarding ainda não feito").
 */
export function parseOnboardingPreferences(raw: unknown): OnboardingPreferences | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const value = raw as Record<string, unknown>;
  const { locale, countryCode, currencyCode, unitSystem } = value;
  if (!isLocaleCode(locale) || !isCountryCode(countryCode)) return null;
  if (!isCurrencyCode(currencyCode) || !isUnitSystem(unitSystem)) return null;
  return { locale, countryCode, currencyCode, unitSystem };
}

/** Colunas de `public.profiles` usadas pelo onboarding (nomes do banco). */
export interface ProfilePreferencesRow {
  locale: string | null;
  country_code: string | null;
  currency_code: string | null;
  unit_system: string | null;
  onboarding_completed_at: string | null;
}

/**
 * Preferências de um perfil **com onboarding concluído**. Perfil incompleto ou com algum
 * valor desconhecido → `null`.
 */
export function preferencesFromProfile(
  row: ProfilePreferencesRow | null | undefined,
): OnboardingPreferences | null {
  if (!row?.onboarding_completed_at) return null;
  return parseOnboardingPreferences({
    locale: row.locale,
    countryCode: row.country_code,
    currencyCode: row.currency_code,
    unitSystem: row.unit_system,
  });
}

/**
 * Valores iniciais das telas do onboarding, na ordem: perfil (mesmo incompleto) →
 * escolhas do aparelho → idioma do celular e padrões do país. Nunca devolve valor inválido.
 */
export function initialOnboardingValues(
  deviceLocale: LocaleCode,
  local: OnboardingPreferences | null,
  profile: ProfilePreferencesRow | null,
): Partial<OnboardingPreferences> & { locale: LocaleCode } {
  const fromProfile = {
    locale: isLocaleCode(profile?.locale) ? profile.locale : undefined,
    countryCode: isCountryCode(profile?.country_code) ? profile.country_code : undefined,
    currencyCode: isCurrencyCode(profile?.currency_code) ? profile.currency_code : undefined,
    unitSystem: isUnitSystem(profile?.unit_system) ? profile.unit_system : undefined,
  };
  return {
    locale: fromProfile.locale ?? local?.locale ?? deviceLocale,
    countryCode: fromProfile.countryCode ?? local?.countryCode,
    currencyCode: fromProfile.currencyCode ?? local?.currencyCode,
    unitSystem: fromProfile.unitSystem ?? local?.unitSystem,
  };
}

/** Dados do onboarding para o `update` em `public.profiles` (só colunas editáveis). */
export function toProfileUpdate(
  preferences: OnboardingPreferences,
  completedAt: Date,
): Omit<ProfilePreferencesRow, 'onboarding_completed_at'> & { onboarding_completed_at: string } {
  return {
    locale: preferences.locale,
    country_code: preferences.countryCode,
    currency_code: preferences.currencyCode,
    unit_system: preferences.unitSystem,
    onboarding_completed_at: completedAt.toISOString(),
  };
}

/**
 * Metadados enviados no cadastro (`signUp`). O gatilho `handle_new_user` lê só `locale` e
 * `country_code` e **deriva** moeda e unidades do país (ADR 0015).
 */
export function signUpMetadata(preferences: OnboardingPreferences | null): {
  locale?: LocaleCode;
  country_code?: CountryCode;
} {
  if (!preferences) return {};
  return { locale: preferences.locale, country_code: preferences.countryCode };
}

export type AppRoute = 'onboarding' | 'home';

/**
 * Para onde o app deve ir (ADR 0018). A conta é opcional:
 * - sem conta: onboarding até haver escolhas válidas no aparelho; depois, início;
 * - com conta: onboarding enquanto o perfil não estiver concluído; depois, início.
 */
export function decideAppRoute(state: {
  signedIn: boolean;
  profileComplete: boolean;
  localComplete: boolean;
}): AppRoute {
  if (state.signedIn) return state.profileComplete ? 'home' : 'onboarding';
  return state.localComplete ? 'home' : 'onboarding';
}
