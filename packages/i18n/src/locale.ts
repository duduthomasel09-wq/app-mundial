import { FALLBACK_LOCALE, isLocaleCode, LOCALES, type LocaleCode } from '@gfg/core';

/**
 * Escolhe o idioma suportado mais próximo do que o aparelho/navegador pede.
 *
 * Aceita um código (`'pt-PT'`) ou uma lista em ordem de preferência
 * (`['fr-FR', 'es-MX']`). Regras, para cada código pedido:
 * 1. igual a um idioma suportado (sem diferenciar maiúsculas) → usa ele;
 * 2. mesma língua base (`pt-PT` → `pt-BR`, `en-GB` → `en`) → usa a primeira que existir.
 * Se nada combinar, devolve o idioma de fallback (`en`).
 */
export function resolveLocale(
  requested: string | readonly string[] | null | undefined,
): LocaleCode {
  const candidates = typeof requested === 'string' ? [requested] : (requested ?? []);

  for (const candidate of candidates) {
    const wanted = candidate.trim().replace('_', '-').toLowerCase();
    if (!wanted) continue;

    const exact = LOCALES.find((locale) => locale.toLowerCase() === wanted);
    if (exact) return exact;

    const language = wanted.split('-')[0];
    const sameLanguage = LOCALES.find((locale) => locale.toLowerCase().split('-')[0] === language);
    if (sameLanguage) return sameLanguage;
  }

  return FALLBACK_LOCALE;
}

/**
 * Idioma do app (ADR 0018), em ordem de prioridade:
 * 1. idioma salvo no perfil (quem tem conta);
 * 2. idioma escolhido no onboarding e salvo no aparelho (quem não tem conta);
 * 3. idioma do celular (`resolveLocale`).
 * Valores desconhecidos são ignorados.
 */
export function resolveAppLocale(
  profileLocale: string | null | undefined,
  savedLocale: string | null | undefined,
  deviceLocales: string | readonly string[] | null | undefined,
): LocaleCode {
  if (isLocaleCode(profileLocale)) return profileLocale;
  if (isLocaleCode(savedLocale)) return savedLocale;
  return resolveLocale(deviceLocales);
}
