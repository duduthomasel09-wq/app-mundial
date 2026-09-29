import 'server-only';

import { isDevelopmentSessionAllowed, serverEnv } from '@/lib/env';
import type { AdminSession } from './types';

/** Sessão simulada usada enquanto a autenticação real não existe. */
const developmentSession: AdminSession = {
  user: {
    id: 'dev-admin',
    email: 'admin@exemplo.local',
    name: 'Administrador (desenvolvimento)',
    role: 'admin',
  },
  isDevelopmentSession: true,
};

/**
 * Retorna a sessão do administrador atual, ou `null` se não houver login.
 *
 * - `ADMIN_AUTH_MODE=disabled` (padrão): devolve uma sessão simulada — **só fora de
 *   produção**. Em produção ela é recusada (ADR 0006/0013) e o painel envia para /login.
 * - `ADMIN_AUTH_MODE=supabase`: ainda não implementado — devolve `null`,
 *   e o painel manda para a tela de login.
 */
export async function getAdminSession(): Promise<AdminSession | null> {
  if (serverEnv.authMode === 'disabled') {
    return isDevelopmentSessionAllowed ? developmentSession : null;
  }

  // TODO(Supabase Auth): ler a sessão real do Supabase aqui.
  return null;
}

export function isAuthEnabled(): boolean {
  return serverEnv.authMode !== 'disabled';
}

/** `true` quando o atalho "entrar sem login" pode aparecer (nunca em produção). */
export function canUseDevelopmentSession(): boolean {
  return isDevelopmentSessionAllowed;
}
