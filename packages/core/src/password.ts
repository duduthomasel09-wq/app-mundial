/**
 * Regras de senha (ADR 0017).
 *
 * - Mínimo de **8 caracteres** (cada letra, acento ou emoji conta como 1).
 * - Máximo de **72 bytes** em UTF-8: é o limite do bcrypt, usado pelo Supabase Auth.
 *   Letras com acento ocupam 2 bytes e emojis 4 — por isso o limite é em bytes, não em
 *   caracteres.
 * A senha nunca é alterada (espaços contam).
 */

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_BYTES = 72;

/** Quantidade de caracteres (pontos de código Unicode): um emoji simples conta 1. */
export function passwordLength(password: string): number {
  return Array.from(password).length;
}

/** Tamanho do texto em bytes UTF-8 (sem depender de `TextEncoder`). */
export function utf8ByteLength(text: string): number {
  let bytes = 0;
  for (const char of text) {
    const code = char.codePointAt(0) ?? 0;
    if (code <= 0x7f) bytes += 1;
    else if (code <= 0x7ff) bytes += 2;
    else if (code <= 0xffff) bytes += 3;
    else bytes += 4;
  }
  return bytes;
}

/** `true` se a senha cabe no limite de 72 bytes. */
export function fitsPasswordMaxBytes(password: string): boolean {
  return utf8ByteLength(password) <= PASSWORD_MAX_BYTES;
}

export const NEW_PASSWORD_ERRORS = [
  'invalid_input',
  'password_too_short',
  'password_too_long',
  'password_mismatch',
] as const;
export type NewPasswordError = (typeof NEW_PASSWORD_ERRORS)[number];

/**
 * Valida a nova senha e a confirmação (formulário "nova senha").
 * Devolve `null` se estiver tudo certo, ou o motivo do erro.
 */
export function validateNewPassword(
  password: unknown,
  confirmation: unknown,
): NewPasswordError | null {
  if (typeof password !== 'string' || typeof confirmation !== 'string') return 'invalid_input';
  if (passwordLength(password) < PASSWORD_MIN_LENGTH) return 'password_too_short';
  if (!fitsPasswordMaxBytes(password)) return 'password_too_long';
  if (password !== confirmation) return 'password_mismatch';
  return null;
}
