/**
 * Regras de conta do app mobile (ADR 0018): cadastro, código de confirmação e erros.
 *
 * Funções puras, usadas pelo app e testadas aqui. A segurança de verdade continua no
 * Supabase Auth e na RLS — estas regras só validam a entrada e escolhem a mensagem.
 */
import { parseEmail } from './admin-access';
import { validateNewPassword, type NewPasswordError } from './password';

export interface SignUpInput {
  email: string;
  password: string;
}

export type SignUpInputError = NewPasswordError | 'invalid_email';

/**
 * Valida o formulário "criar conta": e-mail válido, senha de 8 caracteres a 72 bytes e
 * confirmação igual. Devolve os dados normalizados ou o motivo do erro.
 */
export function parseSignUpInput(
  email: unknown,
  password: unknown,
  confirmation: unknown,
): { ok: true; value: SignUpInput } | { ok: false; error: SignUpInputError } {
  const normalizedEmail = parseEmail(email);
  if (!normalizedEmail) return { ok: false, error: 'invalid_email' };
  const invalid = validateNewPassword(password, confirmation);
  if (invalid || typeof password !== 'string') {
    return { ok: false, error: invalid ?? 'invalid_input' };
  }
  return { ok: true, value: { email: normalizedEmail, password } };
}

/** O código de confirmação do e-mail tem exatamente 6 dígitos (ADR 0018). */
export const EMAIL_OTP_LENGTH = 6;

/**
 * Normaliza o código digitado: aceita espaços e hífens no meio (ex.: "123 456"), mas o
 * resultado precisa ter **exatamente 6 dígitos** de 0 a 9. Senão, `null`.
 */
export function parseOtpCode(input: unknown): string | null {
  if (typeof input !== 'string') return null;
  const digits = input.replace(/[\s-]/g, '');
  return new RegExp(`^[0-9]{${EMAIL_OTP_LENGTH}}$`).test(digits) ? digits : null;
}

/**
 * Erros das telas de conta do app, já no formato que as telas traduzem
 * (`mobile.auth.errors.<código>`).
 */
export const APP_AUTH_ERRORS = [
  'invalid_email',
  'invalid_input',
  'password_too_short',
  'password_too_long',
  'password_mismatch',
  'invalid_credentials',
  'code_invalid',
  'weak_password',
  'rate_limited',
  'network',
  'not_configured',
  'unknown',
] as const;
export type AppAuthError = (typeof APP_AUTH_ERRORS)[number];

/**
 * Converte o erro do Supabase Auth (código + status HTTP) num motivo da tela. A mensagem
 * original nunca aparece. `email_not_confirmed` não está aqui: o app trata esse caso
 * levando para a tela do código (ver `isEmailNotConfirmed`).
 */
export function mapAppAuthError(
  code: string | undefined | null,
  status?: number | null,
): AppAuthError {
  switch (code) {
    case 'invalid_credentials':
    case 'user_not_found':
      return 'invalid_credentials';
    case 'otp_expired':
      return 'code_invalid';
    case 'weak_password':
      return 'weak_password';
    case 'over_request_rate_limit':
    case 'over_email_send_rate_limit':
      return 'rate_limited';
    default:
      break;
  }
  if (status === 429) return 'rate_limited';
  // Sem resposta do servidor (sem internet, servidor fora do ar).
  if (status === 0) return 'network';
  return 'unknown';
}

/**
 * Erro ao confirmar o código: limite e falta de internet têm mensagem própria; qualquer
 * outro caso (errado, vencido, já usado) vira "código inválido ou vencido".
 */
export function mapOtpError(code: string | undefined | null, status?: number | null): AppAuthError {
  const mapped = mapAppAuthError(code, status);
  return mapped === 'rate_limited' || mapped === 'network' ? mapped : 'code_invalid';
}

/**
 * `true` quando o cadastro falhou porque o e-mail já tem conta. O app responde **igual a
 * um cadastro novo** (tela do código), para não revelar quais e-mails têm conta.
 */
export function isExistingAccountSignUpError(code: string | undefined | null): boolean {
  return code === 'user_already_exists' || code === 'email_exists';
}

/** `true` quando o login falhou só porque o e-mail ainda não foi confirmado. */
export function isEmailNotConfirmed(code: string | undefined | null): boolean {
  return code === 'email_not_confirmed';
}

/** Segundos de espera antes de liberar "reenviar código" de novo. */
export const RESEND_COOLDOWN_SECONDS = 60;
