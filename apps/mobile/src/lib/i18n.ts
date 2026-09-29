import { createI18n, resolveLocale } from '@gfg/i18n';
import { getLocales } from 'expo-localization';

/**
 * Idioma do app: o primeiro da lista de preferências do aparelho que o app suporta
 * (pt-BR, en ou es). Sem nenhum compatível, usa inglês.
 *
 * Quando existir perfil de usuário, a escolha feita no perfil terá prioridade
 * (`i18n.changeLanguage(...)`).
 */
export const i18n = createI18n(resolveLocale(getLocales().map((locale) => locale.languageTag)));
