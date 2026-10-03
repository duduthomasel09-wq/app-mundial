'use server';

import { mapSignInErrorCode, parseSignInInput, type SignInError } from '@gfg/core';
import { redirect } from 'next/navigation';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { checkStaffAccess } from './session';

export interface SignInState {
  error: SignInError | null;
}

/**
 * Entrar com e-mail e senha (ADR 0016). Roda só no servidor.
 *
 * Depois do login, confere o papel: sem `editor`/`admin`, a sessão recém-criada é
 * encerrada na hora e a tela mostra "sem permissão".
 */
export async function signInAction(
  _previous: SignInState,
  formData: FormData,
): Promise<SignInState> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { error: 'not_configured' };

  const input = parseSignInInput(formData.get('email'), formData.get('password'));
  if (!input) return { error: 'invalid_input' };

  const { data, error } = await supabase.auth.signInWithPassword(input);
  if (error || !data.user) return { error: mapSignInErrorCode(error?.code) };

  let allowed = false;
  try {
    allowed = (await checkStaffAccess(supabase, data.user)).status === 'signed_in';
  } catch {
    await supabase.auth.signOut({ scope: 'local' });
    return { error: 'unknown' };
  }

  if (!allowed) {
    await supabase.auth.signOut({ scope: 'local' });
    return { error: 'no_permission' };
  }

  redirect('/dashboard');
}

/** Sair: encerra a sessão deste navegador e volta para /login. */
export async function signOutAction(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  if (supabase) {
    await supabase.auth.signOut({ scope: 'local' });
  }
  redirect('/login');
}
