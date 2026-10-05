import { createI18n, resolveAppLocale, resolveLocale, type LocaleCode } from '@gfg/i18n';
import { getLocales } from 'expo-localization';

/** Idiomas preferidos do aparelho, em ordem. */
function deviceLocales(): string[] {
  return getLocales().map((locale) => locale.languageTag);
}

/** Idioma do celular já convertido para um idioma suportado (pt-BR, en ou es). */
export function deviceLocale(): LocaleCode {
  return resolveLocale(deviceLocales());
}

/**
 * Traduções do app. Começa no idioma do celular; assim que as preferências carregam,
 * `applyAppLocale` aplica a prioridade da ADR 0018: perfil > aparelho > celular.
 */
export const i18n = createI18n(deviceLocale());

export function applyAppLocale(
  profileLocale: string | null | undefined,
  savedLocale: string | null | undefined,
): void {
  const locale = resolveAppLocale(profileLocale, savedLocale, deviceLocales());
  if (i18n.language !== locale) void i18n.changeLanguage(locale);
}
