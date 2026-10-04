import { describe, expect, it } from 'vitest';

import {
  ADMIN_PANEL_MIN_ROLE,
  allowsUnauthenticatedAdmin,
  decideAdminAccess,
  highestStaffRole,
  isRecoveryLinkError,
  isSignInError,
  isSignInNotice,
  mapPasswordUpdateErrorCode,
  mapSignInErrorCode,
  parseEmail,
  parseSignInInput,
  PASSWORD_RESET_REQUEST_ERRORS,
  SIGN_IN_ERRORS,
} from './admin-access';

describe('acesso ao painel', () => {
  it('exige pelo menos editor', () => {
    expect(ADMIN_PANEL_MIN_ROLE).toBe('editor');
  });

  it('recusa usuário sem papel', () => {
    expect(decideAdminAccess([])).toEqual({ allowed: false, reason: 'no_staff_role' });
  });

  it('recusa papéis desconhecidos ou o papel comum "user"', () => {
    expect(decideAdminAccess(['user'])).toEqual({ allowed: false, reason: 'no_staff_role' });
    expect(decideAdminAccess(['superadmin', 'ADMIN', '', null, 1])).toEqual({
      allowed: false,
      reason: 'no_staff_role',
    });
  });

  it('libera editor', () => {
    expect(decideAdminAccess(['editor'])).toEqual({ allowed: true, role: 'editor' });
  });

  it('libera admin (admin inclui editor)', () => {
    expect(decideAdminAccess(['admin'])).toEqual({ allowed: true, role: 'admin' });
  });

  it('com os dois papéis, vale o mais alto', () => {
    expect(decideAdminAccess(['editor', 'admin'])).toEqual({ allowed: true, role: 'admin' });
    expect(highestStaffRole(['admin', 'editor'])).toBe('admin');
  });

  it('ignora valores inválidos misturados a papéis válidos', () => {
    expect(highestStaffRole(['x', 'editor', undefined])).toBe('editor');
    expect(highestStaffRole([])).toBeNull();
  });
});

describe('erros de login', () => {
  it('traduz os códigos do Supabase Auth', () => {
    expect(mapSignInErrorCode('invalid_credentials')).toBe('invalid_credentials');
    expect(mapSignInErrorCode('user_not_found')).toBe('invalid_credentials');
    expect(mapSignInErrorCode('email_not_confirmed')).toBe('email_not_confirmed');
    expect(mapSignInErrorCode('over_request_rate_limit')).toBe('rate_limited');
  });

  it('código desconhecido ou ausente vira "unknown"', () => {
    expect(mapSignInErrorCode('something_new')).toBe('unknown');
    expect(mapSignInErrorCode(undefined)).toBe('unknown');
    expect(mapSignInErrorCode(null)).toBe('unknown');
  });

  it('reconhece os motivos válidos', () => {
    for (const error of SIGN_IN_ERRORS) expect(isSignInError(error)).toBe(true);
    expect(isSignInError('sem-permissao')).toBe(false);
    expect(isSignInError(undefined)).toBe(false);
  });
});

describe('formulário de login', () => {
  it('normaliza o e-mail e mantém a senha como veio', () => {
    expect(parseSignInInput('  Pessoa@Exemplo.COM ', ' senha 123 ')).toEqual({
      email: 'pessoa@exemplo.com',
      password: ' senha 123 ',
    });
  });

  it('recusa campos vazios, ausentes ou inválidos', () => {
    expect(parseSignInInput('', 'x')).toBeNull();
    expect(parseSignInInput('pessoa@exemplo.com', '')).toBeNull();
    expect(parseSignInInput('sem-arroba', 'senha1234')).toBeNull();
    expect(parseSignInInput(null, 'senha1234')).toBeNull();
    expect(parseSignInInput('pessoa@exemplo.com', undefined)).toBeNull();
  });

  it('recusa valores grandes demais', () => {
    expect(parseSignInInput(`${'a'.repeat(250)}@x.com`, 'senha1234')).toBeNull();
    expect(parseSignInInput('pessoa@exemplo.com', 'a'.repeat(73))).toBeNull();
  });

  it('limite da senha é em bytes (acentos e emojis)', () => {
    expect(parseSignInInput('pessoa@exemplo.com', 'ç'.repeat(36))).not.toBeNull();
    expect(parseSignInInput('pessoa@exemplo.com', 'ç'.repeat(37))).toBeNull();
    expect(parseSignInInput('pessoa@exemplo.com', '😀'.repeat(18))).not.toBeNull();
    expect(parseSignInInput('pessoa@exemplo.com', '😀'.repeat(19))).toBeNull();
  });

  it('valida e normaliza o e-mail sozinho (formulário "esqueci minha senha")', () => {
    expect(parseEmail('  Pessoa@Exemplo.COM ')).toBe('pessoa@exemplo.com');
    expect(parseEmail('sem-arroba')).toBeNull();
    expect(parseEmail('')).toBeNull();
    expect(parseEmail(undefined)).toBeNull();
  });
});

describe('sessão sem login (ADMIN_AUTH_MODE=disabled)', () => {
  it('só é permitida em development', () => {
    expect(allowsUnauthenticatedAdmin('disabled', 'development')).toBe(true);
  });

  it('staging NÃO pode usar disabled', () => {
    expect(allowsUnauthenticatedAdmin('disabled', 'staging')).toBe(false);
  });

  it('production NÃO pode usar disabled', () => {
    expect(allowsUnauthenticatedAdmin('disabled', 'production')).toBe(false);
  });

  it('com login real nunca há sessão simulada', () => {
    expect(allowsUnauthenticatedAdmin('supabase', 'development')).toBe(false);
  });
});

describe('recuperação de senha', () => {
  it('pedir o e-mail só tem erros que não revelam se a conta existe', () => {
    expect(PASSWORD_RESET_REQUEST_ERRORS).toEqual(['invalid_input', 'not_configured']);
  });

  it('reconhece o erro de link inválido vindo da URL', () => {
    expect(isRecoveryLinkError('link_invalid')).toBe(true);
    expect(isRecoveryLinkError('otp_expired')).toBe(false);
    expect(isRecoveryLinkError(undefined)).toBe(false);
  });

  it('traduz os erros de troca de senha', () => {
    expect(mapPasswordUpdateErrorCode('weak_password')).toBe('weak_password');
    expect(mapPasswordUpdateErrorCode('same_password')).toBe('same_password');
    expect(mapPasswordUpdateErrorCode('session_not_found')).toBe('session_expired');
    expect(mapPasswordUpdateErrorCode('reauthentication_needed')).toBe('session_expired');
    expect(mapPasswordUpdateErrorCode('over_request_rate_limit')).toBe('rate_limited');
    expect(mapPasswordUpdateErrorCode('qualquer_outro')).toBe('unknown');
    expect(mapPasswordUpdateErrorCode(undefined)).toBe('unknown');
  });

  it('aviso de senha alterada na tela de login vem de lista fixa', () => {
    expect(isSignInNotice('password_changed')).toBe(true);
    expect(isSignInNotice('<script>')).toBe(false);
  });
});
