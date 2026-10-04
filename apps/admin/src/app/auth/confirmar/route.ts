import { redirect } from 'next/navigation';
import type { NextRequest } from 'next/server';

import { markPasswordRecovery } from '@/lib/auth/recovery';
import { isPasswordRecoveryEnabled } from '@/lib/env';
import { createSupabaseServerClient } from '@/lib/supabase/server';

// Cada link é único: nunca gerar como página estática nem guardar em cache.
export const dynamic = 'force-dynamic';

/** Tamanho máximo aceito para o `token_hash` (os do Supabase têm bem menos). */
const TOKEN_HASH_MAX_LENGTH = 256;

const LINK_INVALID = '/esqueci-senha?erro=link_invalid';

/**
 * Destino do link do e-mail de recuperação de senha (ADR 0017):
 * `/auth/confirmar?token_hash=…&type=recovery`.
 *
 * - Valida o `token_hash` no Supabase (`verifyOtp`, tipo `recovery`). O link é de uso
 *   único e funciona em qualquer navegador ou aparelho.
 * - Sucesso: cria a sessão (cookies), grava a marca de recuperação e redireciona para
 *   `/nova-senha` — uma URL **sem** o token.
 * - Link inválido, adulterado, vencido ou já usado: `/esqueci-senha` com a mensagem e a
 *   opção de pedir outro link.
 * - Destinos fixos: nenhum parâmetro `next=`/redirect da URL é aceito. O token nunca é
 *   registrado em log.
 */
export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  if (!supabase || !isPasswordRecoveryEnabled) redirect('/login');

  const tokenHash = request.nextUrl.searchParams.get('token_hash');
  const type = request.nextUrl.searchParams.get('type');
  if (!tokenHash || tokenHash.length > TOKEN_HASH_MAX_LENGTH || type !== 'recovery') {
    redirect(LINK_INVALID);
  }

  const { data, error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type: 'recovery',
  });
  if (error || !data.user) redirect(LINK_INVALID);

  await markPasswordRecovery(data.user.id);
  redirect('/nova-senha');
}
