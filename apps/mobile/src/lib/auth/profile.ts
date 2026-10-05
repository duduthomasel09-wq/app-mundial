import { toProfileUpdate, type OnboardingPreferences, type ProfilePreferencesRow } from '@gfg/core';
import type { SupabaseClient } from '@supabase/supabase-js';

/** Colunas do perfil que o app usa (a RLS só deixa ler e alterar o próprio). */
const PROFILE_COLUMNS = 'locale, country_code, currency_code, unit_system, onboarding_completed_at';

/** Lê o perfil do usuário. Erro de rede/banco → lança; perfil inexistente → `null`. */
export async function fetchProfile(
  client: SupabaseClient,
  userId: string,
): Promise<ProfilePreferencesRow | null> {
  const { data, error } = await client
    .from('profiles')
    .select(PROFILE_COLUMNS)
    .eq('user_id', userId)
    .maybeSingle<ProfilePreferencesRow>();
  if (error) throw new Error('profile_unavailable');
  return data;
}

/**
 * Grava as preferências do onboarding no perfil e marca o onboarding como concluído.
 * Só altera colunas editáveis. Perfil inexistente ou erro → lança (a tela mostra erro).
 */
export async function saveProfilePreferences(
  client: SupabaseClient,
  userId: string,
  preferences: OnboardingPreferences,
): Promise<ProfilePreferencesRow> {
  const { data, error } = await client
    .from('profiles')
    .update(toProfileUpdate(preferences, new Date()))
    .eq('user_id', userId)
    .select(PROFILE_COLUMNS)
    .maybeSingle<ProfilePreferencesRow>();
  if (error || !data) throw new Error('profile_unavailable');
  return data;
}
