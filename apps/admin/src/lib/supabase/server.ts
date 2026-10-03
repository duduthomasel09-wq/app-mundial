import 'server-only';

import { createServerClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

import { isSupabaseAuthEnabled, publicEnv } from '@/lib/env';
import { authCookieOptions } from './cookies';

/**
 * Cliente Supabase do servidor (Server Components, Server Actions e Route Handlers).
 *
 * - Usa SÓ a chave pública: as permissões vêm da sessão do usuário + RLS (ADR 0015/0016).
 *   Nenhuma chave secreta (service_role) é usada no painel.
 * - A sessão fica em cookies, lidos e gravados pelo `@supabase/ssr`.
 * - Crie um cliente novo a cada requisição (nunca reaproveite entre usuários).
 *
 * Devolve `null` quando o login real não está ligado (`ADMIN_AUTH_MODE` diferente de
 * `supabase`, ou URL/chave vazias).
 */
export async function createSupabaseServerClient(): Promise<SupabaseClient | null> {
  if (!isSupabaseAuthEnabled || !publicEnv.supabaseUrl || !publicEnv.supabaseAnonKey) {
    return null;
  }

  const cookieStore = await cookies();

  return createServerClient(publicEnv.supabaseUrl, publicEnv.supabaseAnonKey, {
    cookieOptions: authCookieOptions,
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Server Components não podem gravar cookies. Tudo bem: o `proxy.ts` renova a
          // sessão antes de cada página, e as Server Actions conseguem gravar normalmente.
        }
      },
    },
  });
}
