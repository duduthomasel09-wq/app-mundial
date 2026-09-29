import 'server-only';

import { getTranslator } from '@gfg/i18n';

import { serverEnv } from '@/lib/env';

/**
 * Traduções do painel, usadas nos componentes de servidor.
 *
 * O idioma vem de `ADMIN_LOCALE` (padrão: pt-BR). Componentes de cliente não
 * importam este arquivo: recebem os textos já traduzidos por props.
 */
export const adminLocale = serverEnv.locale;

export const t = getTranslator(adminLocale);
