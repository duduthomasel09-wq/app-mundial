/**
 * Leitura centralizada das variáveis de ambiente do app (ADR 0011).
 *
 * Os valores vêm de `apps/mobile/.env.local` (desenvolvimento) ou das variáveis
 * configuradas no build de produção. Lista completa: docs/ENVIRONMENT.md.
 *
 * Importante:
 * - Só variáveis com prefixo `EXPO_PUBLIC_` chegam ao app — e ficam VISÍVEIS para qualquer
 *   pessoa que tenha o app. Nunca coloque segredos aqui.
 * - O Expo só substitui `process.env.EXPO_PUBLIC_...` escrito por extenso. Não use
 *   acesso dinâmico (ex.: `process.env[nome]`).
 */
import {
  EnvReport,
  isNonProduction,
  logEnvIssues,
  readAppEnv,
  readPublicKey,
  readUrl,
  rejectLocalUrlInProduction,
  warnIfMissingInProduction,
} from '@gfg/core';

const report = new EnvReport();

const appEnv = readAppEnv(report, 'EXPO_PUBLIC_APP_ENV', process.env.EXPO_PUBLIC_APP_ENV);

export const env = {
  appEnv,
  // Em produção, URL local (localhost/127.0.0.1) é erro de configuração e é descartada.
  supabaseUrl: rejectLocalUrlInProduction(
    report,
    appEnv,
    'EXPO_PUBLIC_SUPABASE_URL',
    readUrl(report, 'EXPO_PUBLIC_SUPABASE_URL', process.env.EXPO_PUBLIC_SUPABASE_URL),
  ),
  supabaseAnonKey: readPublicKey(
    report,
    'EXPO_PUBLIC_SUPABASE_ANON_KEY',
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  ),
} as const;

warnIfMissingInProduction(report, appEnv, {
  EXPO_PUBLIC_SUPABASE_URL: env.supabaseUrl,
  EXPO_PUBLIC_SUPABASE_ANON_KEY: env.supabaseAnonKey,
});

/** Avisos encontrados ao ler as variáveis (só nomes, nunca valores). */
export const envIssues = report.issues;
logEnvIssues('mobile', envIssues);

/** Mostrar o selo "Desenvolvimento" (qualquer ambiente que não seja produção). */
export const showEnvironmentBadge = isNonProduction(appEnv);

export const isSupabaseConfigured = Boolean(env.supabaseUrl && env.supabaseAnonKey);
