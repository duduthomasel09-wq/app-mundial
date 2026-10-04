/**
 * Leitura centralizada das variáveis de ambiente do painel (ADR 0011).
 *
 * Nenhuma chave real fica no código: os valores vêm de `.env.local`
 * (desenvolvimento) ou das variáveis configuradas na hospedagem (produção).
 * Lista completa: docs/ENVIRONMENT.md · modelo: `apps/admin/.env.example`.
 *
 * Importante: o Next.js só inclui uma variável `NEXT_PUBLIC_*` no navegador quando ela
 * aparece escrita por extenso (`process.env.NEXT_PUBLIC_...`). Não use acesso dinâmico.
 */
import {
  allowsUnauthenticatedAdmin,
  EnvReport,
  isLocaleCode,
  isLocalUrl,
  isNonProduction,
  logEnvIssues,
  readAppEnv,
  readEnum,
  readPublicKey,
  readUrl,
  rejectLocalUrlInProduction,
  warnIfMissingInProduction,
  type AppEnv,
  type LocaleCode,
} from '@gfg/core';

export type { AppEnv };

export const ADMIN_AUTH_MODES = ['disabled', 'supabase'] as const;
export type AdminAuthMode = (typeof ADMIN_AUTH_MODES)[number];

const report = new EnvReport();

const appEnv = readAppEnv(report, 'NEXT_PUBLIC_APP_ENV', process.env.NEXT_PUBLIC_APP_ENV);

/** Endereço do painel em desenvolvimento quando `NEXT_PUBLIC_ADMIN_URL` está vazia. */
const DEVELOPMENT_ADMIN_URL = 'http://localhost:3000';

/**
 * Endereço público do painel (ADR 0017), usado para montar o link do e-mail de recuperação
 * de senha. **Nunca** é montado a partir do Host/Origin da requisição.
 *
 * - Só a origem é usada (`https://painel.exemplo.com`); caminhos são descartados com aviso.
 * - development: vazia → `http://localhost:3000`.
 * - staging/production: precisa ser `https://` e não pode ser local; vazia → erro (a
 *   recuperação de senha fica desligada).
 */
function readAdminUrl(raw: string | undefined): string {
  const value = readUrl(report, 'NEXT_PUBLIC_ADMIN_URL', raw);
  if (!value) {
    return appEnv === 'development' ? DEVELOPMENT_ADMIN_URL : '';
  }

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    report.warn('NEXT_PUBLIC_ADMIN_URL', 'não é uma URL válida. Ignorada.');
    return appEnv === 'development' ? DEVELOPMENT_ADMIN_URL : '';
  }
  if (url.pathname !== '/' || url.search || url.hash) {
    report.warn(
      'NEXT_PUBLIC_ADMIN_URL',
      'deve ter só o endereço (sem caminho). Usando só a origem.',
    );
  }

  if (appEnv !== 'development' && (url.protocol !== 'https:' || isLocalUrl(url.origin))) {
    report.error(
      'NEXT_PUBLIC_ADMIN_URL',
      'fora de development precisa ser https:// e não pode ser local. Endereço descartado: a recuperação de senha fica desligada.',
    );
    return '';
  }

  return url.origin;
}

/** Variáveis seguras para o navegador (prefixo NEXT_PUBLIC_). */
export const publicEnv = {
  appEnv,
  supabaseUrl: rejectLocalUrlInProduction(
    report,
    appEnv,
    'NEXT_PUBLIC_SUPABASE_URL',
    readUrl(report, 'NEXT_PUBLIC_SUPABASE_URL', process.env.NEXT_PUBLIC_SUPABASE_URL),
  ),
  supabaseAnonKey: readPublicKey(
    report,
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  ),
  adminUrl: readAdminUrl(process.env.NEXT_PUBLIC_ADMIN_URL),
} as const;

/** Idioma do painel. Padrão: pt-BR (a equipe de conteúdo trabalha em português). */
function readLocale(raw: string | undefined): LocaleCode {
  const value = (raw ?? '').trim();
  if (!value) return 'pt-BR';
  if (isLocaleCode(value)) return value;
  report.warn('ADMIN_LOCALE', 'valor inválido; use pt-BR | en | es. Usando "pt-BR".');
  return 'pt-BR';
}

/** Variáveis usadas só no servidor. Não importar em componentes de cliente. */
export const serverEnv = {
  authMode: readEnum(
    report,
    'ADMIN_AUTH_MODE',
    process.env.ADMIN_AUTH_MODE,
    ADMIN_AUTH_MODES,
    'disabled',
  ),
  locale: readLocale(process.env.ADMIN_LOCALE),
} as const;

/**
 * Sessão simulada (sem login) só é permitida em **development** (ADR 0017, que substitui a
 * regra "fora de produção" da ADR 0013). Em staging ou production com
 * `ADMIN_AUTH_MODE=disabled`, ela é BLOQUEADA: o painel vai para /login.
 */
export const isDevelopmentSessionAllowed = allowsUnauthenticatedAdmin(serverEnv.authMode, appEnv);

if (appEnv !== 'development' && serverEnv.authMode === 'disabled') {
  report.error(
    'ADMIN_AUTH_MODE',
    `está "disabled" em ${appEnv}. BLOQUEADO: a sessão sem login só é permitida em development e o painel envia para /login. Use "supabase" (login real, ADR 0016/0017).`,
  );
}

if (serverEnv.authMode === 'supabase' && !(publicEnv.supabaseUrl && publicEnv.supabaseAnonKey)) {
  report.error(
    'ADMIN_AUTH_MODE',
    'está "supabase", mas NEXT_PUBLIC_SUPABASE_URL ou NEXT_PUBLIC_SUPABASE_ANON_KEY está vazia. Ninguém consegue entrar no painel até as duas serem preenchidas.',
  );
}

/** Mostrar o selo "Desenvolvimento" (qualquer ambiente que não seja produção). */
export const showEnvironmentBadge = isNonProduction(appEnv);

warnIfMissingInProduction(report, appEnv, {
  NEXT_PUBLIC_SUPABASE_URL: publicEnv.supabaseUrl,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: publicEnv.supabaseAnonKey,
});

export const isSupabaseConfigured = Boolean(publicEnv.supabaseUrl && publicEnv.supabaseAnonKey);

/**
 * Login real ligado e pronto para uso (ADR 0016): `ADMIN_AUTH_MODE=supabase` com URL e
 * chave pública preenchidas. Sem as duas, ninguém entra (o painel fica em /login).
 */
export const isSupabaseAuthEnabled = serverEnv.authMode === 'supabase' && isSupabaseConfigured;

if (isSupabaseAuthEnabled && !publicEnv.adminUrl) {
  report.error(
    'NEXT_PUBLIC_ADMIN_URL',
    'está vazia ou inválida com o login real ligado. A recuperação de senha fica desligada até ela ser preenchida.',
  );
}

/** Recuperação de senha disponível (ADR 0017): login real ligado + endereço do painel. */
export const isPasswordRecoveryEnabled = isSupabaseAuthEnabled && Boolean(publicEnv.adminUrl);

/** Avisos encontrados ao ler as variáveis (só nomes, nunca valores). */
export const envIssues = report.issues;
logEnvIssues('admin', envIssues);
