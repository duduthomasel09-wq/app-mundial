import {
  decideAppRoute,
  isEmailNotConfirmed,
  isExistingAccountSignUpError,
  mapAppAuthError,
  mapOtpError,
  parseOnboardingPreferences,
  parseOtpCode,
  parseSignInInput,
  parseSignUpInput,
  preferencesFromProfile,
  signUpMetadata,
  type AppAuthError,
  type AppRoute,
  type OnboardingPreferences,
  type ProfilePreferencesRow,
} from '@gfg/core';
import type { AuthError, Session } from '@supabase/supabase-js';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { applyAppLocale } from '@/lib/i18n';
import { loadLocalPreferences, saveLocalPreferences } from '@/lib/preferences';
import { supabase } from '@/lib/supabase';
import { fetchProfile, saveProfilePreferences } from './profile';

/**
 * Estado de conta e preferências do app (ADR 0018).
 *
 * - Conta **opcional**: o onboarding vem primeiro para todos; sem conta, as escolhas ficam
 *   no aparelho; com conta, ficam no perfil do Supabase.
 * - As entradas na conta (cadastro confirmado e login) passam por estas ações, que gravam
 *   sessão + perfil de uma vez — a tela nunca "pisca" entre rotas.
 * - Nada aqui registra senha, token, código ou e-mail em log.
 */

export type ActionResult<T extends object = object> =
  ({ ok: true } & T) | { ok: false; error: AppAuthError };

type Status = 'loading' | 'ready' | 'error';

interface InternalState {
  status: Status;
  session: Session | null;
  profile: ProfilePreferencesRow | null;
  local: OnboardingPreferences | null;
  /** E-mail aguardando o código de confirmação. Só na memória (nunca na URL ou no disco). */
  pendingEmail: string | null;
}

export interface AppSessionValue {
  status: Status;
  route: AppRoute;
  isConfigured: boolean;
  signedIn: boolean;
  email: string | null;
  profile: ProfilePreferencesRow | null;
  localPreferences: OnboardingPreferences | null;
  pendingEmail: string | null;
  retry: () => void;
  signUp: (
    email: string,
    password: string,
    confirmation: string,
  ) => Promise<ActionResult<{ needsCode: boolean }>>;
  verifyCode: (code: string) => Promise<ActionResult>;
  resendCode: () => Promise<ActionResult>;
  signIn: (email: string, password: string) => Promise<ActionResult<{ needsCode: boolean }>>;
  signOut: () => Promise<void>;
  saveOnboarding: (preferences: OnboardingPreferences) => Promise<ActionResult>;
  clearPendingEmail: () => void;
}

const AppSessionContext = createContext<AppSessionValue | null>(null);

const NOT_CONFIGURED = { ok: false, error: 'not_configured' } as const;

function authError(error: AuthError | null | undefined): AppAuthError {
  return mapAppAuthError(error?.code, error?.status);
}

/** Falha sem resposta do servidor (sem internet). */
const NETWORK = { ok: false, error: 'network' } as const;

/** Lê preferências do aparelho, a sessão guardada e o perfil. Nunca lança. */
async function loadInitialState(): Promise<
  Pick<InternalState, 'status' | 'session' | 'profile' | 'local'>
> {
  const local = await loadLocalPreferences();
  if (!supabase) return { status: 'ready', session: null, profile: null, local };
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error && error.status === 0) throw error;
    const session = data.session;
    const profile = session ? await fetchProfile(supabase, session.user.id) : null;
    return { status: 'ready', session, profile, local };
  } catch {
    return { status: 'error', session: null, profile: null, local };
  }
}

