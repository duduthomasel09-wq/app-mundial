/**
 * Tipos da autenticação do painel (ADR 0006 e ADR 0016).
 * Os papéis vêm do `@gfg/core` — os mesmos do banco (`public.app_role`).
 */
import type { StaffRole } from '@gfg/core';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  /** Papel mais alto do usuário (`admin` inclui `editor`). */
  role: StaffRole;
}

export interface AdminSession {
  user: AdminUser;
  /** `true` quando a sessão é simulada (modo sem login, só desenvolvimento). */
  isDevelopmentSession: boolean;
}

/**
 * Resultado da verificação de acesso ao painel:
 * - `signed_in`: login válido com papel `editor` ou `admin`;
 * - `signed_out`: sem login (ou login real desligado/sem configuração);
 * - `forbidden`: login válido, mas sem papel do painel — a sessão deve ser encerrada.
 */
export type AdminAccess =
  | { status: 'signed_in'; session: AdminSession }
  | { status: 'signed_out' }
  | { status: 'forbidden' };
