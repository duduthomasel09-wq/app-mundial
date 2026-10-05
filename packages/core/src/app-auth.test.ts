import { describe, expect, it } from 'vitest';

import {
  APP_AUTH_ERRORS,
  EMAIL_OTP_LENGTH,
  isEmailNotConfirmed,
  isExistingAccountSignUpError,
  mapAppAuthError,
  mapOtpError,
  parseOtpCode,
  parseSignUpInput,
  RESEND_COOLDOWN_SECONDS,
} from './app-auth';

describe('cadastro no app', () => {
  it('aceita dados válidos e normaliza o e-mail', () => {
    expect(parseSignUpInput(' Pessoa@Exemplo.com ', 'senha-boa-1', 'senha-boa-1')).toEqual({
      ok: true,
      value: { email: 'pessoa@exemplo.com', password: 'senha-boa-1' },
    });
  });

  it('e-mail inválido', () => {
    expect(parseSignUpInput('sem-arroba', 'senha-boa-1', 'senha-boa-1')).toEqual({
      ok: false,
      error: 'invalid_email',
    });
  });

  it('senha curta, longa (bytes) e confirmação diferente', () => {
    expect(parseSignUpInput('a@b.co', '1234567', '1234567')).toEqual({
      ok: false,
      error: 'password_too_short',
    });
    const long = 'é'.repeat(37); // 74 bytes
    expect(parseSignUpInput('a@b.co', long, long)).toEqual({
      ok: false,
      error: 'password_too_long',
    });
    expect(parseSignUpInput('a@b.co', '😀'.repeat(19), '😀'.repeat(19))).toEqual({
      ok: false,
      error: 'password_too_long',
    });
    expect(parseSignUpInput('a@b.co', 'senha-boa-1', 'senha-boa-2')).toEqual({
      ok: false,
      error: 'password_mismatch',
    });
  });

  it('acentos e emojis dentro do limite são aceitos', () => {
    const ok = 'ção😀'.repeat(2) + 'abcd';
    expect(parseSignUpInput('a@b.co', ok, ok).ok).toBe(true);
  });
});

describe('código de confirmação (6 dígitos)', () => {
  it('tem exatamente 6 dígitos', () => {
    expect(EMAIL_OTP_LENGTH).toBe(6);
    expect(parseOtpCode('123456')).toBe('123456');
  });

  it('aceita espaços e hífen no meio', () => {
    expect(parseOtpCode(' 123 456 ')).toBe('123456');
    expect(parseOtpCode('123-456')).toBe('123456');
  });

  it('recusa menos ou mais de 6 dígitos', () => {
    expect(parseOtpCode('12345')).toBeNull();
    expect(parseOtpCode('1234567')).toBeNull();
    expect(parseOtpCode('12345678')).toBeNull();
  });

  it('recusa letras, vazio e valores que não são texto', () => {
    expect(parseOtpCode('12a456')).toBeNull();
    expect(parseOtpCode('١٢٣٤٥٦')).toBeNull(); // dígitos de outra escrita
    expect(parseOtpCode('')).toBeNull();
    expect(parseOtpCode(null)).toBeNull();
    expect(parseOtpCode(123456)).toBeNull();
  });
});

describe('erros do Supabase no app', () => {
  it('login: credenciais inválidas (mesma mensagem para conta inexistente)', () => {
    expect(mapAppAuthError('invalid_credentials')).toBe('invalid_credentials');
    expect(mapAppAuthError('user_not_found')).toBe('invalid_credentials');
  });

  it('limite de tentativas/e-mails', () => {
    expect(mapAppAuthError('over_email_send_rate_limit')).toBe('rate_limited');
    expect(mapAppAuthError('over_request_rate_limit')).toBe('rate_limited');
    expect(mapAppAuthError(undefined, 429)).toBe('rate_limited');
  });

  it('sem internet', () => {
    expect(mapAppAuthError(undefined, 0)).toBe('network');
  });

  it('senha fraca e códigos desconhecidos', () => {
    expect(mapAppAuthError('weak_password')).toBe('weak_password');
    expect(mapAppAuthError('qualquer_outro', 500)).toBe('unknown');
    expect(mapAppAuthError(null)).toBe('unknown');
  });

  it('código errado, vencido ou já usado → "código inválido"', () => {
    expect(mapOtpError('otp_expired', 403)).toBe('code_invalid');
    expect(mapOtpError('validation_failed', 400)).toBe('code_invalid');
    expect(mapOtpError(undefined, 403)).toBe('code_invalid');
    expect(mapOtpError('over_request_rate_limit', 429)).toBe('rate_limited');
    expect(mapOtpError(undefined, 0)).toBe('network');
  });

  it('cadastro com e-mail que já tem conta é tratado como cadastro novo', () => {
    expect(isExistingAccountSignUpError('user_already_exists')).toBe(true);
    expect(isExistingAccountSignUpError('email_exists')).toBe(true);
    expect(isExistingAccountSignUpError('weak_password')).toBe(false);
    expect(isExistingAccountSignUpError(undefined)).toBe(false);
  });

  it('e-mail não confirmado é tratado à parte', () => {
    expect(isEmailNotConfirmed('email_not_confirmed')).toBe(true);
    expect(isEmailNotConfirmed('invalid_credentials')).toBe(false);
  });

  it('lista de erros e espera do reenvio', () => {
    expect(APP_AUTH_ERRORS).toContain('code_invalid');
    expect(APP_AUTH_ERRORS).not.toContain('email_not_confirmed');
    expect(RESEND_COOLDOWN_SECONDS).toBe(60);
  });
});
