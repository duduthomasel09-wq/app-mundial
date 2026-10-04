'use server';

import {
  mapPasswordUpdateErrorCode,
  mapSignInErrorCode,
  parseEmail,
  parseSignInInput,
  validateNewPassword,
  type NewPasswordError,
  type PasswordResetRequestError,
  type PasswordUpdateError,
  type SignInError,
} from '@gfg/core';
import { redirect } from 'next/navigation';

import { isPasswordRecoveryEnabled, publicEnv } from '@/lib/env';
import { createSupabaseServerClient, createSupabaseStatelessClient } from '@/lib/supabase/server';
import { clearPasswordRecovery, getPasswordRecoveryUser } from './recovery';
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

export interface PasswordResetRequestState {
  /** `true` depois do envio: a tela mostra a mesma mensagem, exista a conta ou não. */
  sent: boolean;
  error: PasswordResetRequestError | null;
}

/**
 * "Esqueci minha senha" (ADR 0017): pede ao Supabase o e-mail de recuperação.
 *
 * A resposta é **sempre a mesma** para e-mail existente ou não — erros do Supabase (conta
 * inexistente, limite de envios etc.) são ignorados de propósito, para não revelar quais
 * contas existem. O link do e-mail aponta para `NEXT_PUBLIC_ADMIN_URL` + `/auth/confirmar`
 * (nunca para o endereço recebido na requisição).
 */
export async function requestPasswordResetAction(
  _previous: PasswordResetRequestState,
  formData: FormData,
): Promise<PasswordResetRequestState> {
  const supabase = createSupabaseStatelessClient();
  if (!supabase || !isPasswordRecoveryEnabled) return { sent: false, error: 'not_configured' };

  const email = parseEmail(formData.get('email'));
  if (!email) return { sent: false, error: 'invalid_input' };

  try {
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${publicEnv.adminUrl}/auth/confirmar`,
    });
  } catch {
    // Mesma resposta em qualquer caso (ver acima). Nada é registrado.
  }

  return { sent: true, error: null };
}

export interface NewPasswordState {
  error: NewPasswordError | PasswordUpdateError | null;
}

/**
 * Define a nova senha (ADR 0017). Só funciona logo depois do link do e-mail (marca de
 * recuperação + sessão do mesmo usuário).
 *
 * Depois da troca: encerra as **outras** sessões da conta (`scope: 'others'`) e também a
 * deste navegador, e volta para /login com "senha alterada" — a pessoa entra de novo com
 * a senha nova. Quem não tem papel `editor`/`admin` troca a senha, mas continua sem acesso.
 */
export async function updatePasswordAction(
  _previous: NewPasswordState,
  formData: FormData,
): Promise<NewPasswordState> {
  const supabase = await createSupabaseServerClient();
  if (!supabase || !isPasswordRecoveryEnabled) return { error: 'not_configured' };

  const password = formData.get('password');
  const invalid = validateNewPassword(password, formData.get('confirmation'));
  if (invalid || typeof password !== 'string') return { error: invalid ?? 'invalid_input' };

  const user = await getPasswordRecoveryUser(supabase);
  if (!user) return { error: 'session_expired' };

  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: mapPasswordUpdateErrorCode(error.code) };

  await supabase.auth.signOut({ scope: 'others' });
  await supabase.auth.signOut({ scope: 'local' });
  await clearPasswordRecovery();

  redirect('/login?aviso=password_changed');
}
