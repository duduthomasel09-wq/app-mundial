import 'server-only';

import { serverEnv } from '@/lib/env';
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
 * - `ADMIN_AUTH_MODE=disabled` (padrão): devolve uma sessão simulada.
 * - `ADMIN_AUTH_MODE=supabase`: ainda não implementado — devolve `null`,
 *   e o painel manda para a tela de login.
 */
export async function getAdminSession(): Promise<AdminSession | null> {
  if (serverEnv.authMode === 'disabled') {
    return developmentSession;
  }

  // TODO(Supabase Auth): ler a sessão real do Supabase aqui.
  return null;
}

export function isAuthEnabled(): boolean {
  return serverEnv.authMode !== 'disabled';
}
