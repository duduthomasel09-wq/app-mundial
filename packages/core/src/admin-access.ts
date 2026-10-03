/**
 * Regras de acesso ao painel administrativo (ADR 0016).
 *
 * Funções puras: o painel lê os papéis do usuário em `user_roles` (pela RLS, cada um só
 * vê os próprios) e usa estas regras para decidir se ele entra. A segurança de verdade
 * continua sendo a RLS no banco — isto só decide o que o painel mostra.
 */
import { hasStaffRole, isStaffRole, type StaffRole } from './plans';

/** Papel mínimo para entrar no painel. `admin` também vale (inclui `editor`). */
export const ADMIN_PANEL_MIN_ROLE: StaffRole = 'editor';

/**
 * Papel mais alto entre os informados (`admin` > `editor`), ou `null` se nenhum for
 * um papel do painel. Valores desconhecidos são ignorados.
 */
export function highestStaffRole(roles: readonly unknown[]): StaffRole | null {
  const staff = roles.filter(isStaffRole);
  if (staff.includes('admin')) return 'admin';
  if (staff.includes('editor')) return 'editor';
  return null;
}

export type AdminAccessDecision =
  { allowed: true; role: StaffRole } | { allowed: false; reason: 'no_staff_role' };

/**
 * Decide se um usuário com login válido pode usar o painel.
 * Sem papel `editor` ou `admin` → recusado (o painel encerra a sessão).
 */
export function decideAdminAccess(roles: readonly unknown[]): AdminAccessDecision {
  const role = highestStaffRole(roles);
  if (role && hasStaffRole([role], ADMIN_PANEL_MIN_ROLE)) {
    return { allowed: true, role };
  }
  return { allowed: false, reason: 'no_staff_role' };
}

/** Motivos de falha no login, já no formato que a tela traduz. */
export const SIGN_IN_ERRORS = [
  'invalid_input',
  'invalid_credentials',
  'email_not_confirmed',
  'rate_limited',
  'no_permission',
  'not_configured',
  'unknown',
] as const;
export type SignInError = (typeof SIGN_IN_ERRORS)[number];

export function isSignInError(value: unknown): value is SignInError {
  return typeof value === 'string' && (SIGN_IN_ERRORS as readonly string[]).includes(value);
}

/**
 * Converte o código de erro do Supabase Auth (`AuthError.code`) num motivo da tela.
 * Códigos desconhecidos viram `unknown` — nunca mostramos a mensagem original ao usuário.
 */
export function mapSignInErrorCode(code: string | undefined | null): SignInError {
  switch (code) {
    case 'invalid_credentials':
    case 'user_not_found':
      return 'invalid_credentials';
    case 'email_not_confirmed':
      return 'email_not_confirmed';
    case 'over_request_rate_limit':
    case 'over_email_send_rate_limit':
      return 'rate_limited';
    default:
      return 'unknown';
  }
}

/** Limites simples dos campos do formulário (antes de chamar o Supabase). */
const EMAIL_MAX_LENGTH = 254;
const PASSWORD_MAX_LENGTH = 72;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface SignInInput {
  email: string;
  password: string;
}

/**
 * Valida e normaliza o que veio do formulário. Devolve `null` se for inválido.
 * A senha não é alterada (espaços contam); o e-mail perde espaços e fica minúsculo.
 */
export function parseSignInInput(email: unknown, password: unknown): SignInInput | null {
  if (typeof email !== 'string' || typeof password !== 'string') return null;
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail || normalizedEmail.length > EMAIL_MAX_LENGTH) return null;
  if (!EMAIL_PATTERN.test(normalizedEmail)) return null;
  if (!password || password.length > PASSWORD_MAX_LENGTH) return null;
  return { email: normalizedEmail, password };
}
