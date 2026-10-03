import { describe, expect, it } from 'vitest';

import {
  ADMIN_PANEL_MIN_ROLE,
  decideAdminAccess,
  highestStaffRole,
  isSignInError,
  mapSignInErrorCode,
  parseSignInInput,
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
});
