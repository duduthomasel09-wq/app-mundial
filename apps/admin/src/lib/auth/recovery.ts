import 'server-only';

import type { SupabaseClient, User } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

import { authCookieOptions } from '@/lib/supabase/cookies';

/**
 * Marca de "recuperação de senha em andamento" (ADR 0017).
 *
 * Gravada por `/auth/confirmar` depois que o link do e-mail é validado. A página
 * `/nova-senha` só aceita trocar a senha quando esta marca existe **e** pertence ao
 * usuário da sessão atual — assim, uma sessão comum do painel não troca a senha sem
 * passar pelo e-mail. Guarda só o id do usuário (nunca o token do link).
 */
const RECOVERY_COOKIE = 'gfg-recuperacao-senha';
const RECOVERY_MAX_AGE_SECONDS = 15 * 60;

export async function markPasswordRecovery(userId: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(RECOVERY_COOKIE, userId, {
    ...authCookieOptions,
    maxAge: RECOVERY_MAX_AGE_SECONDS,
  });
}

export async function clearPasswordRecovery(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete({ name: RECOVERY_COOKIE, path: authCookieOptions.path });
}

/**
 * Usuário que pode definir uma nova senha agora: sessão válida (confirmada no servidor
 * do Supabase) + marca de recuperação do mesmo usuário. Senão, `null`.
 */
export async function getPasswordRecoveryUser(supabase: SupabaseClient): Promise<User | null> {
  const cookieStore = await cookies();
  const marked = cookieStore.get(RECOVERY_COOKIE)?.value;
  if (!marked) return null;

  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user || data.user.id !== marked) return null;
  return data.user;
}
