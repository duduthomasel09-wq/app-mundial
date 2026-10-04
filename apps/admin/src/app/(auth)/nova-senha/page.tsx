import {
  NEW_PASSWORD_ERRORS,
  PASSWORD_UPDATE_ERRORS,
  type NewPasswordError,
  type PasswordUpdateError,
} from '@gfg/core';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { Text } from '@/components/ui';
import { getPasswordRecoveryUser } from '@/lib/auth/recovery';
import { isPasswordRecoveryEnabled } from '@/lib/env';
import { t } from '@/lib/i18n';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { AuthCard } from '../AuthCard';
import { NewPasswordForm } from './NewPasswordForm';

// Depende da sessão de recuperação de quem acessa: lida a cada acesso.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: t('admin.newPassword.title'),
};

/**
 * Definir a nova senha (ADR 0017). Só abre logo depois do link do e-mail
 * (`/auth/confirmar`); sem isso, volta para "esqueci minha senha" com o aviso de link
 * inválido. Não depende de papel: quem não é editor/admin troca a senha, mas continua sem
 * acesso ao painel.
 */
export default async function NewPasswordPage() {
  const supabase = await createSupabaseServerClient();
  if (!supabase || !isPasswordRecoveryEnabled) redirect('/login');

  const user = await getPasswordRecoveryUser(supabase);
  if (!user) redirect('/esqueci-senha?erro=link_invalid');

  const errors = Object.fromEntries(
    [...NEW_PASSWORD_ERRORS, ...PASSWORD_UPDATE_ERRORS].map((code) => [
      code,
      t(`admin.newPassword.errors.${code}`),
    ]),
  ) as Record<NewPasswordError | PasswordUpdateError, string>;

  return (
    <AuthCard title={t('admin.newPassword.title')}>
      <Text tone="muted" align="center">
        {t('admin.newPassword.intro', { email: user.email ?? '' })}
      </Text>
      <NewPasswordForm
        labels={{
          password: t('admin.newPassword.password'),
          confirmation: t('admin.newPassword.confirmation'),
          hint: t('admin.newPassword.hint'),
          submit: t('admin.newPassword.submit'),
          submitting: t('admin.newPassword.submitting'),
          errors,
        }}
      />
    </AuthCard>
  );
}
