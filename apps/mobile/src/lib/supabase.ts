import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';

import { env, isSupabaseConfigured } from './env';
import { sessionStorage } from './storage/session-storage';

/**
 * Cliente Supabase do app (ADR 0018).
 *
 * - Só a chave **pública** (`EXPO_PUBLIC_SUPABASE_ANON_KEY`): as permissões vêm da sessão
 *   do usuário + RLS. Nunca use a chave secreta (service_role) no app.
 * - A sessão fica guardada criptografada no celular (`storage/session-storage.ts`) e é
 *   renovada automaticamente.
 * - Sem links de e-mail: `detectSessionInUrl` desligado (a confirmação é por código).
 *
 * `null` quando a URL ou a chave não estão configuradas: o app funciona sem conta.
 */
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(env.supabaseUrl, env.supabaseAnonKey, {
      auth: {
        storage: sessionStorage,
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
    })
  : null;

// No celular, a renovação automática da sessão só roda com o app aberto (recomendação do
// Supabase para React Native). Na web, o próprio cliente cuida disso.
if (supabase && Platform.OS !== 'web') {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') supabase.auth.startAutoRefresh();
    else supabase.auth.stopAutoRefresh();
  });
}
