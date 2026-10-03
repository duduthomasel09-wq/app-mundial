import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

import { isSupabaseAuthEnabled, publicEnv } from '@/lib/env';
import { authCookieOptions } from '@/lib/supabase/cookies';

/**
 * Proxy do Next 16 (antigo `middleware.ts`) — ADR 0016.
 *
 * Única tarefa: **renovar a sessão do Supabase** antes de cada página, gravando os
 * cookies novos na resposta. Ele NÃO decide quem entra no painel: isso é feito no
 * servidor por `getAdminAccess()` (layout do painel) e, no banco, pela RLS.
 *
 * Com o login real desligado (`ADMIN_AUTH_MODE=disabled`), não faz nada.
 */
export async function proxy(request: NextRequest) {
  if (!isSupabaseAuthEnabled || !publicEnv.supabaseUrl || !publicEnv.supabaseAnonKey) {
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(publicEnv.supabaseUrl, publicEnv.supabaseAnonKey, {
    cookieOptions: authCookieOptions,
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        // Os cookies novos valem para esta requisição e voltam para o navegador.
        for (const { name, value } of cookiesToSet) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
        // Resposta com cookie de sessão nunca pode ficar em cache compartilhado.
        for (const [key, value] of Object.entries(headers)) response.headers.set(key, value);
      },
    },
  });

  // Não coloque código entre a criação do cliente e esta chamada: ela renova o token
  // vencido usando o refresh token e grava os cookies novos.
  await supabase.auth.getClaims();

  return response;
}

export const config = {
  // Tudo, menos arquivos estáticos do Next e imagens/ícones.
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icon.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
