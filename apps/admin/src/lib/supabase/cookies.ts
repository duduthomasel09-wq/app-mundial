import type { CookieOptionsWithName } from '@supabase/ssr';

import { publicEnv } from '@/lib/env';

/**
 * Opções dos cookies de sessão do Supabase no painel (ADR 0016). Usadas pelo `proxy.ts`
 * e pelo cliente do servidor — as duas precisam ser iguais.
 *
 * - `httpOnly`: o JavaScript da página não lê o cookie (o painel não usa cliente
 *   Supabase no navegador; tudo passa pelo servidor). Protege a sessão contra XSS.
 * - `secure`: só trafega por HTTPS fora do desenvolvimento.
 * - `sameSite: 'lax'`: não é enviado em formulários vindos de outros sites.
 */
export const authCookieOptions: CookieOptionsWithName = {
  path: '/',
  sameSite: 'lax',
  httpOnly: true,
  secure: publicEnv.appEnv !== 'development',
};
