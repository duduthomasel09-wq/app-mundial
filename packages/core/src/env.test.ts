import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  EnvReport,
  isAppEnv,
  logEnvIssues,
  looksLikeSecretKey,
  readAppEnv,
  readEnum,
  readPublicKey,
  readUrl,
  warnIfMissingInProduction,
} from './env';

// Chaves FALSAS, montadas só para o teste (não são credenciais de verdade).
const fakeJwt = (role: string) =>
  ['eyJhbGciOiJIUzI1NiJ9', btoa(JSON.stringify({ role })).replace(/=+$/, ''), 'assinatura'].join(
    '.',
  );

describe('variáveis de ambiente', () => {
  afterEach(() => vi.restoreAllMocks());

  it('ambiente: aceita os três e usa development como padrão', () => {
    const report = new EnvReport();
    expect(readAppEnv(report, 'X', 'staging')).toBe('staging');
    expect(readAppEnv(report, 'X', ' production ')).toBe('production');
    expect(readAppEnv(report, 'X', undefined)).toBe('development');
    expect(readAppEnv(report, 'X', '')).toBe('development');
    expect(report.issues).toEqual([]);
    expect(isAppEnv('test')).toBe(false);
  });

  it('valor inválido usa o padrão e gera aviso com o nome da variável', () => {
    const report = new EnvReport();
    expect(readAppEnv(report, 'NEXT_PUBLIC_APP_ENV', 'prod')).toBe('development');
    expect(
      readEnum(report, 'ADMIN_AUTH_MODE', 'supabse', ['disabled', 'supabase'], 'disabled'),
    ).toBe('disabled');
    expect(report.issues.map((i) => i.variable)).toEqual([
      'NEXT_PUBLIC_APP_ENV',
      'ADMIN_AUTH_MODE',
    ]);
    expect(report.issues.every((i) => i.level === 'warning')).toBe(true);
  });

  it('URL: aceita http(s), remove barra final e recusa texto solto', () => {
    const report = new EnvReport();
    expect(readUrl(report, 'U', 'https://abc.supabase.co/')).toBe('https://abc.supabase.co');
    expect(readUrl(report, 'U', 'http://127.0.0.1:54321')).toBe('http://127.0.0.1:54321');
    expect(readUrl(report, 'U', '')).toBe('');
    expect(report.issues).toEqual([]);
    expect(readUrl(report, 'U', 'abc.supabase.co')).toBe('');
    expect(report.issues).toHaveLength(1);
  });

  it('detecta chaves secretas do Supabase', () => {
    expect(looksLikeSecretKey('sb_secret_exemplo')).toBe(true);
    expect(looksLikeSecretKey(fakeJwt('service_role'))).toBe(true);
    expect(looksLikeSecretKey(fakeJwt('anon'))).toBe(false);
    expect(looksLikeSecretKey('sb_publishable_exemplo')).toBe(false);
    expect(looksLikeSecretKey('texto.sem.base64!')).toBe(false);
  });

  it('chave pública: aceita a publishable/anon e descarta a secreta com erro', () => {
    const report = new EnvReport();
    expect(readPublicKey(report, 'K', 'sb_publishable_exemplo')).toBe('sb_publishable_exemplo');
    expect(readPublicKey(report, 'K', fakeJwt('anon'))).toBe(fakeJwt('anon'));
    expect(report.issues).toEqual([]);
    expect(readPublicKey(report, 'K', 'sb_secret_exemplo')).toBe('');
    expect(readPublicKey(report, 'K', fakeJwt('service_role'))).toBe('');
    expect(report.issues.map((i) => i.level)).toEqual(['error', 'error']);
  });

  it('avisa sobre variáveis vazias só em produção', () => {
    const dev = new EnvReport();
    warnIfMissingInProduction(dev, 'development', { A: '' });
    expect(dev.issues).toEqual([]);

    const prod = new EnvReport();
    warnIfMissingInProduction(prod, 'production', { A: '', B: 'ok' });
    expect(prod.issues.map((i) => i.variable)).toEqual(['A']);
  });

  it('o log mostra o nome da variável, nunca o valor', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    const report = new EnvReport();
    readPublicKey(report, 'NEXT_PUBLIC_SUPABASE_ANON_KEY', 'sb_secret_NAO_MOSTRAR');
    readUrl(report, 'NEXT_PUBLIC_SUPABASE_URL', 'nao-mostrar');
    logEnvIssues('admin', report.issues);

    const printed = [...warn.mock.calls, ...error.mock.calls].flat().join('\n');
    expect(printed).toContain('NEXT_PUBLIC_SUPABASE_ANON_KEY');
    expect(printed).not.toContain('NAO_MOSTRAR');
    expect(printed).not.toContain('nao-mostrar');
  });
});
