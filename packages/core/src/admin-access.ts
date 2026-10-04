/**
 * Regras de acesso ao painel administrativo (ADR 0016).
 *
 * Funções puras: o painel lê os papéis do usuário em `user_roles` (pela RLS, cada um só
 * vê os próprios) e usa estas regras para decidir se ele entra. A segurança de verdade
 * continua sendo a RLS no banco — isto só decide o que o painel mostra.
 */
import type { AppEnv } from './env';
import { fitsPasswordMaxBytes } from './password';
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
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Normaliza e valida um e-mail (sem espaços, minúsculo). Devolve `null` se for inválido. */
export function parseEmail(email: unknown): string | null {
  if (typeof email !== 'string') return null;
  const normalized = email.trim().toLowerCase();
  if (!normalized || normalized.length > EMAIL_MAX_LENGTH) return null;
  return EMAIL_PATTERN.test(normalized) ? normalized : null;
}

export interface SignInInput {
  email: string;
  password: string;
}

/**
 * Valida e normaliza o que veio do formulário de login. Devolve `null` se for inválido.
 * A senha não é alterada (espaços contam) e pode ter no máximo 72 **bytes** (limite do
 * Supabase Auth — ver `password.ts`); o e-mail perde espaços e fica minúsculo.
 */
export function parseSignInInput(email: unknown, password: unknown): SignInInput | null {
  const normalizedEmail = parseEmail(email);
  if (!normalizedEmail || typeof password !== 'string') return null;
  if (!password || !fitsPasswordMaxBytes(password)) return null;
  return { email: normalizedEmail, password };
}

/**
 * Sessão simulada do painel (sem login) só é permitida com `ADMIN_AUTH_MODE=disabled` em
 * **development** (ADR 0017, substitui a regra "fora de produção" da ADR 0013).
 * Staging e production exigem o login real.
 */
export function allowsUnauthenticatedAdmin(authMode: string, appEnv: AppEnv): boolean {
  return authMode === 'disabled' && appEnv === 'development';
}

/** Motivos de erro ao pedir o e-mail de recuperação. Qualquer outro caso responde "enviado". */
export const PASSWORD_RESET_REQUEST_ERRORS = ['invalid_input', 'not_configured'] as const;
export type PasswordResetRequestError = (typeof PASSWORD_RESET_REQUEST_ERRORS)[number];

/** Motivos de erro do link de recuperação (vem na URL de `/esqueci-senha`). */
export const RECOVERY_LINK_ERRORS = ['link_invalid'] as const;
export type RecoveryLinkError = (typeof RECOVERY_LINK_ERRORS)[number];

export function isRecoveryLinkError(value: unknown): value is RecoveryLinkError {
  return typeof value === 'string' && (RECOVERY_LINK_ERRORS as readonly string[]).includes(value);
}

/** Erros que o Supabase pode devolver ao trocar a senha, já no formato da tela. */
export const PASSWORD_UPDATE_ERRORS = [
  'weak_password',
  'same_password',
  'session_expired',
  'rate_limited',
  'not_configured',
  'unknown',
] as const;
export type PasswordUpdateError = (typeof PASSWORD_UPDATE_ERRORS)[number];

/**
 * Converte o código do Supabase Auth (`updateUser`) num motivo da tela. Códigos
 * desconhecidos viram `unknown` — a mensagem original nunca aparece para o usuário.
 */
export function mapPasswordUpdateErrorCode(code: string | undefined | null): PasswordUpdateError {
  switch (code) {
    case 'weak_password':
      return 'weak_password';
    case 'same_password':
      return 'same_password';
    case 'session_not_found':
    case 'session_expired':
    case 'refresh_token_not_found':
    case 'reauthentication_needed':
    case 'reauthentication_not_valid':
    case 'user_not_found':
      return 'session_expired';
    case 'over_request_rate_limit':
      return 'rate_limited';
    default:
      return 'unknown';
  }
}

/** Avisos mostrados na tela de login (vêm na URL, sempre de uma lista fixa). */
export const SIGN_IN_NOTICES = ['password_changed'] as const;
export type SignInNotice = (typeof SIGN_IN_NOTICES)[number];

export function isSignInNotice(value: unknown): value is SignInNotice {
  return typeof value === 'string' && (SIGN_IN_NOTICES as readonly string[]).includes(value);
}
