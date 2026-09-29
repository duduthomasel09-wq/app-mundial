/**
 * Leitura e validação de variáveis de ambiente (ADR 0011).
 *
 * TypeScript puro, sem biblioteca de validação. Cada app lê `process.env` do seu jeito
 * (o Expo e o Next.js exigem `process.env.NOME` escrito por extenso) e passa os valores
 * brutos para estas funções, que devolvem valores seguros e uma lista de avisos.
 *
 * Regra geral: valor ausente usa o padrão sem aviso; valor inválido usa o padrão e gera
 * aviso — o app nunca quebra por causa de uma variável mal escrita.
 */

/** Ambientes do projeto. `staging` = teste/homologação. */
export const APP_ENVS = ['development', 'staging', 'production'] as const;
export type AppEnv = (typeof APP_ENVS)[number];
export const DEFAULT_APP_ENV: AppEnv = 'development';

export type EnvIssueLevel = 'warning' | 'error';

export interface EnvIssue {
  /** Nome da variável (nunca o valor, que pode ser secreto). */
  variable: string;
  level: EnvIssueLevel;
  message: string;
}

/** Acumula avisos durante a leitura das variáveis. */
export class EnvReport {
  readonly issues: EnvIssue[] = [];

  warn(variable: string, message: string): void {
    this.issues.push({ variable, level: 'warning', message });
  }

  error(variable: string, message: string): void {
    this.issues.push({ variable, level: 'error', message });
  }
}

const clean = (raw: string | undefined): string => (raw ?? '').trim();

export function isAppEnv(value: unknown): value is AppEnv {
  return typeof value === 'string' && (APP_ENVS as readonly string[]).includes(value);
}

/** Lê um valor que precisa estar numa lista (ex.: `disabled | supabase`). */
export function readEnum<T extends string>(
  report: EnvReport,
  variable: string,
  raw: string | undefined,
  allowed: readonly T[],
  fallback: T,
): T {
  const value = clean(raw);
  if (!value) return fallback;
  if ((allowed as readonly string[]).includes(value)) return value as T;
  report.warn(variable, `valor inválido; use ${allowed.join(' | ')}. Usando "${fallback}".`);
  return fallback;
}

export function readAppEnv(report: EnvReport, variable: string, raw: string | undefined): AppEnv {
  return readEnum(report, variable, raw, APP_ENVS, DEFAULT_APP_ENV);
}

/** Lê uma URL http(s). Vazia é permitida (serviço ainda não configurado). */
export function readUrl(report: EnvReport, variable: string, raw: string | undefined): string {
  const value = clean(raw);
  if (!value) return '';
  if (/^https?:\/\/[^\s/]+/.test(value)) return value.replace(/\/+$/, '');
  report.warn(variable, 'não parece uma URL (deve começar com http:// ou https://). Ignorada.');
  return '';
}

/**
 * Lê uma chave que vai para o app/navegador (variáveis `EXPO_PUBLIC_*`/`NEXT_PUBLIC_*`).
 * Se for uma chave **secreta** do Supabase, ela é descartada e gera erro: segredos nunca
 * podem ir para o lado do cliente.
 */
export function readPublicKey(
  report: EnvReport,
  variable: string,
  raw: string | undefined,
): string {
  const value = clean(raw);
  if (!value) return '';
  if (looksLikeSecretKey(value)) {
    report.error(
      variable,
      'contém uma chave SECRETA (secret/service_role). Ela foi descartada: use a chave pública (publishable/anon) e troque a chave secreta no Supabase.',
    );
    return '';
  }
  return value;
}

/** Detecta chaves secretas do Supabase: formato novo (`sb_secret_…`) ou JWT com papel `service_role`. */
export function looksLikeSecretKey(value: string): boolean {
  if (value.startsWith('sb_secret_')) return true;
  const payload = value.split('.')[1];
  if (!payload || typeof globalThis.atob !== 'function') return false;
  try {
    const json = globalThis.atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return /"role"\s*:\s*"service_role"/.test(json);
  } catch {
    return false;
  }
}

/** Avisa quando variáveis necessárias em produção estão vazias. */
export function warnIfMissingInProduction(
  report: EnvReport,
  appEnv: AppEnv,
  values: Record<string, string>,
): void {
  if (appEnv !== 'production') return;
  for (const [variable, value] of Object.entries(values)) {
    if (!value) report.warn(variable, 'está vazia em produção.');
  }
}

/** Mostra os avisos no console (só nomes de variáveis, nunca valores). */
export function logEnvIssues(source: string, issues: readonly EnvIssue[]): void {
  for (const issue of issues) {
    const text = `[${source}] Variável de ambiente ${issue.variable}: ${issue.message}`;
    if (issue.level === 'error') console.error(text);
    else console.warn(text);
  }
}
