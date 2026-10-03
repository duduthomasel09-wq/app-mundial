import 'server-only';

import { decideAdminAccess } from '@gfg/core';
import type { SupabaseClient, User } from '@supabase/supabase-js';
import { cache } from 'react';

import { isDevelopmentSessionAllowed, serverEnv } from '@/lib/env';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { AdminAccess, AdminSession } from './types';

/** Sessão simulada usada só com `ADMIN_AUTH_MODE=disabled` fora de produção. */
const developmentSession: AdminSession = {
  user: {
    id: 'dev-admin',
    email: 'admin@exemplo.local',
    name: 'Administrador (desenvolvimento)',
    role: 'admin',
  },
  isDevelopmentSession: true,
};

const SIGNED_OUT: AdminAccess = { status: 'signed_out' };

/**
 * Lê os papéis do usuário em `user_roles` (a RLS só deixa ver os próprios) e decide se
 * ele pode usar o painel. Também é usado logo depois do login (Server Action).
 *
 * Se o banco não responder, lança um erro em vez de liberar ou recusar o acesso.
 */
export async function checkStaffAccess(supabase: SupabaseClient, user: User): Promise<AdminAccess> {
  const [roles, profile] = await Promise.all([
    supabase.from('user_roles').select('role').eq('user_id', user.id),
    supabase.from('profiles').select('display_name').eq('user_id', user.id).maybeSingle(),
  ]);

  if (roles.error) {
    throw new Error('Não foi possível verificar as permissões do usuário no painel.');
  }

  const decision = decideAdminAccess(roles.data.map((row: { role: unknown }) => row.role));
  if (!decision.allowed) return { status: 'forbidden' };

  const email = user.email ?? '';
  const displayName: unknown = profile.data?.display_name;

  return {
    status: 'signed_in',
    session: {
      user: {
        id: user.id,
        email,
        name: typeof displayName === 'string' && displayName.trim() ? displayName : email,
        role: decision.role,
      },
      isDevelopmentSession: false,
    },
  };
}

/**
 * Verifica o acesso ao painel na requisição atual (no servidor, a cada acesso).
 *
 * - `ADMIN_AUTH_MODE=disabled` (padrão): sessão simulada — **só fora de produção**.
 *   Em produção ela é recusada (ADR 0006/0013) e o painel envia para /login.
 * - `ADMIN_AUTH_MODE=supabase`: sessão real do Supabase Auth (cookies). O usuário é
 *   confirmado no servidor do Supabase (`getUser`) e precisa ter papel `editor` ou `admin`.
 *
 * O resultado é reaproveitado dentro da mesma requisição (`cache`).
 */
export const getAdminAccess = cache(async (): Promise<AdminAccess> => {
  if (serverEnv.authMode === 'disabled') {
    return isDevelopmentSessionAllowed
      ? { status: 'signed_in', session: developmentSession }
      : SIGNED_OUT;
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) return SIGNED_OUT;

  // `getUser()` confirma a sessão no servidor do Supabase (não confia só no cookie).
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return SIGNED_OUT;

  return checkStaffAccess(supabase, data.user);
});

/** Sessão do administrador atual, ou `null` se não houver acesso ao painel. */
export async function getAdminSession(): Promise<AdminSession | null> {
  const access = await getAdminAccess();
  return access.status === 'signed_in' ? access.session : null;
}

export function isAuthEnabled(): boolean {
  return serverEnv.authMode !== 'disabled';
}

/** `true` quando o atalho "entrar sem login" pode aparecer (nunca em produção). */
export function canUseDevelopmentSession(): boolean {
  return isDevelopmentSessionAllowed;
}
