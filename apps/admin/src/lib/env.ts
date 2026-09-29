/**
 * Leitura centralizada das variáveis de ambiente do painel.
 *
 * Nenhuma chave real fica no código: os valores vêm de `.env.local`
 * (desenvolvimento) ou das variáveis configuradas na hospedagem (produção).
 * Veja `apps/admin/.env.example`.
 */

export type AppEnv = 'development' | 'staging' | 'production';
export type AdminAuthMode = 'disabled' | 'supabase';

function readAppEnv(value: string | undefined): AppEnv {
  if (value === 'staging' || value === 'production') return value;
  return 'development';
}

function readAuthMode(value: string | undefined): AdminAuthMode {
  return value === 'supabase' ? 'supabase' : 'disabled';
}

/** Variáveis seguras para o navegador (prefixo NEXT_PUBLIC_). */
export const publicEnv = {
  appEnv: readAppEnv(process.env.NEXT_PUBLIC_APP_ENV),
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
} as const;

/** Variáveis usadas só no servidor. Não importar em componentes de cliente. */
export const serverEnv = {
  authMode: readAuthMode(process.env.ADMIN_AUTH_MODE),
} as const;

export const isSupabaseConfigured = Boolean(publicEnv.supabaseUrl && publicEnv.supabaseAnonKey);