export function AppSessionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<InternalState>({
    status: 'loading',
    session: null,
    profile: null,
    local: null,
    pendingEmail: null,
  });
  // Ao abrir (e em "tentar de novo"): preferências do aparelho, sessão guardada e perfil.
  const [loadCount, setLoadCount] = useState(0);
  useEffect(() => {
    let active = true;
    void loadInitialState().then((loaded) => {
      if (active) setState((current) => ({ ...current, ...loaded }));
    });
    return () => {
      active = false;
    };
  }, [loadCount]);

  useEffect(() => {
    if (!supabase) return;
    // Só reage a mudanças que não vêm das ações abaixo: saída (ex.: sessão expirada) e
    // renovação do token. Entradas na conta passam pelas ações (sessão + perfil juntos).
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setState((current) => ({ ...current, session: null, profile: null }));
      } else if (event === 'TOKEN_REFRESHED' && session) {
        setState((current) =>
          current.session?.user.id === session.user.id ? { ...current, session } : current,
        );
      }
    });
    return () => data.subscription.unsubscribe();
  }, []);

  // Idioma: perfil > escolha no aparelho > celular (ADR 0018).
  const profileLocale = state.profile?.locale;
  const localLocale = state.local?.locale;
  useEffect(() => {
    applyAppLocale(profileLocale, localLocale);
  }, [profileLocale, localLocale]);

  /**
   * Conclui a entrada na conta: lê o perfil e grava sessão + perfil juntos. Logo depois de
   * confirmar o cadastro, completa o perfil com as escolhas do onboarding feitas no
   * aparelho (as mesmas enviadas nos metadados do cadastro).
   */
  const completeSignIn = useCallback(
    async (session: Session, completeWithLocal: boolean): Promise<ActionResult> => {
      if (!supabase) return NOT_CONFIGURED;
      try {
        let profile = await fetchProfile(supabase, session.user.id);
        const local = state.local;
        if (completeWithLocal && local && profile && !preferencesFromProfile(profile)) {
          profile = await saveProfilePreferences(supabase, session.user.id, local);
        }
        setState((current) => ({ ...current, session, profile, pendingEmail: null }));
        return { ok: true };
      } catch {
        // Entrou, mas o perfil não carregou: mostra a tela de erro com "tentar de novo".
        setState((current) => ({
          ...current,
          status: 'error',
          session,
          profile: null,
          pendingEmail: null,
        }));
        return { ok: true };
      }
    },
    [state.local],
  );

  const signUp = useCallback<AppSessionValue['signUp']>(
    async (email, password, confirmation) => {
      if (!supabase) return NOT_CONFIGURED;
      const input = parseSignUpInput(email, password, confirmation);
      if (!input.ok) return { ok: false, error: input.error };
      try {
        const { data, error } = await supabase.auth.signUp({
          email: input.value.email,
          password: input.value.password,
          options: { data: signUpMetadata(state.local) },
        });
        // TEMPORÁRIO (diagnóstico do cadastro no Expo Go): só código, status e mensagem do
        // erro — nunca e-mail, senha, token, URL ou chave. Remover depois do diagnóstico.
        if (error && __DEV__) {
          console.warn('[diagnóstico signUp]', {
            code: error.code,
            status: error.status,
            message: error.message,
          });
        }
        // E-mail já cadastrado: mesma resposta de um cadastro novo (tela do código), sem
        // revelar que a conta existe. Nenhum código é enviado nesse caso.
        if (isExistingAccountSignUpError(error?.code)) {
          setState((current) => ({ ...current, pendingEmail: input.value.email }));
          return { ok: true, needsCode: true };
        }
        if (error) return { ok: false, error: authError(error) };
        // Sem confirmação de e-mail (ex.: Supabase local), a sessão já vem pronta.
        if (data.session) {
          const result = await completeSignIn(data.session, true);
          return result.ok ? { ok: true, needsCode: false } : result;
        }
        // Com confirmação ligada, a tela sempre pede o código.
        setState((current) => ({ ...current, pendingEmail: input.value.email }));
        return { ok: true, needsCode: true };
      } catch {
        return NETWORK;
      }
    },
    [completeSignIn, state.local],
  );

  const verifyCode = useCallback<AppSessionValue['verifyCode']>(
    async (code) => {
      if (!supabase) return NOT_CONFIGURED;
      const email = state.pendingEmail;
      const token = parseOtpCode(code);
      if (!email || !token) return { ok: false, error: 'code_invalid' };
      try {
        const { data, error } = await supabase.auth.verifyOtp({ email, token, type: 'signup' });
        if (error || !data.session)
          return { ok: false, error: mapOtpError(error?.code, error?.status) };
        return completeSignIn(data.session, true);
      } catch {
        return NETWORK;
      }
    },
    [completeSignIn, state.pendingEmail],
  );

  const resendCode = useCallback<AppSessionValue['resendCode']>(async () => {
    if (!supabase) return NOT_CONFIGURED;
    const email = state.pendingEmail;
    if (!email) return { ok: false, error: 'invalid_email' };
    try {
      const { error } = await supabase.auth.resend({ type: 'signup', email });
      // Só o limite de envios aparece; qualquer outro erro responde "enviado" (não revela
      // se a conta existe nem se já foi confirmada).
      if (error && authError(error) === 'rate_limited') return { ok: false, error: 'rate_limited' };
      return { ok: true };
    } catch {
      return NETWORK;
    }
  }, [state.pendingEmail]);

  const signIn = useCallback<AppSessionValue['signIn']>(
    async (email, password) => {
      if (!supabase) return NOT_CONFIGURED;
      const input = parseSignInInput(email, password);
      if (!input) return { ok: false, error: 'invalid_input' };
      try {
        const { data, error } = await supabase.auth.signInWithPassword(input);
        if (isEmailNotConfirmed(error?.code)) {
          // Só acontece com a senha certa: leva para o código e envia um novo.
          setState((current) => ({ ...current, pendingEmail: input.email }));
          await supabase.auth.resend({ type: 'signup', email: input.email }).catch(() => null);
          return { ok: true, needsCode: true };
        }
        if (error || !data.session) return { ok: false, error: authError(error) };
        const result = await completeSignIn(data.session, false);
        return result.ok ? { ok: true, needsCode: false } : result;
      } catch {
        return NETWORK;
      }
    },
    [completeSignIn],
  );

  const signOut = useCallback(async () => {
    try {
      await supabase?.auth.signOut({ scope: 'local' });
    } catch {
      // A sessão local é apagada mesmo sem internet.
    }
    setState((current) => ({ ...current, session: null, profile: null, pendingEmail: null }));
  }, []);

  const saveOnboarding = useCallback<AppSessionValue['saveOnboarding']>(
    async (preferences) => {
      const valid = parseOnboardingPreferences(preferences);
      if (!valid) return { ok: false, error: 'invalid_input' };
      // Sempre no aparelho (vale sem conta e depois de sair); com conta, também no perfil.
      await saveLocalPreferences(valid);
      setState((current) => ({ ...current, local: valid }));
      const session = state.session;
      if (!session || !supabase) return { ok: true };
      try {
        const profile = await saveProfilePreferences(supabase, session.user.id, valid);
        setState((current) => ({ ...current, profile }));
        return { ok: true };
      } catch {
        return { ok: false, error: 'unknown' };
      }
    },
    [state.session],
  );

  const clearPendingEmail = useCallback(() => {
    setState((current) => ({ ...current, pendingEmail: null }));
  }, []);

  const value = useMemo<AppSessionValue>(() => {
    const signedIn = Boolean(state.session);
    return {
      status: state.status,
      route: decideAppRoute({
        signedIn,
        profileComplete: Boolean(preferencesFromProfile(state.profile)),
        localComplete: Boolean(state.local),
      }),
      isConfigured: Boolean(supabase),
      signedIn,
      email: state.session?.user.email ?? null,
      profile: state.profile,
      localPreferences: state.local,
      pendingEmail: state.pendingEmail,
      retry: () => {
        setState((current) => ({ ...current, status: 'loading' }));
        setLoadCount((count) => count + 1);
      },
      signUp,
      verifyCode,
      resendCode,
      signIn,
      signOut,
      saveOnboarding,
      clearPendingEmail,
    };
  }, [state, signUp, verifyCode, resendCode, signIn, signOut, saveOnboarding, clearPendingEmail]);

  return <AppSessionContext.Provider value={value}>{children}</AppSessionContext.Provider>;
}

export function useAppSession(): AppSessionValue {
  const value = useContext(AppSessionContext);
  if (!value) throw new Error('useAppSession precisa estar dentro de <AppSessionProvider>.');
  return value;
}
