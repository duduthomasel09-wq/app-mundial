/**
 * Tipos da autenticação do painel.
 * A implementação real (Supabase Auth) entra numa etapa futura.
 */

export type AdminRole = 'admin' | 'editor';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
}

export interface AdminSession {
  user: AdminUser;
  /** `true` quando a sessão é simulada (modo sem login, só desenvolvimento). */
  isDevelopmentSession: boolean;
}
