import { describe, expect, it } from 'vitest';

import {
  fitsPasswordMaxBytes,
  NEW_PASSWORD_ERRORS,
  PASSWORD_MAX_BYTES,
  PASSWORD_MIN_LENGTH,
  passwordLength,
  utf8ByteLength,
  validateNewPassword,
} from './password';

describe('tamanho da senha', () => {
  it('limites: mínimo 8 caracteres, máximo 72 bytes', () => {
    expect(PASSWORD_MIN_LENGTH).toBe(8);
    expect(PASSWORD_MAX_BYTES).toBe(72);
  });

  it('conta bytes UTF-8 corretamente', () => {
    expect(utf8ByteLength('abc')).toBe(3);
    expect(utf8ByteLength('ação')).toBe(6); // ç e ã têm 2 bytes cada
    expect(utf8ByteLength('€')).toBe(3);
    expect(utf8ByteLength('😀')).toBe(4);
    expect(utf8ByteLength('')).toBe(0);
  });

  it('conta caracteres: acento e emoji valem 1', () => {
    expect(passwordLength('ação')).toBe(4);
    expect(passwordLength('😀😀')).toBe(2);
  });

  it('72 bytes cabem, 73 não', () => {
    expect(fitsPasswordMaxBytes('a'.repeat(72))).toBe(true);
    expect(fitsPasswordMaxBytes('a'.repeat(73))).toBe(false);
  });

  it('acentos: 36 "ç" = 72 bytes (cabe); 37 = 74 bytes (não cabe)', () => {
    expect(fitsPasswordMaxBytes('ç'.repeat(36))).toBe(true);
    expect(fitsPasswordMaxBytes('ç'.repeat(37))).toBe(false);
  });

  it('emojis: 18 emojis = 72 bytes (cabe); 19 = 76 bytes (não cabe), mesmo com só 19 caracteres', () => {
    expect(fitsPasswordMaxBytes('😀'.repeat(18))).toBe(true);
    expect(fitsPasswordMaxBytes('😀'.repeat(19))).toBe(false);
    expect(passwordLength('😀'.repeat(19))).toBe(19);
  });
});

describe('nova senha', () => {
  it('aceita senha válida igual à confirmação', () => {
    expect(validateNewPassword('senha-boa-1', 'senha-boa-1')).toBeNull();
    expect(validateNewPassword('çãõé😀abc', 'çãõé😀abc')).toBeNull();
  });

  it('mínimo de 8 caracteres (acentos e emojis contam como 1)', () => {
    expect(validateNewPassword('1234567', '1234567')).toBe('password_too_short');
    expect(validateNewPassword('12345678', '12345678')).toBeNull();
    expect(validateNewPassword('😀😀😀😀😀😀😀', '😀😀😀😀😀😀😀')).toBe('password_too_short');
    expect(validateNewPassword('😀😀😀😀😀😀😀😀', '😀😀😀😀😀😀😀😀')).toBeNull();
  });

  it('máximo de 72 bytes', () => {
    const tooLong = 'é'.repeat(37);
    expect(validateNewPassword(tooLong, tooLong)).toBe('password_too_long');
    const limit = 'é'.repeat(36);
    expect(validateNewPassword(limit, limit)).toBeNull();
  });

  it('confirmação diferente', () => {
    expect(validateNewPassword('senha-boa-1', 'senha-boa-2')).toBe('password_mismatch');
    expect(validateNewPassword('senha-boa-1', 'senha-boa-1 ')).toBe('password_mismatch');
  });

  it('campos ausentes', () => {
    expect(validateNewPassword(null, 'x')).toBe('invalid_input');
    expect(validateNewPassword('senha-boa-1', undefined)).toBe('invalid_input');
  });

  it('lista de erros conhecida', () => {
    expect(NEW_PASSWORD_ERRORS).toEqual([
      'invalid_input',
      'password_too_short',
      'password_too_long',
      'password_mismatch',
    ]);
  });
});
